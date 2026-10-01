import mongoose from 'mongoose';

async function setupTestElection() {
    try {
        await mongoose.connect('mongodb://localhost:27017/athstu');

        // 1. Ensure students exist
        const User = mongoose.model('User', new mongoose.Schema({ userId: String, name: String }));
        const RegisteredStudent = mongoose.model('RegisteredStudent', new mongoose.Schema({ userId: String, name: String }));

        const boyId = 'ADR2024VOTER';
        const girlId = 'ADR20CS002';

        // 2. Create Election directly in DB (to bypass UI issues)
        const Election = mongoose.model('Election', new mongoose.Schema({
            title: String,
            status: String,
            startTime: Date,
            endTime: Date,
            candidates: Array,
            onChainElectionId: Number
        }));

        // Delete old test elections
        await Election.deleteMany({ title: "Blockchain Test Election" });

        const now = new Date();
        const start = new Date(now.getTime() - 1000 * 60 * 5); // 5 mins ago
        const end = new Date(now.getTime() + 1000 * 60 * 60); // 1 hour from now

        const newElection = new Election({
            title: "Blockchain Test Election",
            status: "active",
            startTime: start,
            endTime: end,
            candidates: [
                { userId: boyId, name: "Student Test", gender: "Boy", votes: 0, blockchainVoteCount: 0 },
                { userId: girlId, name: "Jane Smith", gender: "Girl", votes: 0, blockchainVoteCount: 0 }
            ],
            onChainElectionId: 1 // Manual assumption or fetch from contract
        });

        await newElection.save();
        console.log('Successfully launched Blockchain Test Election via DB script.');

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

setupTestElection();
