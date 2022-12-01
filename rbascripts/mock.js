const { parseEther } = require("ethers/lib/utils");
const hre = require("hardhat");
const { ethers } = require("hardhat");
const { faker } = require("@faker-js/faker");
const fs = require("fs");
const rec = "0x3631f25ea6f2368D3A927685acD2C5c43CE05049";
async function main() {
  const _name = faker.name.firstName();
  const name = `${_name} Token`;
  const symbol = faker.random.alpha({ count: 3, casing: "upper" });

  const SaleToken = await ethers.getContractFactory("MockToken");
  const saleContract = await SaleToken.deploy(name, symbol, rec);

  await saleContract.deployed();
  const data = `
Token Name      : ${name}
Token Symbol    : ${symbol}
Token Address   : ${saleContract.address}
=============================================
`;
  fs.appendFileSync("account2.txt", data);
  console.log(data);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
