import Post from '../Models/Post.js';
import User from '../Models/User.js';

export const createPost = async (req, res) => {
    const post = req.body;
    const user = await User.findById(req.userId);
    const newPost = new Post({ ...post, user: req.userId, username: user.username, userpic: user.profile });
    try {
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        return res.status(409).json({ error });
    }
}


export const getMyPosts = async (req, res) => {
    try {
        const myPosts = await Post.find({ user: req.userId }).sort({ _id: -1 });
        if (!myPosts) {
            return res.status(200).json({ result: "You don't have any posts" });
        }
        res.status(201).json(myPosts);
    } catch (error) {
        return res.status(409).json({ error });
    }
}


export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = req.body;
        const isPostAvailable = await Post.findById(id);
        if (!isPostAvailable) {
            return res.status(404).send('No Post found')
        }
        const updatedPost = await Post.findByIdAndUpdate(id, { ...post, id }, { new: true })
        res.status(201).json(updatedPost);
    } catch (error) {
        return res.status(409).json({ error });
    }
}


export const likePost = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
        if (!userId) {
            return res.status(404).send("Unauthorized User")
        }
        let post = await Post.findById(id);
        if (!post) {
            return res.status(404).send('No Post found')
        }
        if (!post.likes.includes(userId)) {
            await post.updateOne({ $push: { likes: userId } })
        }
        else {
            await post.updateOne({ $pull: { likes: userId } })
        }
        res.status(200).json(post);
    } catch (error) {
        return res.status(409).json({ error });
    }
}


export const commentPost = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    const { username, comment } = req.body;
    const comments = { username, comment }
    try {
        if (!userId) {
            return res.status(404).send("Unauthorized User")
        }
        let post = await Post.findById(id);
        if (!post) {
            return res.status(404).send('No Post found')
        }
        await post.updateOne({ $push: { comments } })
        res.status(200).json(post);
    } catch (error) {
        return res.status(409).json({ error });
    }
}


export const deletePost = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    try {
        const post = await Post.findById(id);

        if (!post.user.equals(userId)) {
            return res.status(409).json("You are not allowed to delete this post");
        }
        await Post.findByIdAndDelete(id);
        res.status(200).json("Post deleted successfully");
    } catch (error) {
        return res.status(409).json({ error });
    }
}