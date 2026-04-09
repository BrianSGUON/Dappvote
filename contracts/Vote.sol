// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Voting {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    address public owner;
    bool public votingOpen;
    Candidate[] public candidates;
    mapping(address => bool) public whitelist;
    mapping(address => bool) public hasVoted;

    event VoterAdded(address indexed voterAddress);
    event VotingStarted();
    event VoteCast(address indexed voter, uint256 indexed candidateIndex);

    modifier onlyOwner() {
        require(msg.sender == owner, "Seul l'administrateur peut faire cela");
        _;
    }

    modifier onlyVoter() {
        require(whitelist[msg.sender], "Vous n'etes pas autorise a voter");
        _;
    }

    modifier votingIsOpen() {
        require(votingOpen, "Le vote est actuellement ferme");
        _;
    }

    constructor(string[] memory _candidateNames) {
        owner = msg.sender;
        for (uint256 i = 0; i < _candidateNames.length; i++) {
            candidates.push(Candidate({
                name: _candidateNames[i],
                voteCount: 0
            }));
        }
    }

    function addVoter(address _voter) external onlyOwner {
        require(!whitelist[_voter], "Cet electeur est deja inscrit");
        whitelist[_voter] = true;
        emit VoterAdded(_voter);
    }

    function startVoting() external onlyOwner {
        require(!votingOpen, "Le vote est deja ouvert");
        votingOpen = true;
        emit VotingStarted();
    }

    function vote(uint256 _candidateIndex) external onlyVoter votingIsOpen {
        require(!hasVoted[msg.sender], "Vous avez deja vote");
        require(_candidateIndex < candidates.length, "Candidat invalide");

        hasVoted[msg.sender] = true;
        candidates[_candidateIndex].voteCount++;

        emit VoteCast(msg.sender, _candidateIndex);
    }

    function getCandidatesCount() external view returns (uint256) {
        return candidates.length;
    }

    function getCandidate(uint256 _index) external view returns (string memory name, uint256 voteCount) {
        require(_index < candidates.length, "Index invalide");
        Candidate storage candidate = candidates[_index];
        return (candidate.name, candidate.voteCount);
    }

    function getWinner() external view returns (string memory winnerName, uint256 winnerVotes) {
        uint256 winningVoteCount = 0;
        uint256 winningIndex = 0;

        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > winningVoteCount) {
                winningVoteCount = candidates[i].voteCount;
                winningIndex = i;
            }
        }
        return (candidates[winningIndex].name, candidates[winningIndex].voteCount);
    }
}