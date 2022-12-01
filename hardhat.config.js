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
      url: `https://data-seed-prebsc-1-s1.binance.org:8545/`,
      accounts: [
        `37c3f19a1bd53142c0e058ff3414200d58d4632a6f1a8d38c2a7967232357aeb`,
      ],
      allowUnlimitedContractSize: true,
    },
    roburna: {
      url: "https://preseed-testnet-1.roburna.com/",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      allowUnlimitedContractSize: true,
    },
    bscTestnet: {
      url: "https://bsctestapi.terminet.io/rpc",
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
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      // binance smart chain
      bsc: process.env.BSCSCAN_API_KEY,
      bscTestnet: process.env.BSCSCAN_API_KEY,
    },
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
