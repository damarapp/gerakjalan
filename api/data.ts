import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './mongo.js';
import { initialUsers, initialPosts } from './seedData.js';
import { WithId, ObjectId } from 'mongodb';
import { UserRole } from '../types.js';

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
        
        // --- Robust Seeding Logic ---
        const usersCollection = db.collection('users');
        const postsCollection = db.collection('posts');

        // 1. Ensure Super Admin exists and is correct
        const superAdminSeed = initialUsers.find(u => u.name === 'admin');
        if (superAdminSeed) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { _id, ...adminData } = superAdminSeed;
            await usersCollection.updateOne(
                { name: 'admin' },
                { $set: adminData },
                { upsert: true }
            );
        }

        // 2. Seed other initial users (judges) only if they don't exist
        const judgeCount = await usersCollection.countDocuments({ role: UserRole.JUDGE });
        if (judgeCount === 0) {
            const judgesToSeed = initialUsers.filter(u => u.role !== UserRole.ADMIN);
            if (judgesToSeed.length > 0) {
                await usersCollection.insertMany(judgesToSeed);
            }
        }

        // 3. Ensure initial posts exist
        for (const post of initialPosts) {
            const { _id, ...postData } = post;
            await postsCollection.updateOne(
                { _id: new ObjectId(_id as any) }, // Match by the fixed string ID from seed data
                { $set: postData },
                { upsert: true }
            );
        }
        console.log('Seeding process completed/verified.');
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