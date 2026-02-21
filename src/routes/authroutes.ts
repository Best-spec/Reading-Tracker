import express from 'express';
import { registerUser, getUsers, loginUser, logout, middleware } from '../controllers/authController.js';
import { getUserProfile } from '../controllers/userManagement.js';
import { get } from 'node:http';

const router = express.Router();

router.post('/register', registerUser);
router.get('/getusers', getUsers);
router.post('/login', loginUser);
router.post('/logout', logout);
router.get('/profile', middleware, getUserProfile);


export default router;