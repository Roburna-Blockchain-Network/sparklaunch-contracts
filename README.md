# SalesFactory Contract Overview

The SalesFactory contract is used to create and manage SparkLaunch token sales. It includes features for setting up different types of sales, managing fees, and maintaining a registry of all sales created.
Constructor

   * constructor(address _adminContract): Initializes the contract.
      *  _adminContract: Address of the admin contract. It must be a valid Ethereum address and not the zero address.

## Key Functions
### Admin Functions

   * setFee(uint256 _fee)
      *  Sets the fee for deploying a sale. Only callable by an admin.
      *  _fee: The new fee amount in wei.

   * setServiceFee(uint256 _serviceFee)
       * Sets the service fee for a sale. Only callable by an admin.
       * _serviceFee: The new service fee amount.

   * setFeeAddr(address payable _feeAddr)
       * Sets the fee address where fees are sent. Only callable by an admin.
       * _feeAddr: The new fee address.

   * withdrawBNB(address payable account, uint256 amount)
       * Withdraws BNB from the contract. Only callable by an admin.
       * account: Address where the BNB will be sent.
       * amount: Amount of BNB to withdraw.

### Public Functions

   * deployNormalSale(address[] memory setupAddys, uint256[] memory uints, address[] memory wlAddys, uint256[] memory tiers4WL, uint256[] memory startTimes, bool isPublic)
       * Deploys a new token sale.
       * setupAddys: Array of setup addresses.
       * uints: Array of uint256 values for setup.
       * wlAddys: Array of whitelisted addresses.
       * tiers4WL: Array of whitelist tiers.
       * startTimes: Array of start times for the sale.
       * isPublic: Indicates if the sale is public or not.

   * calculateMaxTokensForLiquidity(uint256 hardCap, uint256 pcsListingRate)
       * Calculates the maximum tokens for liquidity.
       * hardCap: The hard cap of the sale.
       * pcsListingRate: The PancakeSwap listing rate.

### View Functions

   * getNumberOfSalesDeployed()
       * Returns the total number of sales deployed.

   * getSaleAddress(uint256 id)
       * Returns the address of a specific sale.
       * id: The index of the sale.

   * getLastDeployedSale()
       * Returns the address of the last deployed sale.

   * getAllSales(uint256 startIndex, uint256 endIndex)
       * Returns a list of all sales within a specified range.
       * startIndex: Start index.
       * endIndex: End index.

### Event Emitters

   * SaleDeployed(address saleContract)
   * SaleOwnerAndTokenSetInFactory(address sale, address saleOwner, address saleToken)
   * LogSetFee(uint256 newFee)
   * LogSetFeeAddr(address newAddress)
   * LogWithdrawalBNB(address account, uint256 amount)

## Usage Examples (Using ethers.js)

To interact with this contract, you'll need ethers.js installed in your environment and a wallet set up with some ETH for transaction fees.

```javascript

const { ethers } = require("ethers");

// Connect to the Ethereum network
const provider = ethers.getDefaultProvider('rinkeby'); // or another network

// Connect to your Ethereum wallet
const privateKey = "your-private-key";
const wallet = new ethers.Wallet(privateKey, provider);

// The address of the deployed SalesFactory contract
const salesFactoryAddress = "0x..."; 
const SalesFactory = new ethers.Contract(salesFactoryAddress, SalesFactoryABI, signer);

// Deploying a new sale
const deploySaleTx = await SalesFactory.deployNormalSale(setupAddys, uints, wlAddys, tiers4WL, startTimes, isPublic, { value: ethers.utils.parseEther("0.1") });
await deploySaleTx.wait();
```

# SalesFactoryERC20 Contract Overview

The SalesFactoryERC20 contract is used to create and manage ERC20 token sales. It allows for the setup of different types of sales, manages fees, and maintains a record of all sales created.
Constructor

   * constructor(address _adminContract): Initializes the contract.
       * _adminContract: Address of the admin contract. It must be a valid Ethereum address and not the zero address.

