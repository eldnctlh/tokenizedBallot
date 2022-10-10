import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { MyToken } from "../typechain-types";
import { readAsJSON } from "../utils/jsonAddresses";
dotenv.config();

const TOKENS_MINTED = ethers.utils.parseEther("1");

async function main() {
  const [, acc1] = await ethers.getSigners();
  const myTokenContractFactory = await ethers.getContractFactory("MyToken");
  const addresses = await readAsJSON();
  const myTokenContract = myTokenContractFactory.attach(
    addresses.tokenContract
  ) as MyToken;
  console.log("myTokenContract", myTokenContract.address);

  console.log(`Minting tokens to acc1 at ${acc1.address}... \n`);
  const mintTx = await myTokenContract.mint(acc1.address, TOKENS_MINTED);
  await mintTx.wait();
  console.log(`Minted tokens to acc1 at ${acc1.address} \n`);

  const totalSupplyAfter = await myTokenContract.totalSupply();
  console.log(
    `Total supply after minting: ${ethers.utils.formatEther(
      totalSupplyAfter
    )} \n`
  );
  const acc1BalanceAfterMint = await myTokenContract.balanceOf(acc1.address);
  console.log(
    `Token balance of acc1 after minting: ${ethers.utils.formatEther(
      acc1BalanceAfterMint
    )} \n`
  );
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});
