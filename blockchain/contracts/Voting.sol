// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Voting {
    address public owner;
    
    struct Candidate {
        string userId;
        string name;
        uint256 voteCount;
    }

    mapping(string => Candidate) public candidates;
    string[] public candidateIds;
    mapping(string => bool) public candidateExists;

    event VoteAdded(string candidateId, uint256 newVoteCount, bytes32 transactionHash);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addCandidate(string memory _userId, string memory _name) public onlyOwner {
        if (!candidateExists[_userId]) {
            candidates[_userId] = Candidate(_userId, _name, 0);
            candidateIds.push(_userId);
            candidateExists[_userId] = true;
        }
    }

    function addVote(string memory _userId) public onlyOwner {
        require(candidateExists[_userId], "Candidate does not exist");
        candidates[_userId].voteCount += 1;
        emit VoteAdded(_userId, candidates[_userId].voteCount, blockhash(block.number - 1));
    }

    function getVotes(string memory _userId) public view returns (uint256) {
        require(candidateExists[_userId], "Candidate does not exist");
        return candidates[_userId].voteCount;
    }

    function getAllCandidates() public view returns (string[] memory) {
        return candidateIds;
    }
}
