import { Request, Response } from 'express';
import { validateUserData } from '../utils/validate.js';
import { AuthenticatedRequest } from '../types/user.js';
import { User } from '../types/user.js';


interface UserProfile {
    id: number;
    nickname: string;
    username: string;
    password: string;
    email: string;
    status: string;
}

let userProfiles: UserProfile[] = [];

export const getUserProfile = (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // const userProfile = userProfiles.find(profile => profile.username === user.username);
    // if (!userProfile) {
    //     return res.status(404).json({ message: 'User profile not found' });
    // }
    res.json(user.username);
}
