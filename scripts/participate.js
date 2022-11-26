require("@nomiclabs/hardhat-ethers");

const sale = require("../artifacts/contracts/SparkLaunchSale.sol/SparklaunchSale.json");


task("participate", "deploys sale")
  .setAction(async () => {
    const PRIVATE_KEY = "a3a9bfa1e100ae81cf6b03083f4a96f87f9ede36ef6931d8291eed4a8c5a447d";
    const provider = new ethers.providers.JsonRpcProvider("https://preseed-testnet-1.roburna.com/");
    const signer = new ethers.Wallet(PRIVATE_KEY, provider); 


    const SALE_ADDRESS = "0x425d87621bA3b2dD9f53E1837A779c3c831Bec12";  


    const saleContract = new ethers.Contract(SALE_ADDRESS, sale.abi, signer);
    

    const tx = await saleContract.participate(0, {value: ethers.utils.parseEther("2")});
    
    console.log(tx);



 
});

module.exports = {};