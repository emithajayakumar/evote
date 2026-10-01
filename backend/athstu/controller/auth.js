import User from "../model/user.js";
import RegisteredStudent from "../model/registeredStudent.js";
import Election from "../model/Election.js";
import crypto from 'crypto'
import { sendOtp } from '../util/sendmail.js'
import { registerCandidateOnChain, submitVoteOnChain } from "../util/blockchain.js";

export const register = async (req, res) => {
    console.log(req.body);
    const { name, userId, email, password } = req.body;

    if (!userId.startsWith('ADR') && !userId.startsWith('KTU')) {
        return res.json({ message: 'ID must start with ADR (Student) or KTU (Teacher/Admin)' });
    }

    try {
        const check = await User.findOne({ $or: [{ email }, { userId }] })
        if (check) {
            return res.json({ message: 'User already exists with this email or ID' })
        }
        await new User({ name, userId, email, password }).save();
        return res.json({ message: 'registeration successfull' })
    }
    catch (err) {
        return res.json({ message: 'error occurd' })
    }
}

export const otpgeneration = async (req, res) => {
    const { userId } = req.body;
    try {
        const check = await User.findOne({ userId })
        if (!check) {
            return res.json({ message: 'user not found' })
        }
        const otp = crypto.randomInt(100000, 999999).toString();
        check.otp = otp
        check.otpExp = Date.now() + 10 * 60 * 1000;
        await check.save();

        await sendOtp(check.email, otp);
        return res.json({ message: 'otp send ' })

    }
    catch (err) {
        return res.json({ message: 'error occurd' })
    }
}
export const otpverfy = async (req, res) => {
    const { userId, otp } = req.body;
    try {
        const check = await User.findOne({ userId })
        if (!check) {
            return res.json({ message: 'user not found' })
        }
        if (check.otp != otp || check.otpExp < Date.now()) {
            return res.json({ message: 'invalid otp' })
        }
        check.otp = null;
        check.otpExp = null;
        await check.save();
        return res.json({ message: 'verifed successfully' });

    }
    catch (err) {
        return res.json({ message: 'error occurd' })
    }
}
export const findUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json({
            name: user.name,
            userId: user.userId,
            email: user.email,
            class: user.class || "",
            year: user.year || "",
            department: user.department || ""
        });
    }
    catch (err) {
        return res.status(500).json({ message: 'Error occurred while searching for user' });
    }
}

export const updateProfile = async (req, res) => {
    const { userId } = req.params;
    const { name, class: userClass, year, department } = req.body;
    try {
        const user = await User.findOneAndUpdate(
            { userId },
            { $set: { name, class: userClass, year, department } },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json({
            message: 'Profile updated successfully',
            user: {
                name: user.name,
                userId: user.userId,
                email: user.email,
                class: user.class,
                year: user.year,
                department: user.department
            }
        });
    } catch (err) {
        return res.status(500).json({ message: 'Error updating profile' });
    }
}

export const getRegisteredStudents = async (req, res) => {
    try {
        const students = await RegisteredStudent.find().sort({ addedAt: 1 });
        return res.json(students);
    } catch (err) {
        return res.status(500).json({ message: 'Error fetching registered students' });
    }
}

export const addRegisteredStudent = async (req, res) => {
    const { userId } = req.body;
    try {
        // First, find the user in the main DB
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found in database' });
        }
        // User must be a student (ADR prefix)
        if (!userId.startsWith('ADR')) {
            return res.status(403).json({ message: 'Only students (ADR prefix) can be registered for voting.' });
        }
        // Check if already registered
        const existing = await RegisteredStudent.findOne({ userId });
        if (existing) {
            return res.status(409).json({ message: 'Student is already registered' });
        }
        const student = await new RegisteredStudent({
            userId: user.userId,
            name: user.name,
            email: user.email
        }).save();
        return res.json({ userId: student.userId, name: student.name, email: student.email });
    } catch (err) {
        return res.status(500).json({ message: 'Error adding registered student' });
    }
}

