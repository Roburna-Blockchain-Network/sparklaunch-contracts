require("@nomiclabs/hardhat-ethers");

const sale = require("../artifacts/contracts/SparkLaunchSale.sol/SparklaunchSale.json");


task("lpWithdraw", "deploys sale")
  .setAction(async () => {
    const PRIVATE_KEY = "d32df9466aad3f3ec1b3485cfed0d185df4a453d2c89a22b867ba1cdece2b8fa";
    const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed4.ninicoin.io/");
    const signer = new ethers.Wallet(PRIVATE_KEY, provider); 


    const SALE_ADDRESS = "0x6c8199e6d61b3ad102f7a2d682c2dda041606c85";  


    const saleContract = new ethers.Contract(SALE_ADDRESS, sale.abi, signer);
    

    const tx = await saleContract.withdrawLP();
    
    console.log(tx);



 
});

module.exports = {};