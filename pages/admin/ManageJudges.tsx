import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { User, UserRole, NewUserPayload } from '../../types';
import Card from '../../components/Card';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

const ManageJudges: React.FC = () => {
    const { users, posts, addUser, updateUser, deleteUser } = useAppContext();
    const judges = users.filter(user => user.role === UserRole.JUDGE);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentJudge, setCurrentJudge] = useState<User | null>(null);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [assignedPostId, setAssignedPostId] = useState<string | undefined>(undefined);

    const openModal = (judge: User | null = null) => {
        setCurrentJudge(judge);
        setName(judge ? judge.name : '');
        setPassword('');
        setAssignedPostId(judge ? judge.assignedPostId : undefined);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentJudge(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (currentJudge) {
                const payload: User = { ...currentJudge, name, assignedPostId };
                if (password) {
                    payload.password = password;
                }
                await updateUser(payload);
            } else {
                const payload: NewUserPayload = {
                    name,
                    password,
                    role: UserRole.JUDGE,
                    assignedPostId
                };
                await addUser(payload);
            }
            closeModal();
        } catch (error) {
            console.error(error);
            alert(`Gagal menyimpan juri: ${error}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = async (id: string) => {
        if(window.confirm('Apakah Anda yakin ingin menghapus juri ini?')){
            try {
                await deleteUser(id);
            } catch (error) {
                console.error(error);
                alert(`Gagal menghapus juri: ${error}`);
            }
        }
    };
    
    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl text-merah">Kelola Juri</h3>
                <button onClick={() => openModal()} className="bg-merah text-putih font-bold py-2 px-4 rounded-lg hover:bg-merah-tua flex items-center space-x-2">
                    <PlusCircle size={20} />
                    <span>Tambah Juri</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b-2 border-abu-abu">
                            <th className="p-3">Nama Juri</th>
                            <th className="p-3">Pos Penugasan</th>
                            <th className="p-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {judges.map(judge => (
                            <tr key={judge.id} className="border-b border-gray-200">
                                <td className="p-3">{judge.name}</td>
                                <td className="p-3">{posts.find(p => p.id === judge.assignedPostId)?.name || 'Belum Ditugaskan'}</td>
                                <td className="p-3 text-right">
                                    <button onClick={() => openModal(judge)} className="text-blue-600 hover:text-blue-800 mr-2 p-1"><Edit size={18}/></button>
                                    <button onClick={() => handleDelete(judge.id)} className="text-merah hover:text-merah-tua p-1"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h4 className="font-bold text-lg mb-4">{currentJudge ? 'Edit' : 'Tambah'} Juri</h4>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Nama Juri</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder={currentJudge ? 'Kosongkan jika tidak diubah' : ''}
                                    required={!currentJudge}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Tugaskan ke Pos</label>
                                <select value={assignedPostId || ''} onChange={e => setAssignedPostId(e.target.value || undefined)} className="w-full p-2 border rounded">
                                    <option value="">Tidak Ditugaskan</option>
                                    {posts.map(post => <option key={post.id} value={post.id}>{post.name}</option>)}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={closeModal} className="bg-gray-300 py-2 px-4 rounded" disabled={isSubmitting}>Batal</button>
                                <button type="submit" className="bg-merah text-white py-2 px-4 rounded" disabled={isSubmitting}>
                                    {isSubmitting ? 'Menyimpan...' : (currentJudge ? 'Simpan' : 'Tambah')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default ManageJudges;