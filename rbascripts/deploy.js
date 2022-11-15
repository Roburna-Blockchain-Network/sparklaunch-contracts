const hre = require("hardhat");
const { ethers } = require("hardhat");
const { FEE_TO_SETTER } = require("./constants/address");

const ADMIN_ADDRESS = [
  "0x9224513121f576441DD9De66d4E598aAD2B433A9",
  "0x3631f25ea6f2368D3A927685acD2C5c43CE05049",
];

async function main() {
  const AdminContract = await ethers.getContractFactory("Admin");
  const FactoryContract = await ethers.getContractFactory("SalesFactory");

  const adminContract = await AdminContract.deploy(ADMIN_ADDRESS);

  await adminContract.deployed();
  console.log("adminContract deployed to:", adminContract.address);

  const factoryContract = await FactoryContract.deploy(adminContract.address);
  await factoryContract.deployed();

  console.log("factoryContract deployed to:", factoryContract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
