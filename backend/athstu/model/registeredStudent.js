import mongoose from "mongoose";

const registeredStudentSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    addedAt: { type: Date, default: Date.now }
});

const RegisteredStudent = mongoose.model('RegisteredStudent', registeredStudentSchema);
export default RegisteredStudent;
