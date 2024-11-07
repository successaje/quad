require("@nomicfoundation/hardhat-toolbox");



/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
      alfajores: {
          // can be replaced with the RPC url of your choice.
          url: "https://alfajores-forno.celo-testnet.org",
          accounts: [
              "<YOUR_PRIVATE_KEY>"
          ],
      },
      celo: {
          url: "https://forno.celo.org",
          accounts: [
              "<YOUR_PRIVATE_KEY>"
          ],
      }
  },
  etherscan: {
      apiKey: {
          alfajores: "<CELOSCAN_API_KEY>",
          celo: "<CELOSCAN_API_KEY>"
      },
      customChains: [
          {
              network: "alfajores",
              chainId: 44787,
              urls: {
                  apiURL: "https://api-alfajores.celoscan.io/api",
                  browserURL: "https://alfajores.celoscan.io",
              },
          },
          {
              network: "celo",
              chainId: 42220,
              urls: {
                  apiURL: "https://api.celoscan.io/api",
                  browserURL: "https://celoscan.io/",
              },
          },
      ]
  },
};