## Key Functions
### Admin Functions

   * setFee(uint256 _fee)
       * Sets the fee for deploying a sale. Only callable by an admin.
       * _fee: The new fee amount in wei.

   * setServiceFee(uint256 _serviceFee)
       * Sets the service fee for a sale. Only callable by an admin.
       * _serviceFee: The new service fee amount.

   * setFeeAddr(address payable _feeAddr)
       * Sets the fee address where fees are sent. Only callable by an admin.
       * _feeAddr: The new fee address.

   * withdrawBNB(address payable account, uint256 amount)
       * Withdraws BNB from the contract. Only callable by an admin.
       * account: Address where the BNB will be sent.
       * amount: Amount of BNB to withdraw.

### Public Functions

   * deployERC20Sale(address[] memory setupAddys, uint256[] memory uints, address[] memory wlAddys, uint256[] memory tiers4WL, uint256[] memory startTimes, bool isPublic)
        Deploys a new ERC20 token sale.
       * setupAddys: Array of setup addresses.
       * uints: Array of uint256 values for setup.
       * wlAddys: Array of whitelisted addresses.
       * tiers4WL: Array of whitelist tiers.
       * startTimes: Array of start times for the sale.
       * isPublic: Indicates if the sale is public or not.

   * calculateMaxTokensForLiquidity(uint256 hardCap, uint256 pcsListingRate, uint8 decimalsPaymentToken)
       * Calculates the maximum tokens for liquidity.
       * hardCap: The hard cap of the sale.
       * pcsListingRate: The listing rate.
       * decimalsPaymentToken: The decimals of the payment token.

### View Functions

   * getNumberOfSalesDeployed()
       * Returns the total number of sales deployed.

   * getSaleAddress(uint256 id)
       * Returns the address of a specific sale.
       * id: The index of the sale.

   * getLastDeployedSale()
       8 Returns the address of the last deployed sale.

   * getAllSales(uint256 startIndex, uint256 endIndex)
       * Returns a list of all sales within a specified range.
       * startIndex: Start index.
       * endIndex: End index.

### Event Emitters

   * SaleDeployed(address saleContract)
   * SaleOwnerAndTokenSetInFactory(address sale, address saleOwner, address saleToken)
   * LogSetFee(uint256 newFee)
   * LogSetFeeAddr(address newAddress)
   * LogWithdrawalBNB(address account, uint256 amount)

## Usage Examples (Using ethers.js)

To interact with this contract, you'll need ethers.js installed in your environment and a wallet set up with some ETH for transaction fees.

```javascript
const { ethers } = require("ethers");

// Connect to the Ethereum network
const provider = ethers.getDefaultProvider('rinkeby'); // or another network

// Connect to your Ethereum wallet
const privateKey = "your-private-key";
const wallet = new ethers.Wallet(privateKey, provider);

// The address of the deployed SalesFactoryERC20 contract
const salesFactoryERC20Address = "0x..."; 
const SalesFactoryERC20 = new ethers.Contract(salesFactoryERC20Address, SalesFactoryERC20ABI, signer);

// Deploying a new ERC20 sale
const deployERCSaleTx = await SalesFactoryERC20.deployERC20Sale(setupAddys, uints, wlAddys, tiers4WL, startTimes, isPublic, { value: ethers.utils.parseEther("0.1") });
await deployERCSaleTx.wait();
```

#SparklaunchSale Contract Overview

The SparklaunchSale contract is used to facilitate token sales. It supports different participation tiers, token purchase, and liquidity management post-sale. The contract includes functions for participating in the sale, withdrawing tokens, and handling sale proceeds.

## Constructor

   * constructor(address[] memory setupAddys, uint256[] memory uints, address[] memory wlAddys, uint256[] memory tiers4WL, uint256[] memory startTimes, address _feeAddr, uint256 _serviceFee, bool _isPublic): Initializes the contract.

   * setupAddys[] : 
