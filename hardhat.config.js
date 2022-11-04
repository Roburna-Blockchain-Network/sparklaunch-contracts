require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.7",
          settings: {
            optimizer: {
              enabled: true,
              runs: 200
            }
          } 
  },
    
  networks: {
    hardhat: {
      forking: {
        url: "https://bsc-dataseed4.binance.org/",
      },
      allowUnlimitedContractSize: true
    },

    binance: {
      url: `https://data-seed-prebsc-2-s1.binance.org:8545/`,
      accounts: [`7f5b32382c7e9040d52d66aec5adc1602eafe101e66ea895f2c7446f5f407282`],
      allowUnlimitedContractSize: true
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: "MMTH9PCYDD18ZYA6TKHA51TUKEJ536C33P",
  },
};