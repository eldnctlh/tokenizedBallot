import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const { ALCHEMY_API_KEY, PRIVATE_KEY, PRIVATE_KEY_1 } = process.env;

const config: HardhatUserConfig = {
  paths: { tests: "tests" },
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY ?? ""}`,
      accounts: [PRIVATE_KEY ?? "", PRIVATE_KEY_1 ?? ""],
    },
  },
};

export default config;
