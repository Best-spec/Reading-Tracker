import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/user.js';

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