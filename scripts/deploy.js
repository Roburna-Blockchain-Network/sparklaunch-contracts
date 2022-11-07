const { ethers } = require("hardhat");
const hre = require("hardhat");
//const contractToken = require("../artifacts/contracts/SaleToken.sol/SaleToken.json");

async function main() {
  this.Token = await hre.ethers.getContractFactory("SaleToken");
  this.token = await Token.deploy();
  await this.token.deployed();

  console.log("token deployed to:", this.token.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});