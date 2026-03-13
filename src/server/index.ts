import express from 'express';
import { Request, Response } from 'express';
import 'dotenv/config';
import allroutes from './routes/core.js';
import cookieParser from 'cookie-parser';
import { middleware } from './middleware/authMiddleware.js';
import { AuthenticatedRequest } from './types/user.js';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT;

app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json());
app.use(cookieParser());

app.use('/api', allroutes);
app.get('/', middleware, (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    res.json({ message: `ยินดีต้อนรับ ${req.user.username}` });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

