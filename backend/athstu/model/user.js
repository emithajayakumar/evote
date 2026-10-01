import mongoose from "mongoose"

const userSchima = new mongoose.Schema({
    name: { type: String, required: true },
    userId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    class: { type: String, default: "" },
    year: { type: String, default: "" },
    department: { type: String, default: "" },
    otp: { type: String },
    otpExp: { type: Date }
})

const User = mongoose.model('User', userSchima)
export default User;