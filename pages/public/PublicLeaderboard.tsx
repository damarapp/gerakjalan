
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../../components/Card';
import { Trophy, Award, Medal } from 'lucide-react';
import { TeamTotalScore, TeamLevel, TeamGender } from '../../types';

const PublicLeaderboard: React.FC = () => {
  const { calculateScores, scores, teams } = useAppContext();
  const [rankedScores, setRankedScores] = useState<TeamTotalScore[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<TeamLevel>(TeamLevel.SMA);
  const [selectedGender, setSelectedGender] = useState<TeamGender>(TeamGender.PUTRA);

  useEffect(() => {
    setRankedScores(calculateScores({ level: selectedLevel, gender: selectedGender }));
  }, [calculateScores, selectedLevel, selectedGender, scores, teams]);

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Trophy className="text-yellow-400" />;
    if (rank === 1) return <Award className="text-gray-400" />;
    if (rank === 2) return <Medal className="text-yellow-600" />;
    return <span className="text-gray-500 font-bold">{rank + 1}</span>;
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-merah">Papan Skor Langsung</h2>
          <p className="text-abu-abu-gelap">Hasil perolehan nilai sementara lomba gerak jalan.</p>
        </div>

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
        
        <div className="space-y-4">
          {rankedScores.length > 0 ? (
            rankedScores.map((team, index) => (
              <div key={team.teamId} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-merah flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl w-8 text-center">{getRankIcon(index)}</div>
                  <div>
                    <p className="font-bold text-lg text-gray-800">{team.teamNumber} - {team.teamName}</p>
                    <p className="text-sm text-gray-500">Kategori: {selectedLevel} {selectedGender}</p>
                  </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-merah">{team.totalScore.toFixed(0)}</p>
                    <p className="text-sm text-gray-500">Total Poin</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-abu-abu-gelap py-8">Belum ada nilai yang masuk untuk kategori ini.</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PublicLeaderboard;
