import { Request, Response } from 'express';
import { User, AuthenticatedRequest } from '../types/user.js';

export const getmyProfile = (req: AuthenticatedRequest, res: Response) => {
    const { user } = req;
    res.json(user);
};
