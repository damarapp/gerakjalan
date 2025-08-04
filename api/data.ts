import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './mongo';
import { initialUsers, initialPosts } from './seedData';
import { WithId } from 'mongodb';

// Helper to ensure _id is converted to string id
const transformId = (item: WithId<any>): any => {
    const { _id, ...rest } = item;
    return { ...rest, id: _id.toString() };
};

export default async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    try {
        const { db } = await connectToDatabase();
        
        // --- Automatic Seeding Logic ---
        // Cek jika database masih kosong (dengan melihat koleksi users)
        const userCount = await db.collection('users').countDocuments();
        if (userCount === 0) {
            console.log('Database kosong, menjalankan proses seeding otomatis...');
            // Masukkan data awal pengguna dan pos
            // assignedPostId pada user sudah disinkronkan di seedData.ts
            await db.collection('users').insertMany(initialUsers);
            await db.collection('posts').insertMany(initialPosts as any);
            console.log('Seeding berhasil.');
        }
        // -----------------------------

        const [teams, users, posts, scores] = await Promise.all([
            db.collection('teams').find().sort({ number: 1 }).toArray(),
            db.collection('users').find().toArray(),
            db.collection('posts').find().toArray(),
            db.collection('scores').find().toArray()
        ]);
        
        res.status(200).json({
            teams: teams.map(transformId),
            users: users.map(transformId),
            posts: posts.map(transformId),
            scores: scores.map(transformId),
        });
    } catch (error) {
        console.error('API Error fetching data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
