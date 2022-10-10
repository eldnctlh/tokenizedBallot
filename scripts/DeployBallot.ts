import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { MyToken, TokenizedBallot } from "../typechain-types";
import { readAsJSON, writeAsJSON } from "../utils/jsonAddresses";
dotenv.config();

const PROPOSALS = ["Cat", "Dog", "Hamster"];

const convertStringArrayToBytes32 = (array: string[]) =>
  array.map((e) => ethers.utils.formatBytes32String(e));

async function main() {
  const myTokenContractFactory = await ethers.getContractFactory("MyToken");
  const addresses = await readAsJSON();
  const myTokenContract = myTokenContractFactory.attach(
    addresses.tokenContract
  ) as MyToken;

  const currentBlock = await ethers.provider.getBlock("latest");

  console.log("Deploying Ballot contract... \n");
  const tokenizedBallotContractFactory = await ethers.getContractFactory(
    "TokenizedBallot"
  );
  const tokenizedBallotContract = (await tokenizedBallotContractFactory.deploy(
    convertStringArrayToBytes32(PROPOSALS),
    myTokenContract.address,
    currentBlock.number
  )) as TokenizedBallot;
  await tokenizedBallotContract.deployed();

  await writeAsJSON({
    ...addresses,
    ballotContract: tokenizedBallotContract.address,
  });
  console.log(
    `Ballot contract deployed at: ${tokenizedBallotContract.address} \n`
  );
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});
