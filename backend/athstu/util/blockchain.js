import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const ABI = [
    "function addCandidate(string memory _userId, string memory _name) public",
    "function addVote(string memory _userId) public",
    "function getVotes(string memory _userId) public view returns (uint256)",
    "function getAllCandidates() public view returns (string[] memory)",
    "event VoteAdded(string candidateId, uint256 newVoteCount, bytes32 transactionHash)"
];

const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
const wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, provider);
const votingContract = new ethers.Contract(process.env.VOTING_CONTRACT_ADDRESS, ABI, wallet);

export const registerCandidateOnChain = async (userId, name) => {
    try {
        console.log(`Registering candidate ${name} (${userId}) on-chain...`);
        const tx = await votingContract.addCandidate(userId, name);
        await tx.wait();
        return tx.hash;
    } catch (error) {
        console.error('Blockchain Registration Error:', error);
        throw error;
    }
};

export const submitVoteOnChain = async (userId) => {
    try {
        console.log(`Submitting vote for ${userId} on-chain...`);
        const tx = await votingContract.addVote(userId);
        await tx.wait();
        return tx.hash;
    } catch (error) {
        console.error('Blockchain Vote Error:', error);
        throw error;
    }
};

export const getOnChainVotes = async (userId) => {
    try {
        const votes = await votingContract.getVotes(userId);
        return votes.toString();
    } catch (error) {
        console.error('Blockchain Fetch Error:', error);
        return "0";
    }
};
