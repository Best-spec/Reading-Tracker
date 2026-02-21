import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import e from 'express';
import jwt from 'jsonwebtoken';
import { validateUserData } from '../utils/validate.js';
import { User, AuthenticatedRequest } from '../types/user.js';
import { authservices } from '../services/authServices.js';

let users: User[] = [];

// ฟังก์ชันนี้จะรับข้อมูลจาก req.body แล้วทำการตรวจสอบและบันทึกผู้ใช้ใหม่
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { username, password, email } = req.body;
    
        const user = await authservices.register(username, password, email);

        console.log('สมัครสมาชิกใหม่:', user);
        res.status(201).json({ message: 'Register สำเร็จ!', user: { user } });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// ฟังก์ชันนี้จะรับข้อมูลจาก req.body แล้วทำการตรวจสอบและล็อกอินผู้ใช้
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        
        const token = await authservices.login(username, password);

        res.cookie('token', token.token, { 
            httpOnly: true, 
            secure: false,
            sameSite: 'strict',
        });
    
        res.status(200).json({ 
            message: 'Login สำเร็จ!',
            user: token.user.username,
            token: token.token
        });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};


// ฟังก์ชันนี้จะลบ cookie ที่เก็บ token เพื่อทำการ logout
export const logout = (req: Request, res: Response) => {
    res.clearCookie('token');
    res.json({ message: 'Logout สำเร็จ!' });
};

// ฟังก์ชันนี้จะส่งรายชื่อผู้ใช้ทั้งหมดกลับไปยัง client
export const getUsers = (req: Request, res: Response) => {
    res.json(users);
};
