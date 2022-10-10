import { ethers } from "hardhat";
import { MyToken, TokenizedBallot } from "../typechain-types";
import { readAsJSON } from "../utils/jsonAddresses";
import * as dotenv from "dotenv";
dotenv.config();

const myVote = 0;
const mySecondVote = 1;
const myThirdVote = 2;

async function main() {
  const [, acc1] = await ethers.getSigners();

  const myTokenContractFactory = await ethers.getContractFactory("MyToken");
  const addresses = await readAsJSON();
  const myTokenContract = myTokenContractFactory.attach(
    addresses.tokenContract
  ) as MyToken;
  console.log("myTokenContract", myTokenContract.address);

  const tokenizedBallotContractFactory = await ethers.getContractFactory(
    "TokenizedBallot"
  );
  const tokenizedBallotContract = tokenizedBallotContractFactory.attach(
    addresses.ballotContract
  ) as TokenizedBallot;
  console.log("tokenizedBallotContract", tokenizedBallotContract.address);

  const proposal0BeforeVote = await tokenizedBallotContract.proposals(myVote);
  console.log(
    `First option voteCount before casting vote: ${proposal0BeforeVote.voteCount}`
  );
  const proposal1BeforeVote = await tokenizedBallotContract.proposals(
    mySecondVote
  );
  console.log(
    `Second option voteCount before casting vote: ${proposal1BeforeVote.voteCount}`
  );
  const proposal2BeforeVote = await tokenizedBallotContract.proposals(
    myThirdVote
  );
  console.log(
    `Third option voteCount before casting vote: ${proposal2BeforeVote.voteCount}`
  );
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});
