import express from 'express';
import { registerUser, getUsers, loginUser, logout } from '../controllers/authController.js';
import { getmyProfile } from '../controllers/userManagement.js';
import { middleware } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.get('/getusers', getUsers);
router.post('/login', loginUser);
router.post('/logout', logout);
router.get('/profile', middleware, getmyProfile);


export default router;