import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { MyERC20Token, TokenSale } from "../typechain-types";

const ERC20_TOKEN_RATIO = 5; // for each 1 ether you get 0.2 tokens
const NFT_TOKEN_PRICE = 0.1;

describe("NFT Shop", async () => {
  let tokenSaleContract: TokenSale;
  let erc20Token: MyERC20Token;
  let deployer: SignerWithAddress;
  let acc1: SignerWithAddress;
  let acc2: SignerWithAddress;

  beforeEach(async () => {
    [deployer, acc1, acc2] = await ethers.getSigners();
    const erc20TokenFactory = await ethers.getContractFactory("MyERC20Token");
    erc20Token = (await erc20TokenFactory.deploy()) as MyERC20Token;
    await erc20Token.deployed();
    const tokenSaleContractFactory = await ethers.getContractFactory(
      "TokenSale"
    );
    tokenSaleContract = (await tokenSaleContractFactory.deploy(
      ERC20_TOKEN_RATIO,
      NFT_TOKEN_PRICE,
      erc20Token.address
    )) as TokenSale;
    await tokenSaleContract.deployed();
    const MINTER_ROLE = await erc20Token.MINTER_ROLE();
    const grantRoleTx = await erc20Token.grantRole(
      MINTER_ROLE,
      tokenSaleContract.address
    );
    //granting a minter role to a token contract so token can mint new tokens
    await grantRoleTx.wait();
  });

  describe("When the Shop contract is deployed", async () => {
    it("defines the ratio as provided in parameters", async () => {
      const ratio = await tokenSaleContract.ratio();
      expect(ratio).to.eq(ERC20_TOKEN_RATIO);
    });

    it("uses a valid ERC20 as payment token", async () => {
      const paymentTokenAddress = await tokenSaleContract.paymentToken();
      expect(paymentTokenAddress).to.eq(erc20Token.address);
      const erc20TokenFactory = await ethers.getContractFactory("MyERC20Token");
      const paymentTokenContract =
        erc20TokenFactory.attach(paymentTokenAddress);
      const myBalance = await paymentTokenContract.balanceOf(deployer);
      expect(myBalance).to.eq(0);
      const totalSupply = await paymentTokenContract.totalSupply();
      expect(totalSupply).to.eq(0);
      // check if contract have totalSupply/balanceOf function, it meants that its indeed valid erc20 token
    });
  });

  describe("When a user purchase an ERC20 from the Token contract", async () => {
    const amountToBeSentBn = ethers.utils.parseEther("1");
    const amountToBeReceived = amountToBeSentBn.div(ERC20_TOKEN_RATIO);
    let balanceBeforeBn: BigNumber;
    let purchasegasCosts: BigNumber;

    beforeEach(async () => {
      balanceBeforeBn = await acc1.getBalance();
      console.log(balanceBeforeBn);
      const purchaseTokensTx = await tokenSaleContract
        .connect(acc1)
        .purchaseTokens({ value: amountToBeSentBn });
      const purchaseTokensTxReceipt = await purchaseTokensTx.wait();
      const gasUnitsUsed = purchaseTokensTxReceipt.gasUsed;
      const gasPrice = purchaseTokensTxReceipt.effectiveGasPrice;
      purchasegasCosts = gasUnitsUsed.mul(gasPrice);
    });
    it("charges the correct amount of ETH", async () => {
      const balanceAfterBn = await acc1.getBalance();
      const diff = balanceBeforeBn.sub(balanceAfterBn);
      const expectedDiff = amountToBeSentBn.add(purchasegasCosts);
      expect(expectedDiff).to.eq(diff);
    });

    it("gives the correct amount of tokens", async () => {
      const acc1Balance = await erc20Token.balanceOf(acc1.address);
      expect(acc1Balance).to.eq(amountToBeReceived);
      //make sure we got 0.2 tokens for 1 ether
    });
    it("increases the balance of Eth in the contract", async () => {
      const contractBalanceBn = await ethers.provider.getBalance(
        tokenSaleContract.address
      );
      expect(contractBalanceBn).to.eq(amountToBeSentBn);
    });
    describe("When a user burns an ERC20 at the Token contract", async () => {
      // const amountToBeSentBn = ethers.utils.parseEther("1");
      let burnGasCosts: BigNumber;
      let approveGasCosts: BigNumber;

      beforeEach(async () => {
        const approveTx = await erc20Token
          .connect(acc1)
          .approve(tokenSaleContract.address, amountToBeReceived);
        //first, set allowance by approve function, allow tokensale contract to manipulate ur funds
        const approveTxReceipt = await approveTx.wait();
        const approveGasUnitsUsed = approveTxReceipt.gasUsed;
        const approveGasPrice = approveTxReceipt.effectiveGasPrice;
        approveGasCosts = approveGasUnitsUsed.mul(approveGasPrice);

        const burnTokensTx = await tokenSaleContract
          .connect(acc1)
          .burnTokens(amountToBeReceived);
        const burnTokensTxReceipt = await burnTokensTx.wait();
        const burnGasUnitsUsed = burnTokensTxReceipt.gasUsed;
        const burnGasPrice = burnTokensTxReceipt.effectiveGasPrice;
        burnGasCosts = burnGasUnitsUsed.mul(burnGasPrice);
      });
      it("gives the correct amount of ETH", async () => {
        const balanceAfterBn = await acc1.getBalance();
        const diff = balanceBeforeBn.sub(balanceAfterBn);
        const expectedDiff = purchasegasCosts
          .add(approveGasCosts)
          .add(burnGasCosts);
        expect(diff).to.eq(expectedDiff);
      });

      it("burns the correct amount of tokens", async () => {
        const acc1Balance = await erc20Token.balanceOf(acc1.address);
        expect(acc1Balance).to.eq(0);
        const totalSupply = await erc20Token.totalSupply();
        expect(totalSupply).to.eq(0);
      });
    });

    describe("When a user purchase a NFT from the Shop contract", async () => {
      it("charges the correct amount of ERC20 tokens", async () => {
        throw new Error("Not implemented");
      });

      it("updates the owner account correctly", async () => {
        throw new Error("Not implemented");
      });

      it("update the pool account correctly", async () => {
        throw new Error("Not implemented");
      });

      it("favors the pool with the rounding", async () => {
        throw new Error("Not implemented");
      });
    });
  });
  describe("When a user burns their NFT at the Shop contract", async () => {
    it("gives the correct amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    });
    it("updates the pool correctly", async () => {
      throw new Error("Not implemented");
    });
  });

  describe("When the owner withdraw from the Shop contract", async () => {
    it("recovers the right amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    });

    it("updates the owner account correctly", async () => {
      throw new Error("Not implemented");
    });
  });
});
