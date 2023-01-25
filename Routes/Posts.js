import express from "express";
import { createPost, getMyPosts, updatePost, likePost, commentPost, deletePost, sendMessage, getChat } from "../Controllers/PostsControllers.js";
import Auth from "../middeware/Auth.js";
const router = express.Router();

router.post('/createpost', Auth, createPost);

router.get('/getmyposts', Auth, getMyPosts);

router.patch('/updatepost/:id', Auth, updatePost);

router.delete('/deletepost/:id', Auth, deletePost);

router.patch('/updatepost/:id/likepost', Auth, likePost);

router.patch('/updatepost/:id/commentpost', Auth, commentPost);

router.post('/msg', Auth, sendMessage);

router.post('/chat/:userid1/:userid2', Auth, getChat);


export default router;