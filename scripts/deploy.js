const { ethers } = require("ethers");
const hre = require("hardhat");

async function main() {
  this.Admin = await hre.ethers.getContractFactory("Admin");
  this.Sale = await hre.ethers.getContractFactory("SparklaunchSale");
  
  this.admin = await Admin.deploy(['0x5168C3d820A2a2521F907cD74F6E1DE43E95da22']);
  await this.admin.deployed();
  
  this.sale = await Sale.deploy("0xCDe540d7eAFE93aC5fE6233Bee57E1270D3E330F", this.admin.address, 100, "0x5168C3d820A2a2521F907cD74F6E1DE43E95da22", ethers.utils.parseEther("0.02"), ethers.utils.parseEther("1"), 5100, 200, 2000);
  await this.sale.deployed();


  console.log("admin deployed to:", this.admin.address);
  console.log("sale deployed to:", this.sale.address);
  
 
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});