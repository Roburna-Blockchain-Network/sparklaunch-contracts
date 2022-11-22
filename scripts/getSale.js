require("@nomiclabs/hardhat-ethers");

const sale = require("../artifacts/contracts/SparkLaunchSale.sol/SparklaunchSale.json");


task("getSale", "deploys sale")
  .setAction(async () => {
    const PRIVATE_KEY = "d32df9466aad3f3ec1b3485cfed0d185df4a453d2c89a22b867ba1cdece2b8fa";
    const provider = new ethers.providers.JsonRpcProvider("https://preseed-testnet-1.roburna.com/");
    const signer = new ethers.Wallet(PRIVATE_KEY, provider); 


    const SALE_ADDRESS = "0x03aB1046311202823ae2A593a6751894237c2b67";  


    const saleContract = new ethers.Contract(SALE_ADDRESS, sale.abi, signer);
    

    const tx = await saleContract.sale();
    
    console.log(tx);



 
});

module.exports = {};