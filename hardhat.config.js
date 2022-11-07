require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("./scripts/deploySale.js");
require("./scripts/participate.js");
require("./scripts/finishSale.js");
require("./scripts/getSale.js");
require("./scripts/withdrawLP.js");
require("./scripts/withdraw.js");

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
      url: `https://bsc-dataseed4.ninicoin.io/`,
      accounts: [`d32df9466aad3f3ec1b3485cfed0d185df4a453d2c89a22b867ba1cdece2b8fa`],
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