export const deleteRegisteredStudent = async (req, res) => {
    const { userId } = req.params;
    try {
        await RegisteredStudent.deleteOne({ userId });
        return res.json({ message: 'Student removed successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'Error removing student' });
    }
}

export const launchElection = async (req, res) => {
    const { title, startTime, endTime, boyCandidates, girlCandidates, timezoneOffset } = req.body;
    try {
        // Deactivate any currently active elections
        await Election.updateMany({ isActive: true }, { $set: { isActive: false } });

        // Frontend sends local string "YYYY-MM-DDTHH:mm" and offset in minutes (e.g. -330 for IST)
        // We need to parse this local time string as if it was in the frontend's timezone,
        // and get the true UTC Date.
        // Javascript's `new Date("YYYY-MM-DDTHH:mm")` assumes local system time, which breaks if server is in UTC.
        // Instead, we force it to parse as UTC by appending "Z", then we add the frontend offset back.
        // Note: getTimezoneOffset() returns minutes *behind* UTC (e.g. IST +5:30 is -330).

        const parseWithOffset = (localStr, offsetMins) => {
            // Append Z to parse the raw numbers as UTC
            const d = new Date(`${localStr}Z`);
            // Add the offset (in minutes) to shift it back to the true UTC time
            // Example for IST: "15:30", offset -330.
            // d is 15:30 UTC. True UTC is 10:00 UTC. So we add 330 minutes.
            d.setMinutes(d.getMinutes() + offsetMins);
            return d;
        };

        const trueStartUTC = parseWithOffset(startTime, timezoneOffset || 0);
        const trueEndUTC = parseWithOffset(endTime, timezoneOffset || 0);

        // Create the new election
        const newElection = new Election({
            title,
            startTime: trueStartUTC,
            endTime: trueEndUTC,
            boyCandidates,
            girlCandidates,
            isActive: true
        });

        await newElection.save();

        // Blockchain Registration: Register all candidates on-chain
        try {
            for (const boy of boyCandidates) {
                await registerCandidateOnChain(boy.userId, boy.name);
            }
            for (const girl of girlCandidates) {
                await registerCandidateOnChain(girl.userId, girl.name);
            }
        } catch (bcError) {
            console.error('Warning: Blockchain candidate registration failed:', bcError);
            // We continue as the MongoDB record is the primary source, but we log the error.
        }

        return res.json({ message: 'Election launched successfully and synced to blockchain!', election: newElection });
    } catch (err) {
        console.error('Error launching election:', err);
        return res.status(500).json({ message: 'Error launching election' });
    }
}

export const getActiveElection = async (req, res) => {
    try {
        const activeElection = await Election.findOne({ isActive: true });

        if (!activeElection) {
            return res.status(404).json({ message: 'No active election found' });
        }

        // Check if current time is within election window
        const now = new Date();
        const isVotingOpen = now >= activeElection.startTime && now <= activeElection.endTime;

        let statusMessage = '';
        if (now < activeElection.startTime) {
            statusMessage = 'Voting has not started yet.';
        } else if (now > activeElection.endTime) {
            statusMessage = 'Voting has ended.';
        }

        return res.json({
            election: activeElection,
            isVotingOpen,
            statusMessage,
            serverTime: now
        });
    } catch (err) {
        return res.status(500).json({ message: 'Error fetching active election' });
    }
}

export const endActiveElection = async (req, res) => {
    try {
        const activeElection = await Election.findOne({ isActive: true });
        if (!activeElection) {
            return res.status(404).json({ message: 'No active election found to end.' });
        }

        // Set the endTime to the current exact time to instantly close voting
        activeElection.endTime = new Date();
        activeElection.isActive = false; // Optionally mark as inactive if that's the desired permanent state

        await activeElection.save();
        return res.json({ message: 'Voting session has been forcefully ended.', election: activeElection });

    } catch (err) {
        console.error('Error ending election:', err);
        return res.status(500).json({ message: 'Error ending the active election.' });
    }
}

export const submitVote = async (req, res) => {
    const { electionId } = req.params;
    const { userId, selectedBoy, selectedGirl } = req.body;

    try {
        const election = await Election.findById(electionId);
        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        // Check if student is active/registered
        const student = await RegisteredStudent.findOne({ userId });
        if (!student) {
            return res.status(403).json({ message: 'You are not registered to vote.' });
        }

        // Check if time is valid
        const now = new Date();
        if (now < election.startTime || now > election.endTime) {
            return res.status(400).json({ message: 'Voting is not open for this election.' });
        }

        // Check if already voted
        if (election.votedBy.includes(userId)) {
            return res.status(400).json({ message: 'You have already voted in this election.' });
        }

        // Record vote in MongoDB
        election.votedBy.push(userId);

        // Find and increment the votes for the selected candidates in MongoDB
        const boyCandidate = election.boyCandidates.find(c => c.userId === selectedBoy);
        if (boyCandidate) boyCandidate.votes += 1;

        const girlCandidate = election.girlCandidates.find(c => c.userId === selectedGirl);
        if (girlCandidate) girlCandidate.votes += 1;

        await election.save();

        // Record vote on Blockchain (Audit Trail)
        let boyTxHash = null;
        let girlTxHash = null;
        try {
            if (selectedBoy) boyTxHash = await submitVoteOnChain(selectedBoy);
            if (selectedGirl) girlTxHash = await submitVoteOnChain(selectedGirl);
        } catch (bcError) {
            console.error('Warning: Blockchain vote submission failed:', bcError);
        }

        return res.json({
            message: 'Vote submitted successfully!',
            auditTrail: {
                boyTxHash,
                girlTxHash
            }
        });
    } catch (err) {
        console.error('Error submitting vote:', err);
        return res.status(500).json({ message: 'Error submitting vote' });
    }
}

export const getVotingHistory = async (req, res) => {
    const { userId } = req.params;

    try {
        // Find all elections where the user's ID is in the votedBy array
        const elections = await Election.find({ votedBy: userId }).sort({ createdAt: -1 });

        return res.json({
            count: elections.length,
            history: elections
        });
    } catch (err) {
        console.error('Error fetching voting history:', err);
        return res.status(500).json({ message: 'Error fetching voting history' });
    }
}
