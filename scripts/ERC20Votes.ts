import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { MyToken, TokenizedBallot } from "../typechain-types";
dotenv.config();

const TOKENS_MINTED = ethers.utils.parseEther("1");
// const PROPOSALS = ["Cat", "Dog", "Hamster"];

// const convertStringArrayToBytes32 = (array: string[]) =>
//   array.map((e) => ethers.utils.formatBytes32String(e));
async function main() {
  const [deployer, acc1, acc2] = await ethers.getSigners();
  const myTokenContractFactory = await ethers.getContractFactory("MyToken");
  const myTokenContract = (await myTokenContractFactory.deploy()) as MyToken;
  await myTokenContract.deployed();
  console.log(`MyToken contract deployed at: ${myTokenContract.address} \n`);
  const totalSupply = await myTokenContract.totalSupply();
  console.log(`Initial total supply: ${totalSupply} \n`);
  console.log("Minting new tokens for Acc1 \n");
  const mintTx = await myTokenContract.mint(acc1.address, TOKENS_MINTED);
  await mintTx.wait();
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

  let currentBlock = await ethers.provider.getBlock("latest");
  console.log(`Curent block number: ${currentBlock.number}`);
  const mintTx2 = await myTokenContract.mint(acc2.address, TOKENS_MINTED);
  await mintTx2.wait();
  currentBlock = await ethers.provider.getBlock("latest");
  console.log(`Curent block number: ${currentBlock.number}`);
  const mintTx3 = await myTokenContract.mint(acc2.address, TOKENS_MINTED);
  await mintTx3.wait();
  currentBlock = await ethers.provider.getBlock("latest");
  console.log(`Curent block number: ${currentBlock.number}`);
  const pastVotes = await Promise.all([
    myTokenContract.getPastVotes(acc1.address, 4),
    myTokenContract.getPastVotes(acc1.address, 3),
    myTokenContract.getPastVotes(acc1.address, 2),
    myTokenContract.getPastVotes(acc1.address, 1),
    myTokenContract.getPastVotes(acc1.address, 0),
  ]);
  console.log({ pastVotes });

  // const tokenizedBallotContractFactory = await ethers.getContractFactory(
  //   "TokenizedBallot"
  // );
  // const tokenizedBallotContract = (await tokenizedBallotContractFactory.deploy(
  //   convertStringArrayToBytes32(PROPOSALS),
  //   myTokenContract.address,
  //   currentBlock.number
  // )) as TokenizedBallot;
  // await tokenizedBallotContract.deployed();
  // console.log("tokenizedBallotContract", tokenizedBallotContract.address);
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});
