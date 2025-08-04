
import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './mongo';

export default async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    try {
        const { db } = await connectToDatabase();
        const [teams, users, posts, scores] = await Promise.all([
            db.collection('teams').find().sort({ number: 1 }).toArray(),
            db.collection('users').find().toArray(),
            db.collection('posts').find().toArray(),
            db.collection('scores').find().toArray()
        ]);

        const transformId = (item: any) => ({ ...item, id: item._id.toString() });
        
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
