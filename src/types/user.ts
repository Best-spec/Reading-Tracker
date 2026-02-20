import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
    user?: { 
        id: number; 
        username: string;
    };
}

export interface User {
    id: number;
    username: string;
    password: string;
    email: string;
}