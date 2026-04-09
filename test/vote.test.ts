import pkgHelpers from "@nomicfoundation/hardhat-network-helpers";
const { loadFixture } = pkgHelpers;
import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("Voting System", function () {
  async function deployVotingFixture() {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const candidates = ["Alice", "Bob"];
    const VoteFactory = await ethers.getContractFactory("Vote");
    const voteContract = await VoteFactory.deploy(candidates);
    return { voteContract, owner, addr1, addr2, addr3, candidates };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { voteContract, owner } = await loadFixture(deployVotingFixture);
      expect(await voteContract.owner()).to.equal(owner.address);
    });
    it("Should have the correct number of candidates", async function () {
      const { voteContract, candidates } = await loadFixture(deployVotingFixture);
      expect(await voteContract.getCandidatesCount()).to.equal(candidates.length);
    });
  });

  describe("Admin Actions", function () {
    it("Should allow admin to add a voter", async function () {
      const { voteContract, addr1 } = await loadFixture(deployVotingFixture);
      await voteContract.addVoter(addr1.address);
      expect(await voteContract.whitelist(addr1.address)).to.be.true;
    });

    it("Should fail if non-admin adds a voter", async function () {
      const { voteContract, addr1, addr2 } = await loadFixture(deployVotingFixture);
      await expect(voteContract.connect(addr1).addVoter(addr2.address))
        .to.be.revertedWith("Seul l'administrateur peut faire cela");
    });

    it("Should allow admin to start voting", async function () {
      const { voteContract } = await loadFixture(deployVotingFixture);
      await voteContract.startVoting();
      expect(await voteContract.votingOpen()).to.be.true;
    });
  });

  describe("Voting Process", function () {
    it("Should fail if voting is closed", async function () {
      const { voteContract, addr1 } = await loadFixture(deployVotingFixture);
      await voteContract.addVoter(addr1.address);
      await expect(voteContract.connect(addr1).vote(0))
        .to.be.revertedWith("Le vote est actuellement ferme");
    });

    it("Should allow a whitelisted user to vote", async function () {
      const { voteContract, addr1 } = await loadFixture(deployVotingFixture);
      await voteContract.addVoter(addr1.address);
      await voteContract.startVoting();

      await voteContract.connect(addr1).vote(0);
      const candidate = await voteContract.getCandidate(0);
      expect(candidate.voteCount).to.equal(1n);
      expect(await voteContract.hasVoted(addr1.address)).to.be.true;
    });

    it("Should prevent double voting", async function () {
      const { voteContract, addr1 } = await loadFixture(deployVotingFixture);
      await voteContract.addVoter(addr1.address);
      await voteContract.startVoting();

      await voteContract.connect(addr1).vote(0);
      await expect(voteContract.connect(addr1).vote(0))
        .to.be.revertedWith("Vous avez deja vote");
    });

    it("Should reject unauthorized voters", async function () {
      const { voteContract, addr2 } = await loadFixture(deployVotingFixture);
      await voteContract.startVoting();
      await expect(voteContract.connect(addr2).vote(0))
        .to.be.revertedWith("Vous n'etes pas autorise a voter");
    });
  });

  describe("Results", function () {
    it("Should return the correct winner", async function () {
      const { voteContract, addr1, addr2, addr3 } = await loadFixture(deployVotingFixture);
      
      await voteContract.addVoter(addr1.address);
      await voteContract.addVoter(addr2.address);
      await voteContract.addVoter(addr3.address);
      await voteContract.startVoting();

      await voteContract.connect(addr1).vote(1);
      await voteContract.connect(addr2).vote(1);
      await voteContract.connect(addr3).vote(0);

      const [winnerName, winnerVotes] = await voteContract.getWinner();
      expect(winnerName).to.equal("Bob");
      expect(winnerVotes).to.equal(2n);
    });
  });
});