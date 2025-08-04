import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './mongo.js';
import { User as ClientUser, UserRole } from '../types';
import { ObjectId } from 'mongodb';

interface UserInDb {
    _id: ObjectId;
    name: string;
    role: UserRole;
    password?: string;
    assignedPostId?: string;
    assignedCriteriaIds?: string[];
}

export interface AuthenticatedRequest extends VercelRequest {
    user: ClientUser;
}

type ApiHandler = (req: AuthenticatedRequest, res: VercelResponse) => Promise<void> | void;

export const withAuth = (handler: ApiHandler, allowedRoles: UserRole[]) => {
    return async (req: VercelRequest, res: VercelResponse) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Authorization header missing or malformed' });
            return;
        }

        const userId = authHeader.split(' ')[1];
        if (!userId || !ObjectId.isValid(userId)) {
            res.status(401).json({ message: 'Invalid token format' });
            return;
        }

        try {
            const { db } = await connectToDatabase();
            const user = await db.collection<UserInDb>('users').findOne({ _id: new ObjectId(userId) });

            if (!user) {
                res.status(401).json({ message: 'User not found, invalid token' });
                return;
            }

            if (!allowedRoles.includes(user.role)) {
                res.status(403).json({ message: 'Forbidden: You do not have permission to perform this action' });
                return;
            }
            
            // Attach user to the request and proceed to the actual handler
            const authenticatedRequest = req as AuthenticatedRequest;
            const { _id, password, ...restOfUser } = user;
            authenticatedRequest.user = {
                ...restOfUser,
                id: _id.toString(),
            };

            return handler(authenticatedRequest, res);
        } catch (error) {
            console.error('Authentication Error:', error);
            res.status(500).json({ message: 'Internal Server Error during authentication' });
        }
    };
};