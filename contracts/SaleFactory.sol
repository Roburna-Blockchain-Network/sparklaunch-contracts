// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./SparkLaunchSale.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import 'hardhat/console.sol';


contract SalesFactory is Ownable {
    IAdmin public admin;
    address payable public feeAddr;
    uint256 public fee;
    uint256 public serviceFee;
    mapping(uint256 => address) public saleIdToAddress;
    mapping(address => address) public saleAddressToSaleOwner;

    // Expose so query can be possible only by position as well
    address[] public allSales;

    event SaleDeployed(address saleContract);
    event SaleOwnerAndTokenSetInFactory(
        address sale,
        address saleOwner,
        address saleToken
    );
    event LogSetFee(uint256 newFee);
    event LogSetFeeAddr(address newAddress);
    event LogWithdrawalBNB(address account, uint256 amount);

    modifier onlyAdmin() {
        require(admin.isAdmin(msg.sender), "Only Admin can deploy sales");
        _;
    }

    constructor(address _adminContract) {
        require(_adminContract != address(0), "Invalid address");
        admin = IAdmin(_adminContract);
    }

    function setFee(uint256 _fee) public onlyAdmin {
        require(fee != _fee, "Already set to this value");
        fee = _fee;
        emit LogSetFee(_fee);
    }

    function setServiceFee(uint256 _serviceFee) public onlyAdmin {
        require(serviceFee != _serviceFee, "Already set to this value");
        serviceFee = _serviceFee;
        emit LogSetFee(_serviceFee);
    }

    function setFeeAddr(address payable _feeAddr) public onlyAdmin {
        require(_feeAddr != address(0), "address zero validation");
        feeAddr = _feeAddr;
        emit LogSetFeeAddr(_feeAddr);
    }

    function calculateMaxTokensForLiquidity(
        uint256 hardCap,
        uint256 pcsListingRate
    ) public pure returns (uint256) {
       
        uint256 _tokensAmountForLiquidity = (hardCap * pcsListingRate) /
            10**18;
            
        return (_tokensAmountForLiquidity);
    }

    function deployNormalSale(
        address[] memory setupAddys,
        uint256[] memory uints,
        address[] memory wlAddys,
        uint256[] memory tiers4WL,
        uint256[] memory startTimes,
        bool isPublic
    ) external payable {
        require(msg.value >= fee, "Not enough bnb sent");

        uint256 lpTokens = calculateMaxTokensForLiquidity(
            uints[9],
            uints[3]
        );
        
        uint256 tokensToSell = (uints[9] * uints[5]) / 10**18;
        uint256 amount = tokensToSell + lpTokens;
        console.log(lpTokens, 'lpTokens');
        console.log(amount);

        IERC20(setupAddys[2]).transferFrom(
            setupAddys[3],
            address(this),
            amount
        );

        SparklaunchSale sale = new SparklaunchSale(
            setupAddys,
            uints,
            wlAddys,
            tiers4WL,
            startTimes,
            feeAddr,
            serviceFee,
            isPublic
        );

        
        uint256 id = allSales.length;

        saleIdToAddress[id] = address(sale);
        saleAddressToSaleOwner[address(sale)] = msg.sender;

        IERC20(setupAddys[2]).approve(address(sale), amount);
    
        sale.depositTokens();
        allSales.push(address(sale));
        feeAddr.transfer(msg.value);

        emit SaleDeployed(address(sale));
    }

    // Function to return number of pools deployed
    function getNumberOfSalesDeployed() external view returns (uint256) {
        return allSales.length;
    }

    function getSaleAddress(uint256 id) external view returns (address) {
        return saleIdToAddress[id];
    }

    // Function
    function getLastDeployedSale() external view returns (address) {
        //
        if (allSales.length > 0) {
            return allSales[allSales.length - 1];
        }
        return address(0);
    }

    // Function to get all sales
    function getAllSales(uint256 startIndex, uint256 endIndex)
        external
        view
        returns (address[] memory)
    {
        require(endIndex > startIndex, "Bad input");
        require(endIndex <= allSales.length, "access out of rage");

        address[] memory sales = new address[](endIndex - startIndex);
        uint256 index = 0;

        for (uint256 i = startIndex; i < endIndex; i++) {
            sales[index] = allSales[i];
            index++;
        }

        return sales;
    }

    function withdrawBNB(address payable account, uint256 amount)
        external
        onlyAdmin
    {
        require(amount <= (address(this)).balance, "Incufficient funds");
        account.transfer(amount);
        emit LogWithdrawalBNB(account, amount);
    }
}

