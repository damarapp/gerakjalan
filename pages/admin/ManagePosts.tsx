
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Post, Criterion, NewPostPayload } from '../../types';
import Card from '../../components/Card';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

const ManagePosts: React.FC = () => {
    const { posts, addPost, updatePost, deletePost } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPost, setCurrentPost] = useState<Post | null>(null);
    const [postName, setPostName] = useState('');
    const [criteria, setCriteria] = useState<Partial<Criterion>[]>([]);

    const openModal = (post: Post | null = null) => {
        setCurrentPost(post);
        setPostName(post ? post.name : '');
        setCriteria(post ? post.criteria : [{ id: `c${Date.now()}`, name: '', maxScore: 100 }]);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentPost(null);
    };
    
    const handleCriterionChange = (index: number, value: string) => {
        const newCriteria = [...criteria];
        newCriteria[index].name = value;
        setCriteria(newCriteria);
    };
    
    const addCriterion = () => {
        setCriteria([...criteria, {id: `c${Date.now()}`, name: '', maxScore: 100}]);
    };
    
    const removeCriterion = (index: number) => {
        setCriteria(criteria.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const finalCriteria: Criterion[] = criteria
            .filter(c => c.name && c.name.trim() !== '')
            .map(c => ({ id: c.id!, name: c.name!, maxScore: 100 }));

        try {
            if (currentPost) {
                const payload: Post = { ...currentPost, name: postName, criteria: finalCriteria };
                await updatePost(payload);
            } else {
                const payload: NewPostPayload = { name: postName, criteria: finalCriteria };
                await addPost(payload);
            }
            closeModal();
        } catch (error) {
            console.error(error);
            alert(`Gagal menyimpan pos: ${error}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if(window.confirm('Apakah Anda yakin ingin menghapus pos ini? Ini akan menghapus kriteria di dalamnya juga.')){
            try {
                await deletePost(id);
            } catch (error) {
                console.error(error);
                alert(`Gagal menghapus pos: ${error}`);
            }
        }
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl text-merah">Kelola Pos Penilaian</h3>
                <button onClick={() => openModal()} className="bg-merah text-putih font-bold py-2 px-4 rounded-lg hover:bg-merah-tua flex items-center space-x-2">
                    <PlusCircle size={20} />
                    <span>Tambah Pos</span>
                </button>
            </div>
            <div className="space-y-4">
                {posts.map(post => (
                    <div key={post.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-lg">{post.name}</h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                                    {post.criteria.map(c => <li key={c.id}>{c.name} (Max: {c.maxScore})</li>)}
                                </ul>
                            </div>
                            <div>
                                <button onClick={() => openModal(post)} className="text-blue-600 hover:text-blue-800 mr-2 p-1"><Edit size={18}/></button>
                                <button onClick={() => handleDelete(post.id)} className="text-merah hover:text-merah-tua p-1"><Trash2 size={18}/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
                        <h4 className="font-bold text-lg mb-4">{currentPost ? 'Edit' : 'Tambah'} Pos Penilaian</h4>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Nama Pos</label>
                                <input type="text" value={postName} onChange={e => setPostName(e.target.value)} className="w-full p-2 border rounded" required />
                            </div>
                            <div>
                                <h5 className="font-medium mb-2">Kriteria Penilaian</h5>
                                {criteria.map((c, index) => (
                                    <div key={c.id || index} className="flex gap-2 mb-2 items-center">
                                        <input type="text" placeholder="Nama Kriteria" value={c.name || ''} onChange={e => handleCriterionChange(index, e.target.value)} className="flex-grow w-full p-2 border rounded" required />
                                        <button type="button" onClick={() => removeCriterion(index)} className="text-merah hover:text-merah-tua p-1"><Trash2 size={18}/></button>
                                    </div>
                                ))}
                                <button type="button" onClick={addCriterion} className="text-sm text-blue-600 hover:text-blue-800 mt-2">Tambah Kriteria</button>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={closeModal} className="bg-gray-300 py-2 px-4 rounded" disabled={isSubmitting}>Batal</button>
                                <button type="submit" className="bg-merah text-white py-2 px-4 rounded" disabled={isSubmitting}>
                                    {isSubmitting ? 'Menyimpan...' : (currentPost ? 'Simpan' : 'Tambah')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default ManagePosts;
