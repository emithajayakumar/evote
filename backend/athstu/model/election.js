import mongoose from 'mongoose';

const electionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    boyCandidates: [{
        userId: { type: String, required: true },
        name: { type: String, required: true },
        avatar: { type: String },
        votes: { type: Number, default: 0 }
    }],
    girlCandidates: [{
        userId: { type: String, required: true },
        name: { type: String, required: true },
        avatar: { type: String },
        votes: { type: Number, default: 0 }
    }],
    votedBy: [{ type: String }],
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const Election = mongoose.model('Election', electionSchema);
export default Election;
