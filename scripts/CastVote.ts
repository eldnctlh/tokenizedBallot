import { ethers } from "hardhat";
import { MyToken, TokenizedBallot } from "../typechain-types";
import { readAsJSON } from "../utils/jsonAddresses";
import * as dotenv from "dotenv";
dotenv.config();

const myVote = 0;
const mySecondVote = 1;

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
  const acc1VotingPowerBeforeVote = await myTokenContract.getVotes(
    acc1.address
  );
  console.log("acc1VotingPower", acc1VotingPowerBeforeVote);

  const castFirstVoteTx = await tokenizedBallotContract
    .connect(acc1)
    .vote(myVote, acc1VotingPowerBeforeVote.div(2));
  await castFirstVoteTx.wait();
  const castSecondVoteTx = await tokenizedBallotContract
    .connect(acc1)
    .vote(mySecondVote, acc1VotingPowerBeforeVote.div(2));
  await castSecondVoteTx.wait();

  const proposal0AfterVote = await tokenizedBallotContract.proposals(myVote);
  console.log(
    `First option voteCount after casting vote: ${proposal0AfterVote.voteCount}`
  );
  const proposal1AfterVote = await tokenizedBallotContract.proposals(myVote);
  console.log(
    `First option voteCount after casting vote: ${proposal1AfterVote.voteCount}`
  );
  const acc1VotingPowerAfterVote = await myTokenContract.getVotes(acc1.address);
  console.log("acc1VotingPowerAfterVote", acc1VotingPowerAfterVote);
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});
