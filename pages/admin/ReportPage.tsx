import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { TeamLevel, TeamGender, UserRole } from '../../types';
import Card from '../../components/Card';
import { Printer } from 'lucide-react';

const ReportPage: React.FC = () => {
    const { users, posts, calculateScores } = useAppContext();

    const handlePrint = () => {
        window.print();
    };

    const categories: { level: TeamLevel; gender: TeamGender }[] = [];
    Object.values(TeamLevel).forEach(level => {
        Object.values(TeamGender).forEach(gender => {
            categories.push({ level, gender });
        });
    });
    
    // Define a canonical order for posts to ensure consistent column display
    const postDisplayOrder = ["Pos Keberangkatan", "Pos Tengah", "Pos Finish"];


    return (
        <Card className="printable-card">
            <div className="flex justify-between items-center mb-8 border-b pb-4 no-print">
                <div>
                    <h2 className="text-2xl font-bold text-merah">Laporan Hasil Akhir Penjurian</h2>
                    <p className="text-abu-abu-gelap">Lomba Gerak Jalan Kemerdekaan</p>
                </div>
                <button
                    onClick={handlePrint}
                    className="no-print bg-merah text-putih font-bold py-2 px-4 rounded-lg hover:bg-merah-tua flex items-center space-x-2"
                >
                    <Printer size={20} />
                    <span>Cetak Laporan</span>
                </button>
            </div>

            <div className="space-y-12">
                {categories.map(({ level, gender }, index) => {
                    const rankedScores = calculateScores({ level, gender });
                    
                    if (rankedScores.length === 0) {
                        return null;
                    }

                    const judgesWithPosts = users.filter(u => u.role === UserRole.JUDGE && u.assignedPostId);
                    const groupedJudgesByPost = judgesWithPosts.reduce((acc, judge) => {
                        const postId = judge.assignedPostId!;
                        if (!acc[postId]) {
                            const post = posts.find(p => p.id === postId);
                            acc[postId] = {
                                postName: post?.name || 'Pos Tidak Ditemukan',
                                judges: []
                            };
                        }
                        acc[postId].judges.push({ id: judge.id, name: judge.name });
                        return acc;
                    }, {} as Record<string, { postName: string; judges: {id: string; name: string}[] }>);

                    // Sort the post IDs based on the canonical order defined above
                    const postOrder = Object.keys(groupedJudgesByPost).sort((a, b) => {
                        const postA = posts.find(p => p.id === a);
                        const postB = posts.find(p => p.id === b);
                        const indexA = postDisplayOrder.indexOf(postA?.name || '');
                        const indexB = postDisplayOrder.indexOf(postB?.name || '');
                        // Handle cases where a post name might not be in the display order
                        if (indexA === -1) return 1;
                        if (indexB === -1) return -1;
                        return indexA - indexB;
                    });


                    return (
                        <div key={`${level}-${gender}`} className={index > 0 ? "break-before-page" : ""}>
                             <div className="text-center mb-4 hidden print:block">
                                <h2 className="text-xl font-bold">Laporan Hasil Akhir Penjurian</h2>
                                <p className="text-base">Lomba Gerak Jalan Kemerdekaan</p>
                             </div>
                            <h3 className="text-xl font-bold mb-4">
                                Kategori: <span className="text-merah">{level} - {gender}</span>
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b-2 border-abu-abu-gelap bg-gray-50">
                                            <th rowSpan={2} className="p-2 border align-middle text-center">Peringkat</th>
                                            <th rowSpan={2} className="p-2 border align-middle text-center">No. Regu</th>
                                            <th rowSpan={2} className="p-2 border align-middle">Nama Regu</th>
                                            {postOrder.map(postId => {
                                                const group = groupedJudgesByPost[postId];
                                                return (
                                                    <th key={postId} colSpan={group.judges.length} className="p-2 border text-center">
                                                        {group.postName}
                                                    </th>
                                                );
                                            })}
                                            <th rowSpan={2} className="p-2 border align-middle text-right">Total Skor</th>
                                        </tr>
                                        <tr className="border-b-2 border-abu-abu-gelap bg-gray-50">
                                            {postOrder.flatMap(postId => 
                                                groupedJudgesByPost[postId].judges.map(judge => (
                                                    <th key={judge.id} className="p-2 border text-center font-normal whitespace-nowrap">
                                                        {judge.name}
                                                    </th>
                                                ))
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rankedScores.map((team, index) => (
                                            <tr key={team.teamId} className="border-b hover:bg-gray-50">
                                                <td className="p-2 border text-center font-bold">{index + 1}</td>
                                                <td className="p-2 border text-center">{team.teamNumber}</td>
                                                <td className="p-2 border font-semibold">{team.teamName}</td>
                                                {postOrder.flatMap(postId => 
                                                    groupedJudgesByPost[postId].judges.map(judge => {
                                                        const scoreDetail = team.judgeScores.find(js => js.judgeId === judge.id);
                                                        const score = scoreDetail ? scoreDetail.score.toFixed(0) : '-';
                                                        return (
                                                            <td key={judge.id} className="p-2 border text-center">{score}</td>
                                                        );
                                                    })
                                                )}
                                                <td className="p-2 border text-right font-bold text-merah text-lg">{team.totalScore.toFixed(0)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

export default ReportPage;