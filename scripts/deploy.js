const { ethers } = require("hardhat");
const hre = require("hardhat");
//const contractToken = require("../artifacts/contracts/SaleToken.sol/SaleToken.json");

async function main() {

  const Admin = await ethers.getContractFactory("Admin");
  this.cryptoVillages = await CryptoVillages.deploy('0x910Ad70E105224f503067DAe10b518F73B07b5cD');
  await this.cryptoVillages.deployed();

  const SalesFactory = await ethers.getContractFactory("SalesFactoryERC20");
  this.salesFactory = await SalesFactory.deploy('0x910Ad70E105224f503067DAe10b518F73B07b5cD');
  await this.salesFactory.deployed();


  console.log("memecoinFactory deployed to:", this.memecoinFactory.address);
  console.log("cryptoVillages deployed to:", this.cryptoVillages.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});