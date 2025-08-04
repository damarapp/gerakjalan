
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
            // Admin login logic: hardcoded password check
            if (password === 'Cipeng55') {
                 // Find an admin user to create a session for, but don't validate their DB password
                user = await usersCollection.findOne({ role: UserRole.ADMIN });
                if (!user) {
                     return res.status(401).json({ message: 'Akun admin tidak ditemukan di database.' });
                }
            } else {
                return res.status(401).json({ message: 'Password admin salah.' });
            }
        } else if (role === UserRole.JUDGE && userId) {
            // Judge login logic: validate against database
            if (!ObjectId.isValid(userId)) {
                return res.status(401).json({ message: 'Kombinasi pengguna dan password salah.' });
            }
            user = await usersCollection.findOne({ _id: new ObjectId(userId) });
            
            if (!user || user.password !== password) {
                 return res.status(401).json({ message: 'Kombinasi pengguna dan password salah.' });
            }
        } else {
             return res.status(400).json({ message: 'Permintaan tidak valid.' });
        }
        
        if (user) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...userWithoutPassword } = user;
            const userWithId = { ...userWithoutPassword, id: user._id.toString() };
            res.status(200).json({ user: userWithId });
        } else {
            // Generic error for judge if user is null after checks
            res.status(401).json({ message: 'Kombinasi pengguna dan password salah.' });
        }
    } catch (error) {
        console.error('API Login Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
