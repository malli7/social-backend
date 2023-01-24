import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profile: {
        type: String,
    },
    bio: {
        type: String,
    },
    phonenumber: {
        type: String,
        required: true
    },
    followers: {
        type: [String],
        default: []
    },
    following: {
        type: [String],
        default: []
    },

})

const User = mongoose.model("User", userSchema);
export default User;