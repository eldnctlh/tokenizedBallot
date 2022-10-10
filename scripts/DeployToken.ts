import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { MyToken } from "../typechain-types";
import { readAsJSON, writeAsJSON } from "../utils/jsonAddresses";

dotenv.config();

async function main() {
  console.log(`Deploying token contract... \n`);
  const myTokenContractFactory = await ethers.getContractFactory("MyToken");
  const myTokenContract = (await myTokenContractFactory.deploy()) as MyToken;
  await myTokenContract.deployed();
  console.log(`MyToken contract deployed at: ${myTokenContract.address} \n`);

  const jsonAddresses = await readAsJSON();
  await writeAsJSON({
    ...jsonAddresses,
    tokenContract: myTokenContract.address,
  });
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});
