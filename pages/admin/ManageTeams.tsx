import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Team, TeamLevel, TeamGender, NewTeamPayload } from '../../types';
import Card from '../../components/Card';
import { PlusCircle, Edit, Trash2, Printer } from 'lucide-react';

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

    const [activeTab, setActiveTab] = useState<TeamLevel>(TeamLevel.SD);

    const openModal = (team: Team | null = null) => {
        setCurrentTeam(team);
        if (team) {
            // Editing existing team
            setName(team.name);
            setNumber(team.number);
            setLevel(team.level);
            setGender(team.gender);
        } else {
            // Adding new team
            setName('');
            setLevel(activeTab); // Set level from the active tab
            setGender(TeamGender.PUTRA); // Default to Putra, useEffect will calculate number
            setNumber(''); // Clear number, useEffect will populate it
        }
        setIsModalOpen(true);
    };

    useEffect(() => {
        // This effect automatically calculates the next available team number, filling gaps.
        if (!isModalOpen || currentTeam) return;

        const isPutra = gender === TeamGender.PUTRA;

        // 1. Get existing numbers for the specific category into a Set for fast lookups
        const existingNumbers = new Set(
            teams
                .filter(t => t.level === level && t.gender === gender)
                .map(t => t.number)
        );

        // 2. Determine the starting number for the search loop based on level and gender
        let startNumber = 0;
        switch (level) {
            case TeamLevel.SD:
                startNumber = isPutra ? 101 : 102;
                break;
            case TeamLevel.SMP:
            case TeamLevel.SMA:
                startNumber = isPutra ? 201 : 202;
                break;
            case TeamLevel.UMUM:
                startNumber = isPutra ? 301 : 302;
                break;
        }

        // 3. Find the first available gap by checking numbers in sequence
        let nextAvailableNumber = startNumber;
        const maxIterations = 1000; // Safety limit to prevent potential infinite loops
        for (let i = 0; i < maxIterations; i++) {
            if (!existingNumbers.has(nextAvailableNumber.toString())) {
                // Found an unused number (a gap). This is our number.
                break;
            }
            // This number is taken, try the next valid one (the next odd or even number)
            nextAvailableNumber += 2;
        }
        
        setNumber(nextAvailableNumber.toString());

    }, [isModalOpen, currentTeam, level, gender, teams]);

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

    const handlePrint = () => {
        window.print();
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
        <Card className="printable-card">
            <div className="hidden print:block mb-4 text-center">
                <h2 className="text-xl font-bold">Daftar Regu Peserta</h2>
                <p className="text-base">Kategori: {activeTab}</p>
            </div>

            <div className="flex justify-between items-center mb-4 no-print">
                <h3 className="font-bold text-xl text-merah">Kelola Regu Peserta</h3>
                <div className="flex items-center gap-2">
                    <button onClick={handlePrint} className="bg-blue-600 text-putih font-bold py-2 px-4 rounded-lg hover:bg-blue-800 flex items-center space-x-2">
                        <Printer size={20} />
                        <span>Cetak Daftar</span>
                    </button>
                    <button onClick={() => openModal()} className="bg-merah text-putih font-bold py-2 px-4 rounded-lg hover:bg-merah-tua flex items-center space-x-2">
                        <PlusCircle size={20} />
                        <span>Tambah Regu</span>
                    </button>
                </div>
            </div>
            
            <div className="border-b border-gray-200 mb-4 no-print">
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
                            <th className="p-3 w-12 text-center">No.</th>
                            <th className="p-3">No. Urut</th>
                            <th className="p-3">Nama Regu</th>
                            <th className="p-3">Jenis</th>
                            <th className="p-3 text-right no-print">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTeams.length > 0 ? filteredTeams.map((team, index) => (
                            <tr key={team.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                <td className="p-3 text-center">{index + 1}</td>
                                <td className="p-3">{team.number}</td>
                                <td className="p-3 font-semibold">{team.name}</td>
                                <td className="p-3">{team.gender}</td>
                                <td className="p-3 text-right no-print">
                                    <button onClick={() => openModal(team)} className="text-blue-600 hover:text-blue-800 mr-2 p-1"><Edit size={18}/></button>
                                    <button onClick={() => handleDelete(team.id)} className="text-merah hover:text-merah-tua p-1"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        )) : (
                           <tr>
                               <td colSpan={5} className="text-center p-8 text-gray-500 no-print">
                                   Belum ada regu untuk kategori {activeTab}.
                               </td>
                           </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50 no-print">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h4 className="font-bold text-lg mb-4">{currentTeam ? 'Edit' : 'Tambah'} Regu</h4>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Jenjang</label>
                                <select value={level} onChange={e => setLevel(e.target.value as TeamLevel)} className="w-full p-2 border rounded bg-gray-100" disabled>
                                    {Object.values(TeamLevel).map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Jenjang diatur berdasarkan tab yang aktif. Untuk mengubah, buat regu baru dari tab yang benar.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Jenis</label>
                                <select value={gender} onChange={e => setGender(e.target.value as TeamGender)} className="w-full p-2 border rounded" disabled={!!currentTeam}>
                                    {Object.values(TeamGender).map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                                {!!currentTeam && <p className="text-xs text-gray-500 mt-1">Jenis tidak dapat diubah untuk menjaga konsistensi nomor urut.</p>}
                            </div>
                             <div>
                                <label className="block text-sm font-medium">Nomor Urut</label>
                                <input type="text" value={number} onChange={e => setNumber(e.target.value)} className="w-full p-2 border rounded" required />
                                 <p className="text-xs text-gray-500 mt-1">Nomor urut disarankan secara otomatis. Anda dapat mengubahnya jika perlu.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Nama Regu</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required />
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