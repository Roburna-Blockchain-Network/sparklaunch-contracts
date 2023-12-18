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







