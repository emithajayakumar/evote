import mongoose from 'mongoose';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    otp: { type: String },
    otpExp: { type: Date },
    email: { type: String }
});

const User = mongoose.model('User', userSchema);

async function triggerOtp(userId) {
    try {
        await mongoose.connect('mongodb://localhost:27017/athstu');
        const user = await User.findOne({ userId });
        if (!user) {
            console.log(`User ${userId} not found.`);
            process.exit(1);
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        user.otp = otp;
        user.otpExp = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        console.log(`Successfully generated OTP for ${userId}: ${otp}`);
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

const userId = process.argv[2] || 'ADR2024VOTER';
triggerOtp(userId);
