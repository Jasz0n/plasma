require("@nomiclabs/hardhat-waffle");
 
const IOTEX_PRIVATE_KEY = "5927f92407edf420c2c2ff32de12e6d5199b99ccd56fdfc36208f592528c9b82";
 
module.exports = {
  solidity: "0.8.9",
  networks: {
    testnet: {
      // These are the official IoTeX endpoints to be used by Ethereum clients
      // Testnet https://babel-api.testnet.iotex.io
      // Mainnet https://babel-api.mainnet.iotex.io
      url: `https://babel-api.testnet.iotex.io`,
 
      // Input your Metamask testnet account private key here
      accounts: [`${IOTEX_PRIVATE_KEY}`],
    },
  },
};