require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy");
require("ts-node/register/transpile-only");

module.exports = {
  solidity: "0.8.20",  // Specify the version of Solidity you're using
  paths: {
    sources: "./contracts", // Path to your Solidity contracts
    tests: "./test",        // Path to your test files
    cache: "./cache",       // Path to the Hardhat cache
    artifacts: "./artifacts", // Path to compiled contract artifacts
  },
  networks: {
    hardhat: {
      chainId: 1337, // Chain ID for the local Hardhat network
    },
  },
};
