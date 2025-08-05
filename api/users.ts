
import { VercelResponse } from '@vercel/node';
import { connectToDatabase } from './mongo.js';
import { ObjectId } from 'mongodb';
import { withAuth, AuthenticatedRequest } from './auth.js';
import { UserRole } from '../types.js';

const handler = async (req: AuthenticatedRequest, res: VercelResponse): Promise<void> => {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    try {
        switch (req.method) {
            case 'POST': {
                const newUser = req.body;
                // Password is only required for new Admins
                if (newUser.role === UserRole.ADMIN && !newUser.password) {
                    res.status(400).json({ message: "Password is required for a new Admin user."});
                    return;
                }
                
                // Only super admin can create another admin with permissions
                if (newUser.role === UserRole.ADMIN && req.user.name !== 'admin') {
                    newUser.permissions = [];
                }

                const result = await usersCollection.insertOne(newUser);
                const insertedDoc = await usersCollection.findOne({ _id: result.insertedId });
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { password, ...userWithoutPassword } = insertedDoc as any;
                res.status(201).json({ ...userWithoutPassword, id: insertedDoc?._id.toString() });
                break;
            }
            case 'PUT': {
                const { _id, id, ...userToUpdate } = req.body;
                if (!id) {
                    res.status(400).json({ message: 'ID is required' });
                    return;
                }
                
                if (userToUpdate.password === '' || userToUpdate.password === null || userToUpdate.password === undefined) {
                    delete userToUpdate.password;
                }
                
                const updatePayload: any = { ...userToUpdate };

                // Only super admin can change permissions. Non-super-admins cannot escalate privileges.
                if (req.user.name !== 'admin') {
                    delete updatePayload.permissions;
                }

                const result = await usersCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatePayload });
                res.status(200).json(result);
                break;
            }
            case 'DELETE': {
                const { id } = req.query;
                if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
                    res.status(400).json({ message: 'A valid user ID is required' });
                    return;
                }
                
                if (req.user.id === id) {
                    res.status(403).json({ message: "You cannot delete your own account."});
                    return;
                }

                // Fetch the user to be deleted to check their role
                const userToDelete = await usersCollection.findOne({ _id: new ObjectId(id) });

                if (!userToDelete) {
                    res.status(404).json({ message: "User to delete not found." });
                    return;
                }

                // Rule: Only super admin ('admin') can delete other admins
                if (userToDelete.role === UserRole.ADMIN && req.user.name !== 'admin') {
                    res.status(403).json({ message: "Forbidden: Only a super admin can delete other admin accounts." });
                    return;
                }

                const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
                res.status(200).json(result);
                break;
            }
            default:
                res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('API users Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export default withAuth(handler, [UserRole.ADMIN]);
