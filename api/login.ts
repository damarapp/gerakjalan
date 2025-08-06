


import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './mongo.js';
import { UserRole } from '../types.js';

export default async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { role, username, password } = req.body;
        const { db } = await connectToDatabase();
        const usersCollection = db.collection('users');

        let user: any | null = null;
        
        if ((role === UserRole.ADMIN || role === UserRole.JUDGE) && username && password) {
            user = await usersCollection.findOne({ name: username, role: role });

            if (!user) {
                return res.status(401).json({ message: 'Nama pengguna atau password salah.' });
            }

            // For existing judges who haven't had a password set by the admin yet
            if (!user.password) {
                return res.status(401).json({ message: 'Akun ini belum memiliki password. Silakan hubungi admin untuk mengatur password.' });
            }

            // In a real app, passwords should be hashed. Here we do a plain text comparison.
            if (user.password !== password) {
                return res.status(401).json({ message: 'Nama pengguna atau password salah.' });
            }

        } else {
             return res.status(400).json({ message: 'Permintaan tidak valid. Nama pengguna dan password diperlukan.' });
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