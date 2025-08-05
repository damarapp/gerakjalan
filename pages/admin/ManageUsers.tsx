
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { User, UserRole, Criterion, NewUserPayload, AdminPermission, UpdateUserPayload } from '../../types';
import Card from '../../components/Card';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

const permissionLabels: Record<AdminPermission, string> = {
    [AdminPermission.MANAGE_TEAMS]: 'Kelola Regu',
    [AdminPermission.MANAGE_USERS]: 'Kelola Pengguna',
    [AdminPermission.MANAGE_POSTS]: 'Kelola Pos',
    [AdminPermission.VIEW_REPORTS]: 'Laporan Cetak',
};

const ManageUsers: React.FC = () => {
    const { users, posts, currentUser, addUser, updateUser, deleteUser } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUserToEdit, setCurrentUserToEdit] = useState<User | null>(null);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.JUDGE);
    const [assignedPostId, setAssignedPostId] = useState<string | undefined>(undefined);
    const [assignedCriteriaIds, setAssignedCriteriaIds] = useState<string[]>([]);
    const [availableCriteria, setAvailableCriteria] = useState<Criterion[]>([]);
    const [permissions, setPermissions] = useState<AdminPermission[]>([]);

    const openModal = (user: User | null = null) => {
        setCurrentUserToEdit(user);
        setName(user ? user.name : '');
        setPassword(''); // Always clear password for security
        const userRole = user ? user.role : UserRole.JUDGE;
        setRole(userRole);
        const userPostId = user && user.role === UserRole.JUDGE ? user.assignedPostId : undefined;
        setAssignedPostId(userPostId);
        setAssignedCriteriaIds(user && user.role === UserRole.JUDGE && user.assignedCriteriaIds ? user.assignedCriteriaIds : []);
        setPermissions(user && user.role === UserRole.ADMIN ? user.permissions || [] : []);
        setIsModalOpen(true);
    };

    useEffect(() => {
        if (role === UserRole.JUDGE && assignedPostId) {
            const post = posts.find(p => p.id === assignedPostId);
            setAvailableCriteria(post ? post.criteria : []);
        } else {
            setAvailableCriteria([]);
        }
    }, [assignedPostId, role, posts]);
    
    useEffect(() => {
        // Reset permissions when role changes to JUDGE
        if (role === UserRole.JUDGE) {
            setPermissions([]);
        }
    }, [role]);

    const handlePostChange = (postId: string) => {
        const newPostId = postId || undefined;
        setAssignedPostId(newPostId);
        setAssignedCriteriaIds([]);
    };

    const handleCriteriaChange = (criterionId: string) => {
        setAssignedCriteriaIds(prev =>
            prev.includes(criterionId)
                ? prev.filter(id => id !== criterionId)
                : [...prev, criterionId]
        );
    };

    const handlePermissionChange = (permission: AdminPermission) => {
        setPermissions(prev => 
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentUserToEdit(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (currentUserToEdit) {
                const payload: UpdateUserPayload = { 
                    ...currentUserToEdit, 
                    name, 
                    role, 
                    assignedPostId, 
                    assignedCriteriaIds,
                    permissions: role === UserRole.ADMIN ? permissions : [],
                };
                if(password && role === UserRole.ADMIN) payload.password = password;
                await updateUser(payload);
            } else {
                const payload: NewUserPayload = { 
                    name, 
                    role, 
                    password: role === UserRole.ADMIN ? password : undefined,
                    assignedPostId: role === UserRole.JUDGE ? assignedPostId : undefined,
                    assignedCriteriaIds: role === UserRole.JUDGE ? assignedCriteriaIds : [],
                    permissions: role === UserRole.ADMIN ? permissions : [],
                };
                await addUser(payload);
            }
            closeModal();
        } catch (error: any) {
            console.error(error);
            alert(`Gagal menyimpan pengguna: ${error.message || error}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = async (userToDelete: User) => {
        if (userToDelete.id === currentUser?.id) {
            alert('Anda tidak dapat menghapus akun Anda sendiri.');
            return;
        }

        if (userToDelete.role === UserRole.ADMIN && currentUser?.name !== 'admin') {
            alert('Hanya super admin yang dapat menghapus admin lain.');
            return;
        }
        
        const adminCount = users.filter(u => u.role === UserRole.ADMIN).length;
        if (userToDelete.role === UserRole.ADMIN && adminCount <= 1) {
            alert('Tidak dapat menghapus admin terakhir.');
            return;
        }

        if(window.confirm(`Apakah Anda yakin ingin menghapus pengguna ${userToDelete.name}?`)){
            try {
                await deleteUser(userToDelete.id);
            } catch (error: any) {
                console.error(error);
                alert(`Gagal menghapus pengguna: ${error.message || error}`);
            }
        }
    };
    
    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl text-merah">Kelola Pengguna</h3>
                <button onClick={() => openModal()} className="bg-merah text-putih font-bold py-2 px-4 rounded-lg hover:bg-merah-tua flex items-center space-x-2">
                    <PlusCircle size={20} />
                    <span>Tambah Pengguna</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b-2 border-abu-abu">
                            <th className="p-3">Nama Pengguna</th>
                            <th className="p-3">Peran</th>
                            <th className="p-3">Detail Penugasan / Hak Akses</th>
                            <th className="p-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => {
                             const isSelf = user.id === currentUser?.id;
                             const isTargetAdmin = user.role === UserRole.ADMIN;
                             const isSuperAdmin = currentUser?.name === 'admin';
                             const canDelete = (isSuperAdmin || !isTargetAdmin) && !isSelf;

                            return (
                                <tr key={user.id} className="border-b border-gray-200">
                                    <td className="p-3 font-semibold">{user.name}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === UserRole.ADMIN ? 'bg-merah text-putih' : 'bg-gray-200 text-gray-700'}`}>
                                            {user.role === UserRole.ADMIN ? 'Admin' : 'Juri'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-sm text-gray-600">
                                        {user.role === UserRole.JUDGE ? (
                                            <div>
                                                <div className='font-bold'>{posts.find(p => p.id === user.assignedPostId)?.name || 'Belum Ditugaskan'}</div>
                                                {user.assignedCriteriaIds && user.assignedCriteriaIds.length > 0 && (
                                                    <ul className='list-disc list-inside pl-1'>
                                                        {user.assignedCriteriaIds.map(cid => {
                                                            const post = posts.find(p => p.id === user.assignedPostId);
                                                            const criterion = post?.criteria.find(c => c.id === cid);
                                                            return <li key={cid}>{criterion?.name || 'Kriteria Dihapus'}</li>
                                                        })}
                                                    </ul>
                                                )}
                                            </div>
                                        ) : user.role === UserRole.ADMIN ? (
                                            <div>
                                                {user.name === 'admin' ? (<span className="font-semibold text-merah">Super Admin</span>) : user.permissions && user.permissions.length > 0 ? (
                                                    <ul className='list-disc list-inside'>
                                                        {user.permissions.map(p => (
                                                            <li key={p}>{permissionLabels[p as AdminPermission]}</li>
                                                        ))}
                                                    </ul>
                                                ) : (<span className="text-gray-500">Tidak ada hak akses khusus</span>)}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => openModal(user)} className="text-blue-600 hover:text-blue-800 mr-2 p-1"><Edit size={18}/></button>
                                        <button 
                                            onClick={() => handleDelete(user)} 
                                            disabled={!canDelete}
                                            className="p-1 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed text-merah hover:text-merah-tua"
                                            title={!canDelete ? (isSelf ? 'Anda tidak dapat menghapus akun sendiri' : 'Hanya Super Admin yang dapat menghapus admin lain') : `Hapus ${user.name}`}
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-full overflow-y-auto">
                        <h4 className="font-bold text-lg mb-4">{currentUserToEdit ? 'Edit' : 'Tambah'} Pengguna</h4>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Nama Pengguna</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required />
                            </div>
                           
                            <div>
                                <label className="block text-sm font-medium">Peran</label>
                                <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full p-2 border rounded">
                                    <option value={UserRole.JUDGE}>Juri</option>
                                    <option value={UserRole.ADMIN}>Admin</option>
                                </select>
                            </div>
                            
                            {role === UserRole.ADMIN && (
                                <div>
                                    <label className="block text-sm font-medium">Password</label>
                                    <input 
                                        type="password" 
                                        value={password} 
                                        onChange={e => setPassword(e.target.value)} 
                                        className="w-full p-2 border rounded" 
                                        placeholder={currentUserToEdit ? 'Kosongkan jika tidak diubah' : ''}
                                        required={!currentUserToEdit} 
                                    />
                                </div>
                            )}

                            {role === UserRole.JUDGE && (
                                <>
                                <div>
                                    <label className="block text-sm font-medium">Tugaskan ke Pos</label>
                                    <select value={assignedPostId || ''} onChange={e => handlePostChange(e.target.value)} className="w-full p-2 border rounded">
                                        <option value="">Tidak Ditugaskan</option>
                                        {posts.map(post => <option key={post.id} value={post.id}>{post.name}</option>)}
                                    </select>
                                </div>
                                {assignedPostId && availableCriteria.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Kriteria yang Dinilai</label>
                                        <div className="mt-2 space-y-2 p-3 border rounded-lg bg-gray-50 max-h-40 overflow-y-auto">
                                            {availableCriteria.map(criterion => (
                                                <div key={criterion.id} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`criterion-${criterion.id}`}
                                                        checked={assignedCriteriaIds.includes(criterion.id)}
                                                        onChange={() => handleCriteriaChange(criterion.id)}
                                                        className="h-4 w-4 rounded border-gray-300 text-merah focus:ring-merah"
                                                    />
                                                    <label htmlFor={`criterion-${criterion.id}`} className="ml-3 block text-sm text-gray-800 select-none cursor-pointer">
                                                        {criterion.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                </>
                            )}
                             {role === UserRole.ADMIN && currentUser?.name === 'admin' && currentUserToEdit?.name !== 'admin' && (
                                <div>
                                    <label className="block text-sm font-medium">Hak Akses Admin</label>
                                    <p className="text-xs text-gray-500 mb-2">Pilih halaman mana saja yang dapat diakses oleh admin ini.</p>
                                    <div className="mt-2 space-y-2 p-3 border rounded-lg bg-gray-50 max-h-40 overflow-y-auto">
                                        {Object.values(AdminPermission).map((p) => (
                                            <div key={p} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`permission-${p}`}
                                                    checked={permissions.includes(p)}
                                                    onChange={() => handlePermissionChange(p)}
                                                    className="h-4 w-4 rounded border-gray-300 text-merah focus:ring-merah"
                                                />
                                                <label htmlFor={`permission-${p}`} className="ml-3 block text-sm text-gray-800 select-none cursor-pointer">
                                                    {permissionLabels[p]}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             )}
                            <div className="flex justify-end space-x-2 pt-2">
                                <button type="button" onClick={closeModal} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded" disabled={isSubmitting}>Batal</button>
                                <button type="submit" className="bg-merah hover:bg-merah-tua text-white font-bold py-2 px-4 rounded" disabled={isSubmitting}>
                                    {isSubmitting ? 'Menyimpan...' : (currentUserToEdit ? 'Simpan' : 'Tambah')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default ManageUsers;