1. Router address
2. admin contract address    
3. sale token address
4. sale owner address

   * uints[] :

1. min participation (with 18 decimals)
2. max participation (with 18 decimals)
3. lp percentage, from total of 10000, should be >= 5100 (51%) and <= 10000 (100%)
4. dex listing rate (how much tokens for 1 bnb) with 18 decimals
5. lpLockDelta , lp lock period
6. token price in bnb (wiith 18 decimals)
7. Sale end time (unix timestamp)
8. Sale satrt time (unix timestamp)
9. Public round start time delta. Public round start time calculates like : 5th tier start time + PublicRoundStartsDelta
10. HardCap in tokens
11. softCap in tokens 

## Key Functions
### Public and Restricted Functions

   * participate(uint256 tierId)
       * Allows users to participate in the token sale.
       * tierId: The tier ID for participation.

   * withdraw()
       * Allows users to withdraw purchased tokens after the sale.

   * finishSale()
       * Concludes the sale, manages liquidity, and handles remaining tokens. Can be called by the sale owner or an admin.

   * changeLpPercentage(uint256 _lpPercentage)
       * Changes the liquidity percentage. Can only be called by the sale owner.
       * _lpPercentage: New liquidity percentage.

   * withdrawUserFundsIfSaleCancelled()
       * Allows users to withdraw their funds if the sale is cancelled.

   * withdrawLP()
       * Withdraws liquidity pool tokens after the liquidity lock period. Can only be called by the sale owner.

### Admin Functions

   * Functions like removeStuckTokens, editMaxParticipation, editMinParticipation, and changeSaleOwner are intended for admin or sale owner use, providing control over key aspects of the sale.

### Event Emitters

   * The contract emits events like TokensSold, TokensWithdrawn, SaleCreated, etc., to signal various actions and state changes within the contract.

## Usage Examples (Using ethers.js)

To interact with the SparklaunchSale contract, you'll need ethers.js installed in your environment and a wallet set up with some ETH for transaction fees.

```javascript
const { ethers } = require("ethers");

// Connect to the Ethereum network
const provider = ethers.getDefaultProvider('rinkeby'); // or another network

// Connect to your Ethereum wallet
const privateKey = "your-private-key";
const wallet = new ethers.Wallet(privateKey, provider);

// The address of the deployed SparklaunchSale contract
const sparklaunchSaleAddress = "0x..."; 
const SparklaunchSale = new ethers.Contract(sparklaunchSaleAddress, SparklaunchSaleABI, signer);

// Participating in the sale
const participateTx = await SparklaunchSale.participate(tierId, { value: ethers.utils.parseEther("AMOUNT_IN_ETH") });
await participateTx.wait();
```

# SparklaunchSaleERC20 Contract Overview

The SparklaunchSaleERC20 contract is used to facilitate ERC20 token sales. It supports different participation tiers, token purchase with another ERC20 token, and liquidity management post-sale. The contract includes functions for participating in the sale, withdrawing tokens, and handling sale proceeds.
## Constructor

   * constructor(address[] memory setupAddys, uint256[] memory uints, address[] memory wlAddys, uint256[] memory tiers4WL, uint256[] memory startTimes, address _feeAddr, uint256 _serviceFee, bool _isPublic): Initializes the contract.

  * setupAddys[] : 
1. Router address
2. admin contract address    
3. sale token address
4. sale owner address
5. erc20 used for fundraising address

  * uints[] :

1. min participation (with payment token decimals decimals)
2. max participation (with payment token decimals decimals)
3. lp percentage, from total of 10000, should be >= 5100 (51%) and <= 10000 (100%)
4. dex listing rate (how much tokens for 1 payment token) with payment token decimals
5. lpLockDelta , lp lock period
6. token price in payment token (with payment token decimals decimals)
7. Sale end time (unix timestamp)
8. Sale satrt time (unix timestamp)
9. Public round start time delta. Public round start time calculates like : 5th tier start time + PublicRoundStartsDelta
10. HardCap in tokens
11. softCap in tokens 

