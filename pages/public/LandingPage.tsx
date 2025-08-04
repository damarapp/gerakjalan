import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { TeamLevel, TeamGender, TeamTotalScore } from '../../types';
import Card from '../../components/Card';
import Header from '../../components/Header';
import { Trophy, Award, Medal } from 'lucide-react';

const LandingPage: React.FC = () => {
    const { calculateScores, scores, teams } = useAppContext();
    const [rankedScores, setRankedScores] = useState<TeamTotalScore[]>([]);
    const [selectedLevel, setSelectedLevel] = useState<TeamLevel>(TeamLevel.SMA);
    const [selectedGender, setSelectedGender] = useState<TeamGender>(TeamGender.PUTRA);

    useEffect(() => {
        setRankedScores(calculateScores({ level: selectedLevel, gender: selectedGender }));
    }, [calculateScores, selectedLevel, selectedGender, scores, teams]);

    const getRankIcon = (rank: number) => {
        if (rank === 0) return <Trophy className="w-10 h-10 text-yellow-400" />;
        if (rank === 1) return <Award className="w-10 h-10 text-gray-400" />;
        if (rank === 2) return <Medal className="w-10 h-10 text-yellow-600" />;
        return <span className="text-gray-500 font-bold">{rank + 1}</span>;
    };
    
    const topThree = rankedScores.slice(0, 3);

    return (
        <div className="bg-abu-abu min-h-screen">
            <Header />
            {/* Hero Section */}
            <div className="relative bg-merah text-putih text-center py-20 md:py-24 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-merah-tua opacity-50 transform -skew-y-3"></div>
                <div className="relative z-10">
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                       Penilaian Modern, Real-time & Transparan
                    </h2>
                    <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto">
                        Selamat datang di sistem E-Penilaian untuk Lomba Gerak Jalan Kemerdekaan. Lihat skor langsung atau login untuk memulai penilaian.
                    </p>
                    <div className="mt-8 flex justify-center gap-4 flex-wrap">
                        <Link to="/leaderboard" className="bg-putih text-merah font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-200 transition-transform transform hover:scale-105 flex items-center gap-2">
                           <Trophy size={20} /> Lihat Papan Skor
                        </Link>
                    </div>
                </div>
            </div>

            {/* Winners Section */}
            <div className="container mx-auto p-4 md:p-8">
                <Card>
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-merah">Juara Terkini</h2>
                        <p className="text-abu-abu-gelap">Peringkat teratas berdasarkan kategori lomba.</p>
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

                    {topThree.length > 0 ? (
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             {topThree.map((team, index) => (
                                 <div key={team.teamId} className={`bg-white p-6 rounded-lg shadow-lg border-b-4 ${index === 0 ? 'border-yellow-400' : index === 1 ? 'border-gray-400' : 'border-yellow-600'} text-center flex flex-col items-center`}>
                                     {getRankIcon(index)}
                                     <h3 className="text-xl font-bold text-gray-800 mt-4">{team.teamName}</h3>
                                     <p className="text-sm text-gray-500">No. Urut: {team.teamNumber}</p>
                                     <p className="text-3xl font-bold text-merah mt-2">{team.totalScore.toFixed(0)}</p>
                                     <p className="text-sm text-gray-500">Total Poin</p>
                                 </div>
                             ))}
                         </div>
                    ) : (
                        <p className="text-center text-abu-abu-gelap py-8">Belum ada nilai yang masuk untuk kategori ini.</p>
                    )}
                </Card>
            </div>
             <footer className="text-center py-6 text-abu-abu-gelap">
                <p>&copy; {new Date().getFullYear()} KKG PJOK Gondangwetan. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;