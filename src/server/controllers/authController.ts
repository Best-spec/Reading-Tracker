import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import e from 'express';
import jwt from 'jsonwebtoken';
import { validateUserData } from '../utils/validate.js';
import { User, AuthenticatedRequest } from '../types/user.js';
import { authservices } from '../services/authServices.js';

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
        const { email, password } = req.body;
        console.log('พยายามล็อกอินด้วย:', { email, password });
        const result = await authservices.login(email, password);
    
        res.cookie('token', result.token, { 
            httpOnly: true, 
            secure: false,
            sameSite: 'strict',
        });

        res.status(200).json({ 
            message: 'Login สำเร็จ!',
            user: { username: result.user.username },
        });

    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// ฟังก์ชันนี้จะเป็น middleware สำหรับตรวจสอบ token ใน header หรือ cookie
export const middleware = (req: Request, res: Response, next: Function) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1] || req.cookies.token;
    const JWT_SECRET: string = process.env.JWT_SECRET as string;
    if (!token) {
        return res.status(401).json({ message: 'ไม่มี token!' });
    }
    jwt.verify(token, JWT_SECRET as string, (err: any, user: any) => {
        if (err) {
            return res.status(403).json({ message: 'Token ไม่ถูกต้อง!' });
        }
        (req as AuthenticatedRequest).user = user as { id: number; username: string;};
        next();
    });
}

// ฟังก์ชันนี้จะลบ cookie ที่เก็บ token เพื่อทำการ logout
export const logout = (req: Request, res: Response) => {
    res.clearCookie('token');
    res.json({ message: 'Logout สำเร็จ!' });
};

// ฟังก์ชันนี้จะส่งรายชื่อผู้ใช้ทั้งหมดกลับไปยัง client
export const getUsers = async (req: Request, res: Response) => {
    try {        
        const allusers = await authservices.getalluser();
        res.json(allusers);
    }
    catch (error: any) {
        console.error('Error fetching users:', error);
        throw new Error('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
    }
};
