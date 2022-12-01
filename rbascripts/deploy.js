const { parseEther } = require("ethers/lib/utils");
const hre = require("hardhat");
const { ethers } = require("hardhat");
// const { FEE_TO_SETTER } = require("./constants/address");

const ADMIN_ADDRESS = [
  "0x9224513121f576441DD9De66d4E598aAD2B433A9",
  "0x3631f25ea6f2368D3A927685acD2C5c43CE05049",
];

const fee_addr = "0x9224513121f576441DD9De66d4E598aAD2B433A9";
const fee = parseEther("0.5");
const service = 350;

const arg1 = [
  "0x4e1845Ab1d9D464150777a931Ce8FDaaD1cf8229",
  "0xA78AeFa96c0AA49CE2aD1c9a6cB88aC0eaE49363",
  "0x19E35d5C6807dfc5a063431b02aC741e6cd5EBdD",
  "0x3631f25ea6f2368D3A927685acD2C5c43CE05049",
];
const arg2 = [
  "1000",
  "10000000000000000",
  "1000000000000000000",
  "6000",
  "100000000000000000",
  "300",
  "100000000000000",
  "1668897960",
  "1668883680",
  "10",
  "200000000000000000000",
  "100000000000000000000",
];

const arg3 = ["0xA78AeFa96c0AA49CE2aD1c9a6cB88aC0eaE49363"];
const arg4 = ["1"];
const arg5 = ["1668883681"];
const arg6 = ["1668883682", "1668883683", "1668883684", "1668883685"];
const arg7 = "true";
const arg = [
  [
    "0x4e1845Ab1d9D464150777a931Ce8FDaaD1cf8229",
    "0xA78AeFa96c0AA49CE2aD1c9a6cB88aC0eaE49363",
    "0x19E35d5C6807dfc5a063431b02aC741e6cd5EBdD",
    "0x3631f25ea6f2368D3A927685acD2C5c43CE05049",
  ],
  [
    "1000",
    "10000000000000000",
    "1000000000000000000",
    "6000",
    "100000000000000000",
    "300",
    "100000000000000",
    "1668897960",
    "1668883680",
    "10",
    "200000000000000000000",
    "100000000000000000000",
  ],
  ["0xA78AeFa96c0AA49CE2aD1c9a6cB88aC0eaE49363"],
  ["1"],
  ["1668883681"],
  ["1668883682", "1668883683", "1668883684", "1668883685"],
  "true",
];

async function main() {
  const AdminContract = await ethers.getContractFactory("Admin");
  const FactoryContract = await ethers.getContractFactory("SalesFactory");

  const adminContract = await AdminContract.deploy(ADMIN_ADDRESS);

  await adminContract.deployed();
  console.log("adminContract deployed to:", adminContract.address);

  // try {
  //   await hre.run("verify", {
  //     address: adminContract.address,
  //     constructorArgsParams: [ADMIN_ADDRESS],
  //   });
  // } catch (error) {
  //   console.error(error);
  //   console.log(
  //     `Smart contract at address ${adminContract.address} is already verified`
  //   );
  // }

  const factoryContract = await FactoryContract.deploy(adminContract.address);
  await factoryContract.deployed();

  // const factoryContract = await FactoryContract.deploy(adminContract.address);
  console.log("factoryContract deployed to:", factoryContract.address);

  // try {
  //   await hre.run("verify", {
  //     address: factoryContract.address,
  //     constructorArgsParams: [adminContract.address],
  //   });
  // } catch (error) {
  //   console.error(error);
  //   console.log(
  //     `Smart contract at address ${factoryContract.address} is already verified`
  //   );
  // }

  console.log("Set Fee");
  const tx = await factoryContract.setFee(fee);
  await tx.wait();

  // console.log("Set Service Fee");
  // const tx2 = await factoryContract.setSeviceFee(service);
  // await tx2.wait();
  console.log("Set  Fee Receiver");
  const tx3 = await factoryContract.setFeeAddr(fee_addr);
  await tx3.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
