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
        url: "https://bsc-dataseed2.binance.org/",
      },
      allowUnlimitedContractSize: true
    },

    roburna: {
      url: "https://preseed-testnet-1.roburna.com/",
      accounts:['a3a9bfa1e100ae81cf6b03083f4a96f87f9ede36ef6931d8291eed4a8c5a447d'],
      allowUnlimitedContractSize: true
   },

   binance: {
    url: "https://preseed-testnet-1.roburna.com/",
    accounts:['a3a9bfa1e100ae81cf6b03083f4a96f87f9ede36ef6931d8291eed4a8c5a447d'],
    allowUnlimitedContractSize: true
   },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: "b3f2c110990b3e5943b007e5fd651b69e4553daa005077f94dff129f7b30d550",
    customChains: [
      {
        network: "roburna",
        chainId: 159,
        urls: {
          apiURL: "https://testapi.rbascan.com/api/",
          browserURL: "https://testapi.rbascan.com/"
        }
      }
    ]
  },
};