## Key Functions
### Public and Restricted Functions

   * participate(uint256 tierId, uint256 amountERC20)
       * Allows users to participate in the token sale with an ERC20 token.
       * tierId: The tier ID for participation.
       * amountERC20: The amount of ERC20 tokens to use for participation.

   * withdraw()
       * Allows users to withdraw purchased tokens after the sale.

   * finishSale()
       * Concludes the sale, manages liquidity, and handles remaining tokens. Can be called by the sale owner or an admin.

   * changeLpPercentage(uint256 _lpPercentage)
       * Changes the liquidity percentage. Can only be called by the sale owner.
       * _lpPercentage: New liquidity percentage.

   * withdrawUserFundsIfSaleCancelled()
       * Allows users to withdraw their ERC20 funds if the sale is cancelled.

   * withdrawLP()
       * Withdraws liquidity pool tokens after the liquidity lock period. Can only be called by the sale owner.

### Admin Functions

   * Functions like removeStuckTokens, editMaxParticipation, editMinParticipation, and changeSaleOwner are intended for admin or sale owner use, providing control over key aspects of the sale.

### Event Emitters

   * The contract emits events like TokensSold, TokensWithdrawn, SaleCreated, etc., to signal various actions and state changes within the contract.

## Usage Examples (Using ethers.js)

To interact with the SparklaunchSaleERC20 contract, you'll need ethers.js installed in your environment and a wallet set up with some ERC20 tokens and ETH for transaction fees.

``` javascript
const { ethers } = require("ethers");

// Connect to the Ethereum network
const provider = ethers.getDefaultProvider('rinkeby'); // or another network

// Connect to your Ethereum wallet
const privateKey = "your-private-key";
const wallet = new ethers.Wallet(privateKey, provider);

// The address of the deployed SparklaunchSaleERC20 contract
const sparklaunchSaleERC20Address = "0x..."; 
const SparklaunchSaleERC20 = new ethers.Contract(sparklaunchSaleERC20Address, SparklaunchSaleERC20ABI, signer);

// Participating in the sale
const amountERC20 = ethers.utils.parseUnits("AMOUNT_OF_ERC20", ERC20_DECIMALS);
const participateTx = await SparklaunchSaleERC20.participate(tierId, amountERC20);
await participateTx.wait();
```


SalesFactory Setup:
1. deploy admin contract with admin addresses array
2. deploy Salefactory with admin contract address as constructor argument
3. setFee() - a function to set bnb fee for deploying a sale (in bnb, 18 decimals)
4. setSeviceFee() - a function to set serviceFee , a percent of raised funds that will be taken from owners profit. (10000 = 100%)
5. setFeeAddr() - set the address to receive fees

Deploy a sale: 
1. deployNormalSale() - call this function in order to deploy a sale. The function accepts 4 arrays with arguments. The order of array elements should be exactly the same as following:

const tx = await factoryContract.deployERC20Sale(
        [router, ADMIN_CONTRACT_ADDRESS, TOKENADDDYY, SALEOWNER_ADDRESS], 
        [minP, maxP, lpPerc, pcsListingRate, lpLockDelta, TOKEN_PRICE_IN_BNB, 
         saleEnds, saleStarts, PUBLIC_ROUND_DELTA, HARD_CAP, SOFT_CAP],
        [ADMIN_ADDRESS, ALICE_ADDRESS, BOB_ADDRESS],
        [1, 2, 3],
        startTimes,
        40);

setupAddys[] : 
1. Router address
2. admin contract address    
3. sale token address
4. sale owner address

uints[] :

