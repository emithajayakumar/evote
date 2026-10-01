import express from 'express'
import { register, otpverfy, otpgeneration, findUser, getRegisteredStudents, addRegisteredStudent, deleteRegisteredStudent, launchElection, getActiveElection, endActiveElection, submitVote, getVotingHistory, updateProfile } from "../controller/auth.js"

const router = express.Router()

router.post('/register', register)

router.post('/otpgeneration', otpgeneration)

router.post('/otpverfy', otpverfy)

router.get('/find-user/:userId', findUser)
router.put('/update-profile/:userId', updateProfile)

router.get('/registered-students', getRegisteredStudents)
router.post('/registered-students', addRegisteredStudent)
router.delete('/registered-students/:userId', deleteRegisteredStudent)

router.post('/elections', launchElection)
router.get('/elections/active', getActiveElection)
router.post('/elections/end', endActiveElection)
router.post('/vote/:electionId', submitVote)
router.get('/student/votes/:userId', getVotingHistory)

export default router;