
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { TeamTotalScore, TeamLevel, TeamGender } from '../../types';
import Card from '../../components/Card';
import { Trophy } from 'lucide-react';

const Leaderboard: React.FC = () => {
    const { scores, teams, calculateScores } = useAppContext();
    const [rankedScores, setRankedScores] = useState<TeamTotalScore[]>([]);
    const [selectedLevel, setSelectedLevel] = useState<TeamLevel>(TeamLevel.SMA);
    const [selectedGender, setSelectedGender] = useState<TeamGender>(TeamGender.PUTRA);

    useEffect(() => {
        setRankedScores(calculateScores({ level: selectedLevel, gender: selectedGender }));
    }, [scores, teams, calculateScores, selectedLevel, selectedGender]);

    const winner = rankedScores.length > 0 ? rankedScores[0] : null;

    return (
        <div className="space-y-6">
            {winner && winner.totalScore > 0 && (
                <Card className="bg-merah text-putih">
                    <div className="flex flex-col md:flex-row items-center justify-center text-center md:text-left space-y-4 md:space-y-0 md:space-x-6">
                        <Trophy size={60} className="text-yellow-300" />
                        <div>
                            <h3 className="text-2xl font-bold">Pemenang Kategori {selectedLevel} {selectedGender}</h3>
                            <p className="text-4xl font-extrabold">{winner.teamName}</p>
                            <p className="text-lg">dengan total <span className="font-bold">{winner.totalScore.toFixed(0)}</span> poin!</p>
                        </div>
                    </div>
                </Card>
            )}

            <Card>
                <h3 className="font-bold text-xl mb-4 text-merah">Rekapitulasi Nilai Total</h3>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-abu-abu rounded-lg">
                    <div className='flex-1'>
                        <label htmlFor="level-filter" className="block text-sm font-medium text-gray-700 mb-1">Jenjang</label>
                        <select id="level-filter" value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value as TeamLevel)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-merah focus:border-merah">
                            {Object.values(TeamLevel).map(level => <option key={level} value={level}>{level}</option>)}
                        </select>
                    </div>
                    <div className='flex-1'>
                        <label htmlFor="gender-filter" className="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
                        <select id="gender-filter" value={selectedGender} onChange={(e) => setSelectedGender(e.target.value as TeamGender)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-merah focus:border-merah">
                            {Object.values(TeamGender).map(gender => <option key={gender} value={gender}>{gender}</option>)}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-abu-abu">
                                <th className="p-3">Peringkat</th>
                                <th className="p-3">Regu</th>
                                <th className="p-3">Rincian Skor Juri</th>
                                <th className="p-3 text-right">Total Nilai</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rankedScores.map((team, index) => (
                                <tr key={team.teamId} className="border-b border-gray-200 hover:bg-abu-abu">
                                    <td className="p-3 font-bold">{index + 1}</td>
                                    <td className="p-3">
                                        <div className="font-semibold">{team.teamNumber} - {team.teamName}</div>
                                    </td>
                                    <td className="p-3 text-sm">
                                        {team.judgeScores.length > 0 ? (
                                            <ul className="list-disc list-inside">
                                                {team.judgeScores.map(js => (
                                                    <li key={js.judgeId}>
                                                        {js.judgeName} ({js.postName}): <strong>{js.score}</strong>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span className="text-gray-400">Belum ada nilai</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-right font-bold text-merah text-lg">{team.totalScore.toFixed(0)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {rankedScores.length === 0 && <p className="text-center text-abu-abu-gelap p-8">Belum ada data nilai untuk kategori ini.</p>}
            </Card>
        </div>
    );
};

export default Leaderboard;
