import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    somniaTestnet: {
      url: process.env.RPC_URL_SOMNIA || "https://dream-rpc.somnia.network",
      accounts: process.env.PRIVATE_KEY_SOMNIA 
        ? [process.env.PRIVATE_KEY_SOMNIA.startsWith('0x') 
            ? process.env.PRIVATE_KEY_SOMNIA 
            : `0x${process.env.PRIVATE_KEY_SOMNIA}`]
        : [],
      chainId: 50312,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
