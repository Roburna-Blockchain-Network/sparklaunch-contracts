require("@nomiclabs/hardhat-ethers");
const contract = require("../artifacts/contracts/ArborSwapLock.sol/ArborSwapLock.json");
const contractToken = require("../artifacts/contracts/mock.sol/MockBUSD.json");

task("deploySale", "deploys sale")
  .setAction(async () => {
    
    const PRIVATE_KEY = "320cbe3a2c50091a663be158d8e0d36acd99b0a2edf81baf1fdc47a8ef0dd471";
    const TOKENADDDYY = "0xAf88d05f33ae949Ba0999bD781CD178A52cD2Ed4";
    const CONTRACT_ADDRESS = "0x4A610a3a46539b460FE11758cE8d51A518DF8dF5";  

    const provider = new ethers.providers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    const LockContract = new ethers.Contract(CONTRACT_ADDRESS, contract.abi, signer);
    const TokenContract = new ethers.Contract(TOKENADDDYY, contractToken.abi, signer);
    const testValue = ethers.utils.parseEther("0.04");
    
    await TokenContract.approve(CONTRACT_ADDRESS, 1000000);

    const tx = await LockContract.lock("0x37EF590E0BDe413B6407Bc5c4e40C3706dEEBc86", TOKENADDDY, false, 1000, Date.now() + 100, "1", {value: testValue});
    
    console.log(tx);

    const PRIVATE_KEY = "d32df9466aad3f3ec1b3485cfed0d185df4a453d2c89a22b867ba1cdece2b8fa";
   

  const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed4.binance.org/");
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);

  this.Token = await hre.ethers.getContractFactory("SaleToken");
  this.token = await Token.deploy();
  await this.token.deployed();
  
  const TokenContract = new ethers.Contract(this.token.address, contractToken.abi, signer);

  
  await TokenContract.approve(CONTRACT_ADDRESS, ethers.utils.parseEther('100000'));


  async function getCurrentBlockTimestamp() {
    return (await ethers.provider.getBlock('latest')).timestamp;
  }
  const blockTimestamp = await getCurrentBlockTimestamp();
  const router = "0x10ED43C718714eb63d5aA57B78B54704E256024E"
  const serviceFee = 100; 
  const minP = ethers.utils.parseEther('0.00005');
  const maxP = ethers.utils.parseEther('5');
  const lpPerc = 5100;
  const pcsListingRate = 50000;
  const lpLockDelta = 100;
  const TOKEN_PRICE_IN_BNB = ethers.utils.parseEther('0.000002');
  const SALE_END_DELTA = 1000;
  const PUBLIC_ROUND_DELTA = 100;
  const SOFT_CAP = ethers.utils.parseEther('5');
  const HARD_CAP = ethers.utils.parseEther('1000');
  const ROUNDS_START_DELTAS = [50, 70, 90, 100, 110];

  const startTimes =  ROUNDS_START_DELTAS.map((s) => blockTimestamp+s);

  const saleEnds = blockTimestamp + SALE_END_DELTA;
  const saleStarts = blockTimestamp + 10;

  this.Admin = await hre.ethers.getContractFactory("Admin");
  this.Sale = await hre.ethers.getContractFactory("SparklaunchSale");
  
  this.admin = await Admin.deploy(['0x5168C3d820A2a2521F907cD74F6E1DE43E95da22']);
  await this.admin.deployed();
  
  this.sale = await Sale.deploy(
    [router, Admin.address, cedric.address, SaleToken.address, deployer.address], 
    [serviceFee, minP, maxP, lpPerc, pcsListingRate, lpLockDelta, TOKEN_PRICE_IN_BNB, 
     saleEnds, saleStarts, PUBLIC_ROUND_DELTA, HARD_CAP, SOFT_CAP],
    [deployer.address, alice.address, bob.address],
    [1, 2, 3],
    startTimes);
  await this.sale.deployed();
  });

module.exports = {};