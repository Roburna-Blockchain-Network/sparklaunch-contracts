require("@nomiclabs/hardhat-ethers");
const factory = require("../artifacts/contracts/SaleFactoryERC20.sol/SalesFactoryERC20.json");
const token = require("../artifacts/contracts/SaleToken.sol/SaleToken.json");

task("deploySale", "deploys sale")
  .setAction(async () => {
    const PRIVATE_KEY = "d32df9466aad3f3ec1b3485cfed0d185df4a453d2c89a22b867ba1cdece2b8fa";
    const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed4.ninicoin.io/");
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    async function getCurrentBlockTimestamp() {
        return (await ethers.provider.getBlock('latest')).timestamp;
    } 

    const TOKENADDDYY = "0xFEFDdF44170D7B2661d6ad306c81D3D8bc340B37";
    const PAYMENT_TOKENADDDYY = "0x711cE0Cfe66ca850f895d54F331151874dC1629f";
    const FACTORY_ADDRESS = "0xE8F510cD27107E4462e1531c862E31B389749DF6";  
    const ADMIN_ADDRESS = "0x209ce248C3430D991F1A8117e2E8649041945b19";
    const ADMIN_CONTRACT_ADDRESS = "0x876E0cF57E53d46433929206c85beaFE77FD4B91";
    const ALICE_ADDRESS = "0x3825A87A33b0BC4d98F61B52F9caF2C0041Fb752";
    const BOB_ADDRESS = "0xc62e1165576979942fdDC123a1b4abfc5B395B2c";

    const blockTimestamp = await getCurrentBlockTimestamp();
    const router = "0x2fAe743821Bbc2CfD025C7E6B3Ee01ae202dd48B"
    const serviceFee = 100; 
    const minP = ethers.utils.parseEther('0.0005');
    const maxP = ethers.utils.parseEther('5');
    const lpPerc = 5100;
    const pcsListingRate = ethers.utils.parseEther('50000');;
    const lpLockDelta = 1000;
    const TOKEN_PRICE_IN_BNB = ethers.utils.parseEther('0.000002');
    const SALE_END_DELTA = 800;
    const PUBLIC_ROUND_DELTA = 100;
    const SOFT_CAP = ethers.utils.parseEther('800');
    const HARD_CAP = ethers.utils.parseEther('1000');
    const ROUNDS_START_DELTAS = [50, 70, 90, 100, 110];
  
    const startTimes =  ROUNDS_START_DELTAS.map((s) => blockTimestamp+s);
  
    const saleEnds = blockTimestamp + SALE_END_DELTA;
    const saleStarts = blockTimestamp + 50;

    const factoryContract = await new ethers.Contract(FACTORY_ADDRESS, factory.abi, signer);
    const PaymentTokenContract = await  new ethers.Contract(PAYMENT_TOKENADDDYY, token.abi, signer);
    const TokenContract = await  new ethers.Contract(TOKENADDDYY, token.abi, signer);

    await TokenContract.approve(FACTORY_ADDRESS, ethers.utils.parseEther('100000000'));


    const tx = await factoryContract.deployERC20Sale(
        [router, ADMIN_CONTRACT_ADDRESS, ADMIN_ADDRESS, TOKENADDDYY, ADMIN_ADDRESS, PAYMENT_TOKENADDDYY], 
        [serviceFee, minP, maxP, lpPerc, pcsListingRate, lpLockDelta, TOKEN_PRICE_IN_BNB, 
         saleEnds, saleStarts, PUBLIC_ROUND_DELTA, HARD_CAP, SOFT_CAP],
        [ADMIN_ADDRESS, ALICE_ADDRESS, BOB_ADDRESS],
        [1, 2, 3],
        startTimes,
        40);

    //tx.wait();    
    
    console.log(tx);

    const saleAddress = await factoryContract.saleIdToAddress(40);
    console.log(saleAddress);



 
});

module.exports = {};