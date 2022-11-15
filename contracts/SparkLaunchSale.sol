// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interfaces/IDEXRouter.sol";
import "./interfaces/IDEXFactory.sol";
import "./interfaces/IDEXPair.sol";
import 'hardhat/console.sol';



interface IAdmin {
    function isAdmin(address user) external view returns (bool);
}


contract SparklaunchSale {
    using SafeMath for uint256;

    IDEXRouter public defaultDexRouter;
    IDEXPair public defaultPair;
    uint256 public lpPercentage;
    uint256 public tokensAmountForLiquidity;
    uint256 public BNBAmountForLiquidity;
    uint256 public pcsListingRate;
    uint256 public liquidityUnlockTime;
    uint256 public liquidityLockPeriod;
    uint8 public decimals;
    address public factory;

    // Admin contract
    IAdmin public admin;
    uint256 public serviceFee;
    address public feeAddr;
    bool public isSaleSuccessful;
    bool public saleFinished;
    bool public lpWithdrawn;
    bool public leftoverWithdrawnCancelledSale;
    uint256 public minParticipation; 
    uint256 public maxParticipation; 
    uint256 public saleStartTime;
    uint256 public publicRoundStartDelta;
    address immutable dead = 0x000000000000000000000000000000000000dEaD;
    

    struct Sale {
        // Token being sold
        IERC20 token;
        // Is sale created
        bool isCreated;
        // Are earnings withdrawn
        bool earningsWithdrawn;
        // Is leftover withdrawn
        bool leftoverWithdrawn;
        // Have tokens been deposited
        bool tokensDeposited;
        // Address of sale owner
        address saleOwner;                   //+
        // Price of the token quoted in BNB
        uint256 tokenPriceInBNB;
        // Total tokens being sold
        uint256 totalTokensSold;
        // Total BNB Raised
        uint256 totalBNBRaised;
        // Sale end time
        uint256 saleEnd;
        // Hard cap
        uint256 hardCap;
        // Soft cap
        uint256 softCap;
    }

    // Participation structure
    struct Participation {
        uint256 amountBought;
        uint256 amountBNBPaid;
        uint256 tierId;
        bool areTokensWithdrawn;
        bool areBNBsWithdrawn;
    }

    // Sale
    Sale public sale;
    
    // Number of users participated in the sale.
    uint256 public numberOfParticipants;

    // Array storing IDS of tiers (IDs start from 1, so they can't be mapped as array indexes)
    uint256[] public tierIds;
    // Mapping tier Id to tier start time
    mapping(uint256 => uint256) public tierIdToTierStartTime;
   
    mapping(address => Participation) public userToParticipation;
    // mapping if user is participated or not
    mapping(address => bool) public isParticipated;
    // mapping user to tier
    mapping(address => uint256) public tier;
    

    // Restricting calls only to sale owner
    modifier onlySaleOwner() {
        require(msg.sender == sale.saleOwner, "Restricted to sale owner.");
        _;
    }

    // Restricting calls only to factory
    modifier onlyFactory() {
        require(msg.sender == factory, "Restricted to factory.");
        _;
    }

    // Restricting calls only to sale owner or Admin
    modifier onlySaleOwnerOrAdmin() {
        require(msg.sender == sale.saleOwner || admin.isAdmin(msg.sender), "Restricted to sale owner and admin.");
        _;
    }

    // Restricting calls only to sale admin
    modifier onlyAdmin() {
        require(
            admin.isAdmin(msg.sender),
            "Only admin can call this function."
        );
        _;
    }


    // Events
    event TokensSold(address user, uint256 amount);
    event TokensWithdrawn(address user, uint256 amount);
    event SaleCreated(
        address saleOwner,
        uint256 tokenPriceInBNB,
        uint256 saleEnd,
        uint256 _hardCap,
        uint256 _softCap
    );
    event LogwithdrawUserFundsIfSaleCancelled(address user, uint256 amount);
    event LogFinishSale(bool isSaleSuccessful);
    event RoundAdded(uint256 _tierId, uint256 _startTime);
    event LogWithdrawLP(uint256 amount);
    event LogLockLiquidity(uint256 timeStart, uint256 unlockTime);
    event LogChangeLpPercentage(uint256 _percentage);
    event LogBurn(uint256 _amount);
    event LogEditMaxParticipation(uint256 maxP);
    event LogEditMinParticipation(uint256 minP);
    event LogGrantATier(address user, uint256 tier);
    event LogChangeSaleOwner(address newOwner);
    

    constructor(
        address [] memory setupAddys,
        uint256 [] memory uints,
        address [] memory wlAddys,
        uint256 [] memory tiers4WL,
        uint256 [] memory startTimes,
        address _feeAddr,
        uint256 _serviceFee
    ){
        require(setupAddys[1] != address(0), "Address zero validation");
        require(setupAddys[0] != address(0), "Address zero validation");
        require(uints[2] >= 5100 && uints[2] <= 10000, "Min 51%, Max 100%");
        require(uints[0] < uints[1], "Max participation should be greater than min participation");
        IDEXRouter _dexRouter = IDEXRouter(setupAddys[0]);
        defaultDexRouter = _dexRouter;
        admin = IAdmin(setupAddys[1]);
        feeAddr = _feeAddr;
        serviceFee = _serviceFee;
        minParticipation = uints[0];
        maxParticipation = uints[1];
        lpPercentage = uints[2];
        pcsListingRate = uints[3];
        liquidityLockPeriod = uints[4];
        factory = msg.sender;
        setSaleParams(setupAddys[2],setupAddys[3],uints[5],uints[6],uints[7],uints[8],uints[9],uints[10]);
        grantATierMultiply(wlAddys, tiers4WL);
        setRounds(startTimes);     
    }

    
    /// @notice     Admin function to set sale parameters
    function setSaleParams(
        address _token,
        address _saleOwner,
        uint256 _tokenPriceInBNB,
        uint256 _saleEnd,
        uint256 _saleStart,
        uint256 _publicRoundStartDelta,
        uint256 _hardCap,
        uint256 _softCap
    )
        private
    {
        require(!sale.isCreated, "Sale already created.");
        require(_token != address(0), "setSaleParams: Token address can not be 0.");
        require(
            _saleOwner != address(0),
            "Invalid sale owner address."
        );
        require(
            _tokenPriceInBNB != 0 &&
            _hardCap != 0 &&
            _softCap != 0 &&
            _saleEnd > block.timestamp,
            "Invalid input."
        );
        require(_saleEnd <= block.timestamp + 8640000, "Max sale duration is 100 days");
        require(_saleStart >= block.timestamp, "Sale start should be in the future");
        require(_saleStart < _saleEnd, "Sale start should be before sale end");

        decimals = IERC20Metadata(_token).decimals();
        
        // Set params
        sale.token = IERC20(_token);
        sale.isCreated = true;
        sale.saleOwner = _saleOwner;
        sale.tokenPriceInBNB = _tokenPriceInBNB;
        sale.saleEnd = _saleEnd;
        sale.hardCap = _hardCap;
        sale.softCap = _softCap;
        publicRoundStartDelta = _publicRoundStartDelta;
        saleStartTime = _saleStart;


        // Emit event
        emit SaleCreated(
            sale.saleOwner,
            sale.tokenPriceInBNB,
            sale.saleEnd,
            sale.hardCap,
            sale.softCap
        );
    }

    function changeLpPercentage(uint256 _lpPercentage) external onlySaleOwner{
        require(_lpPercentage >= 5100 && _lpPercentage <= 10000, "Min 51%, Max 100%");
        require(block.timestamp < saleStartTime, "Sale already started");
        lpPercentage = _lpPercentage;
        emit LogChangeLpPercentage(_lpPercentage);
    }

    function changeSaleOwner(address _saleOwner) external onlySaleOwner{
        require(block.timestamp < saleStartTime, "Sale already started");
        require(_saleOwner != sale.saleOwner, "Already set to this value");
        require(_saleOwner != address(0), "Address 0 validation");
        sale.saleOwner = _saleOwner;
        emit LogChangeSaleOwner(_saleOwner);
    }

    function grantATierMultiply4SaleOwner(address[] memory addys, uint256[] memory tiers) external onlySaleOwner {
        require(block.timestamp < saleStartTime, "Sale already started");
        require(addys.length == tiers.length, "Invalid input");
        for (uint256 i = 0; i < addys.length; i++){
            grantATier(addys[i], tiers[i]);
        }
    }

    function grantATierMultiply(address[] memory addys, uint256[] memory tiers) private {
        require(block.timestamp < saleStartTime, "Sale already started");
        require(addys.length == tiers.length, "Invalid input");
        for (uint256 i = 0; i < addys.length; i++){
            grantATier(addys[i], tiers[i]);
        }
    }

    function grantATier(address user, uint256 _tier) private {
        require(_tier <= 5, "Max tier is 5");
        require(_tier != 0, "Tier can't be 0");
        require(user != address(0), "Zero address validation");
        tier[user] = _tier;
        emit LogGrantATier(user, _tier);
    }

    function calculateMaxTokensForLiquidity() public view returns(uint256){
        uint256 maxBNBAmount = (sale.hardCap * sale.tokenPriceInBNB)/ 10**decimals;
        uint256 _tokensAmountForLiquidity = (maxBNBAmount * pcsListingRate)/ 10**18;
        return(_tokensAmountForLiquidity);
    }

    // Function for owner to deposit tokens, can be called only once.
    function depositTokens()
        external 
        onlyFactory
    {
        // Require that setSaleParams was called
        require(
            sale.hardCap > 0,
            "Sale parameters not set."
        );

        // Require that tokens are not deposited
        require(
            !sale.tokensDeposited,
            "Tokens already deposited."
        );

        // Mark that tokens are deposited
        sale.tokensDeposited = true;

        uint256 lpTokens = calculateMaxTokensForLiquidity();

        uint256 amount = sale.hardCap.add(lpTokens);

        // Perform safe transfer
        sale.token.transferFrom(
            msg.sender,
            address(this),
            amount
        );
    }

   
    // Participate function for manual participation
    function participate(
        uint256 tierId
    ) external payable {
        require(tierId <= 5, "Invalid tier id");
        require(msg.value >= minParticipation, "Amount should be greater than minParticipation");
        require(msg.value <= maxParticipation, "Amount should be not greater than maxParticipation");
        _participate(msg.sender, msg.value, tierId);
    }
 
    
    // Function to participate in the sales
    function _participate(
        address user,
        uint256 amountBNB, 
        uint256 _tierId
    ) private {
       ///Check user haven't participated before
       require(!isParticipated[user], "Already participated.");
       require(tier[user] == _tierId, "Wrong Round");
       require(block.timestamp >= saleStartTime, "Sale haven't started yet");
       require(block.timestamp >= tierIdToTierStartTime[_tierId], "Your round haven't started yet");
       if(_tierId == 0){
           require(block.timestamp >= tierIdToTierStartTime[5] + publicRoundStartDelta);
       }
       require(sale.tokensDeposited == true, "Sale tokens were not deposited");
       require(block.timestamp <= sale.saleEnd, "Sale finished");

        // Compute the amount of tokens user is buying
        uint256 amountOfTokensBuying =
            (amountBNB).mul(uint(10) ** IERC20Metadata(address(sale.token)).decimals()).div(sale.tokenPriceInBNB);

        // Must buy more than 0 tokens
        require(amountOfTokensBuying > 0, "Can't buy 0 tokens");


        // Require that amountOfTokensBuying is less than sale token leftover cap
        require(
            amountOfTokensBuying <= sale.hardCap.sub(sale.totalTokensSold),
            "Not enough tokens to sell."
        );

        // Increase amount of sold tokens
        sale.totalTokensSold = sale.totalTokensSold.add(amountOfTokensBuying);

        // Increase amount of BNB raised
        sale.totalBNBRaised = sale.totalBNBRaised.add(amountBNB);

        // Create participation object
        Participation memory p = Participation({
            amountBought: amountOfTokensBuying,
            amountBNBPaid: amountBNB,
            tierId: _tierId,
            areTokensWithdrawn: false,
            areBNBsWithdrawn: false
        });

        // Add participation for user.
        userToParticipation[user] = p;
        // Mark user is participated
        isParticipated[user] = true;
        // Increment number of participants in the Sale.
        numberOfParticipants++;

        emit TokensSold(user, amountOfTokensBuying);
    }

    // Expose function where user can withdraw sale tokens.
    function withdraw() external {
        require(block.timestamp > sale.saleEnd, "Sale is running");
        require(saleFinished == true && isSaleSuccessful == true, "Sale was cancelled");
        require(isParticipated[msg.sender], "User is not a participant.");

        // Retrieve participation from storage
        Participation storage p = userToParticipation[msg.sender];

        require(p.areTokensWithdrawn == false, "Already withdrawn");

        uint256 amountWithdrawing = p.amountBought;
        

        p.areTokensWithdrawn = true;


        if(amountWithdrawing > 0) {
            // Transfer tokens to user
            sale.token.transfer(msg.sender, amountWithdrawing);
            // Trigger an event
            emit TokensWithdrawn(msg.sender, amountWithdrawing);
        }
    }

    function editMaxParticipation(uint256 _maxP) external onlySaleOwner{
        require(block.timestamp < saleStartTime, "Sale already started");
        maxParticipation = _maxP;
        emit LogEditMaxParticipation(_maxP);
    }

    function editMinParticipation(uint256 _minP) external onlySaleOwner{
        require(block.timestamp < saleStartTime, "Sale already started");
        minParticipation = _minP;
        emit LogEditMaxParticipation(_minP);
    }
   
    function finishSale() external onlySaleOwnerOrAdmin{
        require(block.timestamp >= sale.saleEnd, "Sale is not finished yet");
        require(saleFinished == false, "The function can be called only once");
        if(sale.totalTokensSold >= sale.softCap){
            BNBAmountForLiquidity = (sale.totalBNBRaised * lpPercentage) / 10000;
            tokensAmountForLiquidity = (BNBAmountForLiquidity * pcsListingRate) / 10**18;
            isSaleSuccessful = true;
            saleFinished = true;
            addLiquidity(tokensAmountForLiquidity, BNBAmountForLiquidity);
            lockLiquidity();
            burnTokens();
        } else{
            isSaleSuccessful = false;
            saleFinished = true;
            withdrawLeftoverIfSaleCancelled();
        }
        emit LogFinishSale(isSaleSuccessful);
    }

    function addLiquidity(uint256 tokenAmount, uint256 ethAmount) private {
        // approve token transfer to cover all possible scenarios
        sale.token.approve(address(defaultDexRouter), tokenAmount);
        // add the liquidity
        defaultDexRouter.addLiquidityETH{value: ethAmount}(
            address(sale.token),
            tokenAmount,
            0, // slippage is unavoidable
            0, // slippage is unavoidable
            address(this),
            block.timestamp + 60
        );
    }

    function lockLiquidity() private {
        liquidityUnlockTime = block.timestamp + liquidityLockPeriod;
        address _defaultPair = IDEXFactory(defaultDexRouter.factory()).getPair(address(sale.token), defaultDexRouter.WETH());
        defaultPair = IDEXPair(_defaultPair);
        emit LogLockLiquidity(block.timestamp, liquidityUnlockTime);
    }

    function withdrawLP() external onlySaleOwner{
        require(block.timestamp >= liquidityUnlockTime);
        require(lpWithdrawn != true, "Already withdrawn");
        uint256 amount = defaultPair.balanceOf(address(this));
        lpWithdrawn = true;
        defaultPair.transfer(sale.saleOwner, amount);
        emit LogWithdrawLP(amount);
    }
    
    // transfers bnb correctly
    function withdrawUserFundsIfSaleCancelled() external{
        require(saleFinished == true && isSaleSuccessful == false, "Sale wasn't cancelled.");
        require(isParticipated[msg.sender], "Did not participate.");
        require(block.timestamp >= sale.saleEnd, "Sale running");
        // Retrieve participation from storage
        Participation storage p = userToParticipation[msg.sender];
        require(p.areBNBsWithdrawn == false, "Already withdrawn");
        p.areBNBsWithdrawn = true;
        uint256 amountBNBWithdrawing = p.amountBNBPaid;
        safeTransferBNB(msg.sender, amountBNBWithdrawing);
        emit LogwithdrawUserFundsIfSaleCancelled(msg.sender, amountBNBWithdrawing);
    }


    function burnTokens() private {
        uint256 all = sale.token.balanceOf(address(this));
        uint256 need = sale.totalTokensSold;
        uint256 amountToBurn = all.sub(need);
        if(amountToBurn > 0){
            sale.token.transfer(
            dead,
            amountToBurn);
        }
        emit LogBurn(amountToBurn);
    }

    // Internal function to handle safe transfer
    function safeTransferBNB(address to, uint256 value) internal {
        (bool success, ) = to.call{value: value}(new bytes(0));
        require(success);
    }

    // Function to withdraw only earnings
    function withdrawEarnings() external onlySaleOwner {
        withdrawEarningsInternal();
    }

    // Function to withdraw earnings
    function withdrawEarningsInternal() private  {
        require(saleFinished == true && isSaleSuccessful == true, "Sale was cancelled");
        // Make sure sale ended
        require(block.timestamp >= sale.saleEnd,"Sale Running");

        // Make sure owner can't withdraw twice
        require(!sale.earningsWithdrawn,"can't withdraw twice");
        sale.earningsWithdrawn = true;
        // Earnings amount of the owner in BNB
        uint256 totalProfit = sale.totalBNBRaised.sub(BNBAmountForLiquidity);
        uint256 totalFee = _calculateServiceFee(totalProfit);
        uint256 saleOwnerProfit = totalProfit.sub(totalFee);

        safeTransferBNB(msg.sender, saleOwnerProfit);
        safeTransferBNB(feeAddr, totalFee);
    }

    function withdrawLeftoverIfSaleCancelled() private {
        require(saleFinished == true && isSaleSuccessful == false, "Sale wasnt cancelled");
        // Make sure sale ended
        require(block.timestamp >= sale.saleEnd);

        // Make sure owner can't withdraw twice
        require(!leftoverWithdrawnCancelledSale, "can't withdraw twice");
        leftoverWithdrawnCancelledSale = true;

        // Amount of tokens which are not sold
        uint256 leftover = sale.token.balanceOf(address(this));
    

        if (leftover > 0) {
            sale.token.transfer(msg.sender, leftover);
        }
    }

    /// @notice     Function to get participation for passed user address
    function getParticipation(address _user)
        external
        view
        returns (
            uint256,
            uint256,
            uint256,
            bool,
            bool
        )
    {
        Participation memory p = userToParticipation[_user];
        return (
            p.amountBought,
            p.amountBNBPaid,
            p.tierId,
            p.areTokensWithdrawn,
            p.areBNBsWithdrawn
        );
    }

    /// @notice     Function to remove stuck tokens from sale contract
    function removeStuckTokens(
        address token,
        address beneficiary
    )
        external
        onlyAdmin
    {
        // Require that token address does not match with sale token
        require(token != address(sale.token), "Can't withdraw sale token.");
        require(token != address(defaultPair), "Can't withdraw sale lps.");
        // Safe transfer token from sale contract to beneficiary
        IERC20(token).transfer(beneficiary, IERC20(token).balanceOf(address(this)));
    }

    function _calculateServiceFee(uint256 _amount)
        private
        view
        returns (uint256)
    {

        return _amount.mul(serviceFee).div(10**4);
    }

    function getNumberOfRegisteredUsers() external view returns(uint256) {
        return numberOfParticipants;
    }

    /// @notice     Setting rounds for sale.
    function setRounds(
        uint256[] memory startTimes
    )
        private
    {
        require(sale.isCreated);
        require(tierIds.length == 0, "Rounds set already.");
        require(startTimes.length == 5, "Should be 5 tiers");
        require(publicRoundStartDelta + startTimes[4] < sale.saleEnd, "Public round should start befire sale end");

        uint256 lastTimestamp = 0;

        require(startTimes[0] >= block.timestamp);

        for (uint256 i = 0; i < startTimes.length; i++) {
            require(startTimes[i] < sale.saleEnd, "Start time should be before sale end");
            require(startTimes[i] > lastTimestamp, "Start time should be after last start time");
            lastTimestamp = startTimes[i];

            // Compute round Id
            uint256 tierId = i + 1;

            // Push id to array of ids
            tierIds.push(tierId);


            // Map round id to round
            tierIdToTierStartTime[tierId] = startTimes[i];

            // Fire event
            emit RoundAdded(tierId, startTimes[i]);
        }
    }

    /// @notice     Get current round in progress.
    ///             If 0 is returned, means sale didn't start or it's ended.
    function getCurrentRound() public view returns (uint256) {
        uint256 i = 0;
        if (block.timestamp < tierIdToTierStartTime[tierIds[0]]) {
            return 0; // Sale didn't start yet.
        }

        while (
            (i + 1) < tierIds.length &&
            block.timestamp > tierIdToTierStartTime[tierIds[i + 1]]
        ) {
            i++;
        }

        if (block.timestamp >= sale.saleEnd) {
            return 0; // Means sale is ended
        }

        return tierIds[i];
    }

    // Function to act as a fallback and handle receiving BNB.
    receive() external payable {}
}

