import { ethers } from "hardhat";
import { MyToken } from "../typechain-types";
import { readAsJSON } from "../utils/jsonAddresses";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const [, acc1] = await ethers.getSigners();
  const myTokenContractFactory = await ethers.getContractFactory("MyToken");
  const addresses = await readAsJSON();
  const myTokenContract = myTokenContractFactory.attach(
    addresses.tokenContract
  ) as MyToken;
  console.log("myTokenContract", myTokenContract.address);
  const acc1InitialVotingPowerAfterMint = await myTokenContract.getVotes(
    acc1.address
  );
  console.log(
    `Vote balance of acc1 after minting: ${ethers.utils.formatEther(
      acc1InitialVotingPowerAfterMint
    )} \n`
  );

  console.log("Delegating from acc1 to acc1...  \n");
  const delegateTx = await myTokenContract.connect(acc1).delegate(acc1.address);
  await delegateTx.wait();
  const acc1VotingPowerAfterDelegate = await myTokenContract.getVotes(
    acc1.address
  );
  console.log(
    `Vote balance of acc1 after self delegating: ${ethers.utils.formatEther(
      acc1VotingPowerAfterDelegate
    )} \n`
  );
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});
