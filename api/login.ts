

import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './mongo.js';
import { UserRole } from '../types.js';
import { ObjectId } from 'mongodb';

export default async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { role, userId, username, password } = req.body;
        const { db } = await connectToDatabase();
        const usersCollection = db.collection('users');

        let user: any | null = null;
        
        if (role === UserRole.ADMIN && username && password) {
            // Admin login logic: Find user by username and check password
            user = await usersCollection.findOne({ name: username, role: UserRole.ADMIN });

            if (!user) {
                return res.status(401).json({ message: 'Username atau password salah.' });
            }
            // In a real app, passwords should be hashed. Here we do a plain text comparison.
            if (user.password !== password) {
                return res.status(401).json({ message: 'Username atau password salah.' });
            }

        } else if (role === UserRole.JUDGE && userId) {
            // Judge login logic: No password required, just check for existence.
            if (!ObjectId.isValid(userId)) {
                return res.status(401).json({ message: 'ID Juri tidak valid.' });
            }
            user = await usersCollection.findOne({ _id: new ObjectId(userId) });
            
            if (!user) {
                 return res.status(404).json({ message: 'Juri tidak ditemukan.' });
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
            // Generic error if user is null after checks
            res.status(401).json({ message: 'Login gagal.' });
        }
    } catch (error) {
        console.error('API Login Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};