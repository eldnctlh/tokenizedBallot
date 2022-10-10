import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { MyToken } from "../typechain-types";
import { readAsJSON } from "../utils/jsonAddresses";
dotenv.config();

const TOKENS_MINTED = ethers.utils.parseEther("1");

const classMateAddress = "0xab883C2270E85849952239aCdf945f6CeFdd6eE5";

async function main() {
  //   const [, , acc2] = await ethers.getSigners();
  const myTokenContractFactory = await ethers.getContractFactory("MyToken");
  const addresses = await readAsJSON();
  const myTokenContract = myTokenContractFactory.attach(
    addresses.tokenContract
  ) as MyToken;
  console.log("myTokenContract", myTokenContract.address);

  console.log(`Minting tokens to acc12at ${classMateAddress}... \n`);
  const mintTx = await myTokenContract.mint(classMateAddress, TOKENS_MINTED);
  await mintTx.wait();
  console.log(`Minted tokens to acc2 at ${classMateAddress} \n`);

  const totalSupplyAfter = await myTokenContract.totalSupply();
  console.log(
    `Total supply after minting: ${ethers.utils.formatEther(
      totalSupplyAfter
    )} \n`
  );
  const acc1BalanceAfterMint = await myTokenContract.balanceOf(
    classMateAddress
  );
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
