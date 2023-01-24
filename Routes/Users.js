import express from "express";
const router = express.Router();
import { createUser, login, follow, followingPosts, updateProfile, deleteUser, suggestions, followingDetails, unfollow, followersDetails, explorePosts, profile, profileByUserName } from '../Controllers/UsersControllers.js'
import Auth from "../middeware/Auth.js";

router.post('/signup', createUser);

router.post('/signin', login);

router.patch('/update', Auth, updateProfile);

router.patch('/follow/:id', Auth, follow);

router.patch('/unfollow/:id', Auth, unfollow);

router.get('/following', Auth, followingPosts);

router.get('/exploreposts/', Auth, explorePosts);

router.get('/followingdetails', Auth, followingDetails);

router.get('/followersdetails', Auth, followersDetails);

router.delete('/delete', Auth, deleteUser);

router.get('/suggestions', Auth, suggestions);

router.get('/profile/:id', Auth, profile);


router.get('/profilebyusername/:username', Auth, profileByUserName);



export default router;