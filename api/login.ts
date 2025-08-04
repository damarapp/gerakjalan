
import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './mongo';
import { User, UserRole } from '../types';
import { ObjectId } from 'mongodb';

export default async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { role, userId, password } = req.body;
        const { db } = await connectToDatabase();
        const usersCollection = db.collection('users');

        let user: any | null = null;
        if (role === UserRole.ADMIN) {
             user = await usersCollection.findOne({ role: UserRole.ADMIN });
        } else if (role === UserRole.JUDGE && userId) {
            if (!ObjectId.isValid(userId)) {
                // Return generic error to avoid leaking information about ID validity
                return res.status(401).json({ message: 'Kombinasi pengguna dan password salah.' });
            }
            user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        }
        
        if (user && user.password === password) {
            const { password, ...userWithoutPassword } = user;
            const userWithId = { ...userWithoutPassword, id: user._id.toString() };
            res.status(200).json({ user: userWithId });
        } else {
            res.status(401).json({ message: 'Kombinasi pengguna dan password salah.' });
        }
    } catch (error) {
        console.error('API Login Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
