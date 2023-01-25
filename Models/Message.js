import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
    chatUsers: {
        type: [String],
        default: [],
        require: true
    },
    message: {
        type: String,
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

}, { timestamps: true })

const Message = mongoose.model("Message", messageSchema);
export default Message;