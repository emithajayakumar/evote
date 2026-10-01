import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String }
});

const User = mongoose.model('User', userSchema);

async function checkUsers() {
    try {
        await mongoose.connect('mongodb://localhost:27017/athstu');
        const admins = await User.find({ userId: /^KTU/ });
        const students = await User.find({ userId: /^ADR/ });

        console.log('--- ADMINS ---');
        admins.forEach(u => console.log(`${u.userId} | ${u.name}`));

        console.log('\n--- STUDENTS ---');
        students.forEach(u => console.log(`${u.userId} | ${u.name}`));

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkUsers();
