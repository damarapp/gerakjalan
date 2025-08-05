import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Team, TeamLevel, TeamGender, NewTeamPayload } from '../../types';
import Card from '../../components/Card';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

const ManageTeams: React.FC = () => {
    const { teams, addTeam, updateTeam, deleteTeam } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentTeam, setCurrentTeam] = useState<Team | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [number, setNumber] = useState('');
    const [level, setLevel] = useState<TeamLevel>(TeamLevel.SD);
    const [gender, setGender] = useState<TeamGender>(TeamGender.PUTRA);

    // New state for tabs
    const [activeTab, setActiveTab] = useState<TeamLevel>(TeamLevel.SD);

    const openModal = (team: Team | null = null) => {
        setCurrentTeam(team);
        setName(team ? team.name : '');
        setLevel(team ? team.level : activeTab);
        setGender(team ? team.gender : TeamGender.PUTRA);

        if (team) {
            setNumber(team.number);
        } else {
            const teamsInLevel = teams.filter(t => t.level === activeTab);
            const highestNumber = teamsInLevel.reduce((max, t) => {
                const num = parseInt(t.number, 10);
                return isNaN(num) ? max : Math.max(max, num);
            }, 0);
            setNumber((highestNumber + 1).toString().padStart(3, '0'));
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentTeam(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (currentTeam) {
                await updateTeam({ ...currentTeam, name, number, level, gender });
            } else {
                const newTeam: NewTeamPayload = { name, number, level, gender };
                await addTeam(newTeam);
            }
            closeModal();
        } catch (error) {
            console.error(error);
            alert(`Gagal menyimpan regu: ${error}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = async (id: string) => {
        if(window.confirm('Apakah Anda yakin ingin menghapus regu ini?')){
            try {
                await deleteTeam(id);
            } catch (error) {
                console.error(error);
                alert(`Gagal menghapus regu: ${error}`);
            }
        }
    };

    const filteredTeams = teams
        .filter(team => team.level === activeTab)
        .sort((a,b) => a.number.localeCompare(b.number));

    const TabButton = ({ tabLevel }: { tabLevel: TeamLevel }) => {
        const teamCount = teams.filter(t => t.level === tabLevel).length;
        return (
             <button
                onClick={() => setActiveTab(tabLevel)}
                className={`flex items-center gap-2 py-3 px-4 font-semibold border-b-2 transition-colors duration-200 ${
                    activeTab === tabLevel
                      ? 'border-merah text-merah'
                      : 'border-transparent text-gray-500 hover:text-merah hover:border-gray-300'
                }`}
            >
                {tabLevel}
                <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${activeTab === tabLevel ? 'bg-merah text-putih' : 'bg-gray-200 text-gray-600'}`}>
                    {teamCount}
                </span>
            </button>
        );
    }

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl text-merah">Kelola Regu Peserta</h3>
                <button onClick={() => openModal()} className="bg-merah text-putih font-bold py-2 px-4 rounded-lg hover:bg-merah-tua flex items-center space-x-2">
                    <PlusCircle size={20} />
                    <span>Tambah Regu</span>
                </button>
            </div>
            
            <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-2" aria-label="Tabs">
                    {Object.values(TeamLevel).map(level => (
                       <TabButton key={level} tabLevel={level} />
                    ))}
                </nav>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b-2 border-abu-abu">
                            <th className="p-3">No. Urut</th>
                            <th className="p-3">Nama Regu</th>
                            <th className="p-3">Jenis</th>
                            <th className="p-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTeams.length > 0 ? filteredTeams.map(team => (
                            <tr key={team.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                <td className="p-3">{team.number}</td>
                                <td className="p-3 font-semibold">{team.name}</td>
                                <td className="p-3">{team.gender}</td>
                                <td className="p-3 text-right">
                                    <button onClick={() => openModal(team)} className="text-blue-600 hover:text-blue-800 mr-2 p-1"><Edit size={18}/></button>
                                    <button onClick={() => handleDelete(team.id)} className="text-merah hover:text-merah-tua p-1"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        )) : (
                           <tr>
                               <td colSpan={4} className="text-center p-8 text-gray-500">
                                   Belum ada regu untuk kategori {activeTab}.
                               </td>
                           </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h4 className="font-bold text-lg mb-4">{currentTeam ? 'Edit' : 'Tambah'} Regu</h4>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Jenjang</label>
                                <select value={level} onChange={e => setLevel(e.target.value as TeamLevel)} className="w-full p-2 border rounded bg-gray-100" disabled>
                                    {Object.values(TeamLevel).map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Jenjang diatur berdasarkan tab yang aktif. Untuk mengubah, hapus dan buat ulang dari tab yang benar.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Nomor Urut</label>
                                <input type="text" value={number} onChange={e => setNumber(e.target.value)} className="w-full p-2 border rounded" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Nama Regu</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium">Jenis</label>
                                <select value={gender} onChange={e => setGender(e.target.value as TeamGender)} className="w-full p-2 border rounded">
                                    {Object.values(TeamGender).map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2 pt-2">
                                <button type="button" onClick={closeModal} className="bg-gray-300 py-2 px-4 rounded" disabled={isSubmitting}>Batal</button>
                                <button type="submit" className="bg-merah text-white py-2 px-4 rounded" disabled={isSubmitting}>
                                    {isSubmitting ? 'Menyimpan...' : (currentTeam ? 'Simpan Perubahan' : 'Tambah Regu')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default ManageTeams;