require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
// require("./scripts/deploySale.js");
// require("./scripts/participate.js");
// require("./scripts/finishSale.js");
// require("./scripts/getSale.js");
// require("./scripts/withdrawLP.js");
// require("./scripts/withdraw.js");

module.exports = {
  solidity: {
    version: "0.8.7",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "roburna",
  networks: {
    hardhat: {
      forking: {
        url: "https://bsc-dataseed4.binance.org/",
      },
      allowUnlimitedContractSize: true,
    },

    binance: {
      url: `https://bsc-dataseed4.ninicoin.io/`,
      accounts: [
        `d32df9466aad3f3ec1b3485cfed0d185df4a453d2c89a22b867ba1cdece2b8fa`,
      ],
      allowUnlimitedContractSize: true,
    },
    roburna: {
      url: "https://preseed-testnet-1.roburna.com/",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      allowUnlimitedContractSize: true,
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
          browserURL: "https://testapi.rbascan.com/",
        },
      },
    ],
  },
};
