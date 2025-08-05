
import { VercelResponse } from '@vercel/node';
import { connectToDatabase } from './mongo.js';
import { Score, UserRole } from '../types.js';
import { withAuth, AuthenticatedRequest } from './auth.js';

const handler = async (req: AuthenticatedRequest, res: VercelResponse): Promise<void> => {
    const { db } = await connectToDatabase();
    const scoresCollection = db.collection('scores');
    
    try {
        switch (req.method) {
            case 'POST': {
                const scoreData: Score = req.body;
                const { teamId, postId, judgeId, scores } = scoreData;

                // Security check: Ensure the authenticated user (judge) is submitting score for themselves
                if (req.user.role === UserRole.JUDGE && req.user.id !== judgeId) {
                    res.status(403).json({ message: "Forbidden: A judge can only submit scores for themselves." });
                    return;
                }

                if (!teamId || !postId || !judgeId) {
                    res.status(400).json({ message: 'teamId, postId, and judgeId are required.' });
                    return;
                }
                
                // Security check for Roving Judges
                if (req.user.isRovingJudge) {
                    const maxScore = 5;
                    for (const criterionId in scores) {
                        if (scores[criterionId] > maxScore) {
                            res.status(400).json({ message: `Skor maksimal untuk juri keliling adalah ${maxScore}.` });
                            return;
                        }
                    }
                }

                const filter = { teamId, postId, judgeId };
                const update = { $set: { scores: scoreData.scores, notes: scoreData.notes } };
                const options = { upsert: true };

                const result = await scoresCollection.updateOne(filter, update, options);
                res.status(200).json(result);
                break;
            }
            case 'DELETE': {
                // This is a global delete, only for admins.
                if (req.user.role !== UserRole.ADMIN) {
                    res.status(403).json({ message: "Forbidden: You do not have permission to perform this action" });
                    return;
                }
                
                await scoresCollection.deleteMany({});
                res.status(200).json({ message: "All scores have been reset." });
                break;
            }
            default:
                res.setHeader('Allow', ['POST', 'DELETE']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('API Scores Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Allow both Judges and Admins to access this endpoint
export default withAuth(handler, [UserRole.JUDGE, UserRole.ADMIN]);