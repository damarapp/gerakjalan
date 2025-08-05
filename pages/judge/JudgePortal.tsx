
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Post, Team, Score, Criterion } from '../../types';
import Card from '../../components/Card';
import { Save, Search, CheckCircle, LoaderCircle } from 'lucide-react';

const JudgePortal: React.FC = () => {
  const { currentUser, posts, teams, scores, submitScore } = useAppContext();
  const [assignedPost, setAssignedPost] = useState<Post | null>(null);
  const [assignedCriteria, setAssignedCriteria] = useState<Criterion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [teamScores, setTeamScores] = useState<Record<string, { [criterionId: string]: string | number }>>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, 'idle' | 'saving' | 'saved'>>({});


  useEffect(() => {
    if (currentUser && currentUser.assignedPostId) {
      const post = posts.find(p => p.id === currentUser.assignedPostId);
      setAssignedPost(post || null);

      if (post && currentUser.assignedCriteriaIds && currentUser.assignedCriteriaIds.length > 0) {
        const criteria = post.criteria.filter(c => currentUser.assignedCriteriaIds!.includes(c.id));
        setAssignedCriteria(criteria);
      } else if (post) {
        setAssignedCriteria(post.criteria);
      } else {
        setAssignedCriteria([]);
      }
    }
  }, [currentUser, posts]);
  
  useEffect(() => {
      const scoresMap: Record<string, { [criterionId: string]: string | number }> = {};
      teams.forEach(team => {
          const existingScore = scores.find(s => s.teamId === team.id && s.judgeId === currentUser?.id && s.postId === currentUser?.assignedPostId);
          if (existingScore) {
              scoresMap[team.id] = existingScore.scores;
          } else {
              scoresMap[team.id] = {};
          }
          setSaveStatus(prev => ({ ...prev, [team.id]: 'idle' }));
      });
      setTeamScores(scoresMap);
  }, [teams, scores, currentUser]);


  const handleScoreChange = (teamId: string, criterionId: string, value: string) => {
    let newScore: string | number = value;
    if (value !== '') {
        const parsedScore = parseInt(value, 10);
        if (!isNaN(parsedScore)) {
            newScore = Math.max(0, Math.min(100, parsedScore));
        }
    }

    setTeamScores(prev => ({
        ...prev,
        [teamId]: {
            ...prev[teamId],
            [criterionId]: newScore,
        }
    }));
  };

  const handleSave = async (teamId: string) => {
    if (!assignedPost || !currentUser) return;
    
    setSaveStatus(prev => ({...prev, [teamId]: 'saving'}));

    const currentScores = teamScores[teamId] || {};
    const scoresToSubmit: { [criterionId: string]: number } = {};

    assignedCriteria.forEach(criterion => {
        const scoreValue = currentScores[criterion.id];
        let finalScore = 0;
        if (typeof scoreValue === 'number') {
            finalScore = scoreValue;
        } else if (typeof scoreValue === 'string' && scoreValue !== '') {
            finalScore = parseInt(scoreValue, 10) || 0;
        }
        scoresToSubmit[criterion.id] = Math.max(0, Math.min(100, finalScore));
    });

    const newScore: Score = {
      teamId: teamId,
      postId: assignedPost.id,
      judgeId: currentUser.id,
      scores: scoresToSubmit,
    };
    
    try {
        await submitScore(newScore);
        setSaveStatus(prev => ({ ...prev, [teamId]: 'saved' }));
        setTimeout(() => {
            setSaveStatus(prev => ({ ...prev, [teamId]: 'idle' }));
        }, 2000);
    } catch(error) {
        console.error("Failed to save score:", error);
        alert("Gagal menyimpan skor. Periksa koneksi Anda.");
        setSaveStatus(prev => ({...prev, [teamId]: 'idle'}));
    }
  };
  
  if (!assignedPost) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Anda tidak ditugaskan ke Pos manapun.</h2>
        <p>Silakan hubungi Admin.</p>
      </div>
    );
  }
  
  const filteredTeams = teams
    .filter(team => team.name.toLowerCase().includes(searchTerm.toLowerCase()) || team.number.includes(searchTerm))
    .sort((a,b) => a.number.localeCompare(b.number));

  const renderButtonContent = (teamId: string) => {
      const status = saveStatus[teamId] || 'idle';
      switch(status) {
          case 'saving': return <><LoaderCircle size={20} className="animate-spin"/> <span>Menyimpan</span></>;
          case 'saved': return <><CheckCircle size={20}/> <span>Tersimpan</span></>;
          default: return <><Save size={20} /> <span>Simpan</span></>;
      }
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-merah">Selamat Datang, {currentUser?.name}!</h2>
                <p className="text-abu-abu-gelap mt-1">Berikut adalah rincian tugas penilaian Anda:</p>
                <div className="mt-2 text-sm text-gray-700 p-3 bg-gray-100 rounded-lg">
                    <p><strong>Pos Penugasan:</strong> {assignedPost.name}</p>
                    <p className="mt-1"><strong>Kriteria yang Dinilai:</strong></p>
                    {assignedCriteria.length > 0 ? (
                        <ul className="list-disc list-inside ml-4">
                            {assignedCriteria.map(c => <li key={c.id}>{c.name}</li>)}
                        </ul>
                    ) : (
                        <p className="ml-4">Semua kriteria di pos ini.</p>
                    )}
                </div>
            </div>
            <div className="relative mt-4 sm:mt-0 w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                <input 
                    type="search"
                    placeholder="Cari No. atau Nama Regu..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 p-2 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-merah focus:border-merah"
                    aria-label="Cari Nomor Regu"
                />
            </div>
        </div>
      </Card>
      
      <div className="space-y-3">
        {filteredTeams.length > 0 ? filteredTeams.map(team => (
            <Card key={team.id} className="p-4">
                <form onSubmit={(e) => { e.preventDefault(); handleSave(team.id); }} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                   
                    <div className="md:col-span-3">
                        <p className="font-bold text-lg text-merah">{team.number} - {team.name}</p>
                        <p className="text-sm text-gray-500">{team.level} - {team.gender}</p>
                    </div>

                    <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2">
                        {assignedCriteria.map(criterion => (
                            <div key={criterion.id}>
                                <label htmlFor={`${team.id}-${criterion.id}`} className="block text-sm font-medium text-gray-700">
                                    {criterion.name}
                                </label>
                                <input
                                    type="number"
                                    id={`${team.id}-${criterion.id}`}
                                    min="0"
                                    max="100"
                                    value={teamScores[team.id]?.[criterion.id] ?? ''}
                                    onChange={e => handleScoreChange(team.id, criterion.id, e.target.value)}
                                    className="mt-1 w-full p-2 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg shadow-sm focus:ring-merah focus:border-merah"
                                    placeholder="-"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="md:col-span-2 flex justify-end items-center">
                        <button
                            type="submit"
                            disabled={saveStatus[team.id] === 'saving'}
                            className={`w-full md:w-auto font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                                saveStatus[team.id] === 'saved' ? 'bg-green-500 text-white' : 
                                saveStatus[team.id] === 'saving' ? 'bg-gray-400 text-white' :
                                'bg-merah hover:bg-merah-tua text-putih'
                            }`}
                            aria-label={`Simpan nilai untuk ${team.name}`}
                        >
                           {renderButtonContent(team.id)}
                        </button>
                    </div>

                </form>
            </Card>
        )) : (
            <Card className="text-center p-8">
                <p className="text-gray-500">Regu tidak ditemukan.</p>
            </Card>
        )}
      </div>
    </div>
  );
};

export default JudgePortal;