1. min participation (with 18 decimals)
2. max participation (with 18 decimals)
3. lp percentage, from total of 10000, should be >= 5100 (51%) and <= 10000 (100%)
4. dex listing rate (how much tokens for 1 bnb) with 18 decimals
5. lpLockDelta , lp lock period
6. token price in bnb (wiith 18 decimals)
7. Sale end time (unix timestamp)
8. Sale satrt time (unix timestamp)
9. Public round start time delta. Public round start time calculates like : 5th tier start time + PublicRoundStartsDelta
10. HardCap in tokens
11. softCap in tokens 


WLAddys[]:
1. array with addresses that need to be added to the whitelist and get tiers
e.g [ADMIN_ADDRESS, ALICE_ADDRESS, BOB_ADDRESS]

tiers4WL[]: 
1. array with numbers from 1 to 5 , e.g [1, 2, 3]
2. the number of elements in the array should be equal the number of elements in the WLAddys array
e.g :
WLAddys[ADMIN_ADDRESS, ALICE_ADDRESS, BOB_ADDRESS]
tiers4WL[1, 2, 3]
3. that means ADMIN_ADDRESS will be granted 1st tier, 
ALICE_ADDRESS will be granted 2nd tier,
BOB_ADDRESS will be granted 3rd tier

startTimes[]:
1. tiers start times
2. should be exactly 5 numbers in the array (start time for each tier from total of 5)
3. in unix timestamp format 

id:
1. a unique sale id 


SparkLaunchSale: 
1. All sale parameters are set from the constructor;
2. before sale starts sale owner can change sale owner address changeSaleOwner(address _saleOwner), change lp % changeLpPercentage(uint256 _lpPercentage), add more people to whitelist grantATierMultiply4SaleOwner(), edit max and min participation editMaxParticipation(uint256 _maxP) editMinParticipation(uint256 _minP);
3. to participate in a sale , user should call participate() with the tier number that was granted to them (from 1 to 5), if a user is not wl (public round participant) tierId should be 0 
4. to finilize a sale sale owner should call finishSale(). 
5. if softcap reached sale is marked as successful, that means liquidity is added and locked automatically, the tokens leftover is burned, participants can withdraw tokens they bought, sale owner can withdraw earnings if there are any.
6. if softcap not reached sale is marked as cancelled, that means tokens are refunded to the sale owner automatically, participants can withdraw deposited bnb 

functions description:
setSaleParams() - internal function called from the constructor to setup the sale 

changeLpPercentage() - a function sale owner to change a bnb % from raised funds to add liquidity before sale starts

changeSaleOwner() - a function sale owner to change a sale owner address before sale starts

grantATierMultiply4SaleOwner() - a function sale owner to add more people to wl before sale starts

calculateMaxTokensForLiquidity() - view function to calculate max possible tokens amount for lp

depositTokens() - function for depositing tokens , called only once from the factory contract

participate() - a function for participating in the sale. user should call participate() with the tier number that was granted to them (from 1 to 5), if a user is not wl (public round participant) tierId should be 0 

withdraw() -  a function to withdraw tokens for users who have participated and sale reached soft cap

editMaxParticipation(uint256 _maxP) & editMinParticipation(uint256 _minP) -  functions for sale owner to change max and min participation before sale starts

finishSale() - a function to finilize the sale. if softcap reached - adds liquidity , locks lps, burns tokens leftover. If softcap not reached - refunds lefover.

withdrawLP() - a function for sale owner to withdraw locked lp 

withdrawUserFundsIfSaleCancelled() - a function to withdraw deposited funds if sale cancelled

withdrawEarnings() - a function for sale owner to withdraw earnings if sale successful and there are any earnings

getParticipation(address _user) -  view function to get users participation info 

removeStuckTokens() - an admin function to withdraw any tokens except of sale token and sale lps

_calculateServiceFee -  view function to calculate service fee

setRounds() - private function to set tiers start time , called from the constructor

getCurrentRound() - a function to get current round







