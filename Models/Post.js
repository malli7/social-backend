import mongoose from "mongoose";

const postSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    username: {
        type: String
    },
    userpic: {
        type: String
    },
    title: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    video: {
        type: String,
    },
    likes: {
        type: [String],
        default: []
    },
    comments: [{
        username: {
            type: String
        },
        comment: {
            type: String
        }
    }],
    createdAt: {
        type: Date,
        default: new Date().toISOString()
    },

})

const Post = mongoose.model("Post", postSchema);
export default Post;