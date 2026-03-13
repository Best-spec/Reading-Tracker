import { validateUserData } from "../utils/validate.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from "../types/user.js";
import { clear } from "node:console";
import {prisma} from "../prisma.js";


let users: User[] = [];

// ฟังก์ชันนี้จะรับข้อมูลจาก req.body แล้วทำการตรวจสอบและบันทึกผู้ใช้ใหม่
export const authservices = {
    register: async (username: string, password: string, email: string) => {

        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            throw new Error('ชื่อผู้ใช้ซ้ำ! กรุณาเลือกชื่ออื่น.');
        }

        const result = validateUserData(username, password, email, users);
        if (!result.valid) {
            throw new Error(result.message);
        }

        const saltRounds = 10;
        const hashedPassword = bcrypt.hashSync(password, saltRounds);

        const newUser = { id: users.length + 1, username, password: hashedPassword, email };
        const createdUser = await prisma.user.create({
            data: {
                username: newUser.username,
                password: newUser.password,
                email: newUser.email,
            },
        });
        return newUser;
    },

    login: async (email: string, password: string) => {
        const JWT_SECRET: string = process.env.JWT_SECRET as string;

        const user = await prisma.user.findUnique({ where: { email: email } });
        console.log('พบผู้ใช้ในฐานข้อมูล:', user);
        if (!user) {
            throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง!');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง!');
        }

        const payload = { id: user.id, username: user.username };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        console.log('เข้าสู่ระบบสำเร็จ email:', user.username);
        return { user, token };
    },

    getalluser: async () => {
        const allusers = await prisma.user.findMany();
        return allusers;
    }
};
