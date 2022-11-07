require("@nomiclabs/hardhat-ethers");
const factory = require("../artifacts/contracts/SaleFactory.sol/SalesFactory.json");
const token = require("../artifacts/contracts/SaleToken.sol/SaleToken.json");

task("deploySale", "deploys sale")
  .setAction(async () => {
    const PRIVATE_KEY = "d32df9466aad3f3ec1b3485cfed0d185df4a453d2c89a22b867ba1cdece2b8fa";
    const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed4.ninicoin.io/");
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    async function getCurrentBlockTimestamp() {
        return (await ethers.provider.getBlock('latest')).timestamp;
    } 

    const TOKENADDDYY = "0x1BB20539F630073c9437F24C5530958756Be213D";
    const FACTORY_ADDRESS = "0xDee9F4324A51c9127e24189b221E1cdfcde21bE5";  
    const ADMIN_ADDRESS = "0x002E77396CF091C209981f4299733CD7cB2bf410";
    const ADMIN_CONTRACT_ADDRESS = "0x9162de6819353bA186Dbbb9498EB723C39C31139";
    const ALICE_ADDRESS = "0x3825A87A33b0BC4d98F61B52F9caF2C0041Fb752";
    const BOB_ADDRESS = "0xc62e1165576979942fdDC123a1b4abfc5B395B2c";

    const blockTimestamp = await getCurrentBlockTimestamp();
    const router = "0x10ED43C718714eb63d5aA57B78B54704E256024E"
    const serviceFee = 100; 
    const minP = ethers.utils.parseEther('0.00005');
    const maxP = ethers.utils.parseEther('5');
    const lpPerc = 5100;
    const pcsListingRate = 50000;
    const lpLockDelta = 1000;
    const TOKEN_PRICE_IN_BNB = ethers.utils.parseEther('0.000002');
    const SALE_END_DELTA = 1000;
    const PUBLIC_ROUND_DELTA = 100;
    const SOFT_CAP = ethers.utils.parseEther('5');
    const HARD_CAP = ethers.utils.parseEther('1000');
    const ROUNDS_START_DELTAS = [50, 70, 90, 100, 110];
  
    const startTimes =  ROUNDS_START_DELTAS.map((s) => blockTimestamp+s);
  
    const saleEnds = blockTimestamp + SALE_END_DELTA;
    const saleStarts = blockTimestamp + 50;

    const factoryContract = await new ethers.Contract(FACTORY_ADDRESS, factory.abi, signer);
    const TokenContract = await  new ethers.Contract(TOKENADDDYY, token.abi, signer);

    await TokenContract.approve(FACTORY_ADDRESS, ethers.utils.parseEther('1000000'));


    const tx = await factoryContract.deployNormalSale(
        [router, ADMIN_CONTRACT_ADDRESS, ADMIN_ADDRESS, TOKENADDDYY, ADMIN_ADDRESS], 
        [serviceFee, minP, maxP, lpPerc, pcsListingRate, lpLockDelta, TOKEN_PRICE_IN_BNB, 
         saleEnds, saleStarts, PUBLIC_ROUND_DELTA, HARD_CAP, SOFT_CAP],
        [ADMIN_ADDRESS, ALICE_ADDRESS, BOB_ADDRESS],
        [1, 2, 3],
        startTimes,
        1);

    //tx.wait();    
    
    console.log(tx);

    const saleAddress = await factoryContract.saleIdToAddress(1);
    console.log(saleAddress);



 
});

module.exports = {};