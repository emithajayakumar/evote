import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    otp: { type: String }
});

const User = mongoose.model('User', userSchema);

async function getOtp(userId) {
    try {
        await mongoose.connect('mongodb://localhost:27017/athstu');
        const user = await User.findOne({ userId });
        if (user) {
            console.log(`OTP for ${userId}: ${user.otp}`);
        } else {
            console.log(`User ${userId} not found.`);
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

const userId = process.argv[2];
if (!userId) {
    console.log('Please provide a userId');
    process.exit(1);
}

getOtp(userId);
