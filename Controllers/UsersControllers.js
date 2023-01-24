import User from "../Models/User.js";
import Post from "../Models/Post.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const JWTSEC = process.env.JWTSEC || "test";
import mongoose from "mongoose";

export const createUser = async (req, res) => {
    const { email, password, username, profile, phonenumber } = req.body;
    try {
        const user = await User.findOne({ email });
        const userWithUserName = await User.findOne({ username });
        if (user || userWithUserName) {
            return res.status(400).json({ error: "User already exists" })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const result = await User.create({ email, password: hashedPassword, username, profile, phonenumber });
        const token = await jwt.sign({ username: result.username, id: result._id }, JWTSEC);
        await res.status(200).json({ token, result });
    } catch (error) {
        res.status(404).json({ error });
    }
}


export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User doesnot exist" })
        }
        const isPassCorrect = await bcrypt.compare(password, user.password);
        if (!isPassCorrect) {
            return res.status(404).json({ error: "Invalid Credentials" })
        }
        const token = await jwt.sign({ username: user.username, id: user._id }, JWTSEC);
        res.status(200).json({ token, result: user })
    } catch (error) {
        res.json({ error })
    }
}


export const follow = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    try {
        if (id !== userId) {
            let currentUser = await User.findById(userId);
            const otherUser = await User.findById(id);
            if (!currentUser || !otherUser) {
                return res.status(400).json("User not found");
            }
            if (!otherUser.followers.includes(userId)) {
                await otherUser.updateOne({ $push: { followers: userId } });
                let currentUser = await User.findByIdAndUpdate(userId, { $push: { following: id } }, { new: true });
                await res.status(200).json(currentUser);
            }
            else {
                return res.status(400).json(currentUser);
            }
        }
        else {
            return res.status(400).json("you can't follow yourself");
        }
    } catch (error) {
        res.status(404).json({ error })
    }
}


export const unfollow = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    try {
        if (id !== userId) {
            let currentUser = await User.findById(userId);
            const otherUser = await User.findById(id);
            if (!currentUser || !otherUser) {
                return res.status(400).json("User not found");
            }
            if (otherUser.followers.includes(userId)) {
                await otherUser.updateOne({ $pull: { followers: userId } });
                let currentUser = await User.findByIdAndUpdate(userId, { $pull: { following: id } }, { new: true });
                await res.status(200).json(currentUser);
            }
            else {
                return res.status(400).json(currentUser);
            }
        }
        else {
            return res.status(400).json("you can't follow yourself");
        }
    } catch (error) {
        res.status(404).json({ error })
    }
}


export const updateProfile = async (req, res) => {
    const userProfile = req.body;
    const id = req.userId;
    try {
        const user = await User.findById(req.userId);
        let a = {}
        if (userProfile.profile) { a = { ...a, profile: userProfile.profile } } else { a = { ...a, profile: await user.profile } }
        if (userProfile.username) { a = { ...a, username: userProfile.username } } else { a = { ...a, username: await user.username } }
        if (userProfile.bio) { a = { ...a, bio: userProfile.bio } } else { a = { ...a, bio: await user.bio } }
        if (userProfile.phonenumber) { a = { ...a, phonenumber: userProfile.phonenumber } } else { a = { ...a, phonenumber: await user.phonenumber } }
        const updatedUser = await User.findByIdAndUpdate(req.userId, { ...a, id: req.userId }, { new: true });

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(404).json({ error })
    }
}


export const deleteUser = async (req, res) => {
    const { id } = req.userId;
    try {
        await User.findByIdAndDelete(id);
        res.status(200).json("Account deleted successfully");
    } catch (error) {
        res.status(404).json({ error })
    }
}


export const suggestions = async (req, res) => {
    const id = req.userId;
    try {
        const user = await User.findById(id);
        const excludedUsers = [user._id, ...user.following.map((user) => (mongoose.Types.ObjectId(user)))];
        const users = await User.aggregate([
            { $match: { _id: { $nin: excludedUsers } } },
            { $sample: { size: 10 } }
        ]);
        res.status(200).json(users);
    } catch (error) {
        res.status(404).json({ error })
    }
}


export const followingDetails = async (req, res) => {
    const id = req.userId;
    const user = await User.findById(id);
    let followingdetails = []
    await Promise.all(user.following.map(async (item) => {
        const user = await User.findById(item);
        followingdetails = [...followingdetails, user]
    }));
    res.status(200).json(followingdetails)
}


export const followersDetails = async (req, res) => {
    const id = req.userId;
    const user = await User.findById(id);
    let followersdetails = []
    await Promise.all(user.followers.map(async (item) => {
        const user = await User.findById(item);
        followersdetails = [...followersdetails, user]
    }));
    res.status(200).json(followersdetails)
}


export const followingPosts = async (req, res) => {
    const id = req.userId;
    try {
        const user = await User.findById(id);
        const followingPosts = await Promise.all(
            user.following.map((item) => {
                return Post.find({ user: item }).sort({ _id: -1 })
            })
        );
        let a = []
        for (const i in followingPosts) {
            const element = followingPosts[i];
            a = [...a, ...element]
        }
        res.status(200).json(a);
    } catch (error) {
        res.status(404).json({ error })
    }
}


export const explorePosts = async (req, res) => {
    const id = req.userId;
    const user = await User.findById(id);
    const excludedUsers = [user._id, ...user.following.map((user) => (mongoose.Types.ObjectId(user)))];

    const users = await User.aggregate([
        { $match: { _id: { $nin: excludedUsers } } },
        { $project: { _id: 1 } },
        { $group: { _id: null, ids: { $push: "$_id" } } }
    ])

    const followingPosts = await Promise.all(
        users[0].ids.map((item) => {
            return Post.find({ user: item })
        })
    );
    let a = []
    for (const i in followingPosts) {
        const element = followingPosts[i];
        a = [...a, ...element]
    }
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    res.status(200).json(a);

}

export const profile = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(mongoose.Types.ObjectId(id));
        if (!user) {
            return res.status(401).json({ errors: "no user with that id found" })
        }
        const userPosts = await Post.find({ user: id }).sort({ _id: -1 });
        res.status(201).json({ user, userPosts });
    } catch (error) {
        res.status(404).json(error)
    }
}


export const profileByUserName = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ errors: "no user with that name found" })
        }
        const userPosts = await Post.find({ user: user._id }).sort({ _id: -1 });
        res.status(201).json({ user, userPosts });
    } catch (error) {
        res.status(404).json(error)
    }
}