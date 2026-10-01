import mongoose from 'mongoose';
import Election from './model/election.js';

async function cleanup() {
    try {
        await mongoose.connect('mongodb://localhost:27017/evote');
        console.log('Connected to MongoDB');
        const result = await Election.deleteMany({});
        console.log(`Deleted ${result.deletedCount} elections`);
        process.exit(0);
    } catch (err) {
        console.error('Error during cleanup:', err);
        process.exit(1);
    }
}

cleanup();
