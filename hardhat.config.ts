import { defineConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

export default defineConfig({
  solidity: {
    version: "0.8.28", 
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      type: "edr-simulated",
      chainType: "l1",
    },
  },
});