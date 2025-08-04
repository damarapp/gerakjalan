import { VercelResponse } from '@vercel/node';
import { connectToDatabase } from './mongo.js';
import { ObjectId } from 'mongodb';
import { withAuth, AuthenticatedRequest } from './auth.js';
import { UserRole } from '../types';

const handler = async (req: AuthenticatedRequest, res: VercelResponse): Promise<void> => {
    const { db } = await connectToDatabase();
    const postsCollection = db.collection('posts');

    try {
        switch (req.method) {
            case 'POST': {
                const newPost = req.body;
                const result = await postsCollection.insertOne(newPost);
                const insertedDoc = await postsCollection.findOne({ _id: result.insertedId });
                res.status(201).json({ ...insertedDoc, id: insertedDoc?._id.toString() });
                break;
            }
            case 'PUT': {
                const { _id, id, ...postToUpdate } = req.body;
                if (!id) {
                    res.status(400).json({ message: 'ID is required' });
                    return;
                }
                const result = await postsCollection.updateOne({ _id: new ObjectId(id) }, { $set: postToUpdate });
                res.status(200).json(result);
                break;
            }
            case 'DELETE': {
                const { id } = req.query;
                if (!id || typeof id !== 'string') {
                    res.status(400).json({ message: 'ID is required' });
                    return;
                }
                const result = await postsCollection.deleteOne({ _id: new ObjectId(id) });
                res.status(200).json(result);
                break;
            }
            default:
                res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('API posts Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export default withAuth(handler, [UserRole.ADMIN]);