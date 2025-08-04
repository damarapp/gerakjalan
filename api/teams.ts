import { VercelResponse } from '@vercel/node';
import { connectToDatabase } from './mongo.js';
import { ObjectId } from 'mongodb';
import { withAuth, AuthenticatedRequest } from './auth.js';
import { UserRole } from '../types.js';

const handler = async (req: AuthenticatedRequest, res: VercelResponse): Promise<void> => {
    const { db } = await connectToDatabase();
    const teamsCollection = db.collection('teams');

    try {
        switch (req.method) {
            case 'POST': {
                const newTeam = req.body;
                const result = await teamsCollection.insertOne(newTeam);
                const insertedDoc = await teamsCollection.findOne({ _id: result.insertedId });
                res.status(201).json({ ...insertedDoc, id: insertedDoc?._id.toString() });
                break;
            }
            case 'PUT': {
                const { _id, id, ...teamToUpdate } = req.body;
                if (!id) {
                    res.status(400).json({ message: 'ID is required' });
                    return;
                }
                const result = await teamsCollection.updateOne({ _id: new ObjectId(id) }, { $set: teamToUpdate });
                res.status(200).json(result);
                break;
            }
            case 'DELETE': {
                const { id } = req.query;
                if (!id || typeof id !== 'string') {
                    res.status(400).json({ message: 'ID is required' });
                    return;
                }
                const result = await teamsCollection.deleteOne({ _id: new ObjectId(id) });
                res.status(200).json(result);
                break;
            }
            default:
                res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('API teams Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export default withAuth(handler, [UserRole.ADMIN]);