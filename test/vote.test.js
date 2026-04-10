import { expect } from "chai";
import hre from "hardhat";

describe("Voting System", function () {
  async function deployVotingFixture() {
    const { ethers } = hre;
    const [owner, addr1] = await ethers.getSigners();
    
    const candidates = ["Alice", "Bob"];
    const VoteFactory = await ethers.getContractFactory("Vote");
    const voteContract = await VoteFactory.deploy(candidates);
    
    const { loadFixture } = hre.network.helpers;
    return { voteContract, owner, addr1, loadFixture };
  }

  it("Should set the right owner", async function () {
    const { voteContract, owner } = await deployVotingFixture();
    expect(await voteContract.owner()).to.equal(owner.address);
  });

  it("Should allow voting after whitelist and start", async function () {
    const { voteContract, addr1 } = await deployVotingFixture();
    
    await voteContract.addVoter(addr1.address); 
    await voteContract.startVoting();           
    
    await voteContract.connect(addr1).vote(0);
    
    const candidate = await voteContract.getCandidate(0);
    expect(candidate.voteCount).to.equal(1n);
  });
});