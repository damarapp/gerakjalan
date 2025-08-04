import { VercelResponse } from '@vercel/node';
import { connectToDatabase } from './mongo';
import { Score, UserRole } from '../types';
import { withAuth, AuthenticatedRequest } from './auth';

const handler = async (req: AuthenticatedRequest, res: VercelResponse): Promise<void> => {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method Not Allowed' });
        return;
    }

    try {
        const scoreData: Score = req.body;
        const { teamId, postId, judgeId } = scoreData;

        // Security check: Ensure the authenticated user (judge) is submitting score for themselves
        if (req.user.role === UserRole.JUDGE && req.user.id !== judgeId) {
            res.status(403).json({ message: "Forbidden: A judge can only submit scores for themselves." });
            return;
        }

        if (!teamId || !postId || !judgeId) {
            res.status(400).json({ message: 'teamId, postId, and judgeId are required.' });
            return;
        }

        const { db } = await connectToDatabase();
        const scoresCollection = db.collection('scores');

        const filter = { teamId, postId, judgeId };
        const update = { $set: { scores: scoreData.scores, notes: scoreData.notes } };
        const options = { upsert: true };

        const result = await scoresCollection.updateOne(filter, update, options);

        res.status(200).json(result);
    } catch (error) {
        console.error('API Submit Score Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Allow both Judges and Admins to submit/edit scores
export default withAuth(handler, [UserRole.JUDGE, UserRole.ADMIN]);