require("@nomiclabs/hardhat-ethers");

const sale = require("../artifacts/contracts/SparkLaunchSale.sol/SparklaunchSale.json");


task("finish", "deploys sale")
  .setAction(async () => {
    const PRIVATE_KEY = "d32df9466aad3f3ec1b3485cfed0d185df4a453d2c89a22b867ba1cdece2b8fa";
    const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed4.ninicoin.io/");
    const signer = new ethers.Wallet(PRIVATE_KEY, provider); 


    const SALE_ADDRESS = "0x38DbF90fce47a99C7390A7C18e9bb8f673366f0D";  


    const saleContract = new ethers.Contract(SALE_ADDRESS, sale.abi, signer);
    

    const tx = await saleContract.finishSale();
    
    console.log(tx);



 
});

module.exports = {};