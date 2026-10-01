import mongoose from 'mongoose';

const electionSchema = new mongoose.Schema({
    title: String,
    status: String,
    candidates: Array
});

const Election = mongoose.model('Election', electionSchema);

async function checkElections() {
    try {
        await mongoose.connect('mongodb://localhost:27017/athstu');
        const elections = await Election.find({});
        console.log('--- ELECTIONS ---');
        elections.forEach(e => {
            console.log(`Title: ${e.title} | Status: ${e.status} | Candidates: ${e.candidates.length}`);
        });
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkElections();
