require("@nomiclabs/hardhat-ethers");

const sale = require("../artifacts/contracts/SparkLaunchSale.sol/SparklaunchSale.json");


task("participate", "deploys sale")
  .setAction(async () => {
    const PRIVATE_KEY_ADMIN = "d32df9466aad3f3ec1b3485cfed0d185df4a453d2c89a22b867ba1cdece2b8fa";
    const PRIVATE_KEY_ALICE = "11cd37cc944482bb37b1896020e1ebac581bae74dbce5c77c910399643b46313";
    const PRIVATE_KEY_BOB = "b7f872783c54a6b161ca5f5de3a79302aa434be0d033e39ed674d138308e0efb";
    const PRIVATE_KEY_ANON = '11ce896af24b6a476879ef057adb05de37d5d0914697ea258081849c93f4008e';
    const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed4.ninicoin.io/");
    const signer1 = new ethers.Wallet(PRIVATE_KEY_ADMIN, provider); 
    const signer2 = new ethers.Wallet(PRIVATE_KEY_ALICE, provider);
    const signer3 = new ethers.Wallet(PRIVATE_KEY_BOB, provider);
    const signer4 = new ethers.Wallet(PRIVATE_KEY_ANON, provider);

    const SALE_ADDRESS = "0x6c8199e6d61b3ad102f7a2d682c2dda041606c85";  


    const saleContract1 = new ethers.Contract(SALE_ADDRESS, sale.abi, signer1);
    
    

    const tx = await saleContract1.participate(1, {value: ethers.utils.parseEther("0.0005")});
    //const txx = await saleContract2.participate(2, {value: ethers.utils.parseEther("0.00005")});
    
    console.log(tx);
   // console.log(txx);



 
});

module.exports = {};