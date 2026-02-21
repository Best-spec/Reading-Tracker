import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import e from 'express';
import jwt from 'jsonwebtoken';
import { validateUserData } from '../utils/validate.js';
import { AuthenticatedRequest, User } from '../types/user.js';

let users: User[] = [];

// ฟังก์ชันนี้จะรับข้อมูลจาก req.body แล้วทำการตรวจสอบและบันทึกผู้ใช้ใหม่
export const registerUser = (req: Request, res: Response) => {
    const { username, password, email } = req.body;

    const result = validateUserData(username, password, email, users);
    if (!result.valid) {
        return res.status(400).json({ message: result.message });
    }

    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    const newUser = { id: users.length + 1, username, password: hashedPassword, email };
    users.push(newUser);

    console.log('สมัครสมาชิกใหม่:', username);
    res.status(201).json({ message: 'Register สำเร็จ!', user: { username } });
};

// ฟังก์ชันนี้จะรับข้อมูลจาก req.body แล้วทำการตรวจสอบและล็อกอินผู้ใช้
export const loginUser = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const JWT_SECRET: string = process.env.JWT_SECRET as string;

    
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(400).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง!' });
    }

    const payload = { id: user.id, username: user.username };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, { 
        httpOnly: true, 
        secure: false,
        sameSite: 'strict',
    });

    res.status(200).json({ 
        message: 'Login สำเร็จ!',
        user: { username },
        token: token
    });
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
        (req as AuthenticatedRequest).user = user as { id: number; username: string };
        next();
    });
}

// ฟังก์ชันนี้จะลบ cookie ที่เก็บ token เพื่อทำการ logout
export const logout = (req: Request, res: Response) => {
    res.clearCookie('token');
    res.json({ message: 'Logout สำเร็จ!' });
};

// ฟังก์ชันนี้จะส่งรายชื่อผู้ใช้ทั้งหมดกลับไปยัง client
export const getUsers = (req: Request, res: Response) => {
    res.json(users);
};
