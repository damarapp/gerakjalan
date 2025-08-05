
import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Card from '../../components/Card';
import { Users, UserCheck, MapPin, BarChart2, ShieldCheck, FileText, AlertTriangle, Trash2, LoaderCircle } from 'lucide-react';
import Leaderboard from './Leaderboard';
import { useAppContext } from '../../context/AppContext';
import { AdminPermission } from '../../types';

const AdminDashboard: React.FC = () => {
    const location = useLocation();
    const showLeaderboard = location.pathname === '/admin' || location.pathname === '/admin/';
    const { resetScores, currentUser } = useAppContext();
    const [isResetting, setIsResetting] = useState(false);
    
    const isSuperAdmin = currentUser && currentUser.name === 'admin';

    const hasPermission = (permission: AdminPermission) => {
        if (isSuperAdmin) return true;
        return currentUser?.permissions?.includes(permission) ?? false;
    };

    const navItems = [
      { path: '/admin/teams', icon: Users, label: 'Kelola Regu', permission: AdminPermission.MANAGE_TEAMS },
      { path: '/admin/users', icon: UserCheck, label: 'Kelola Pengguna', permission: AdminPermission.MANAGE_USERS },
      { path: '/admin/posts', icon: MapPin, label: 'Kelola Pos', permission: AdminPermission.MANAGE_POSTS },
      { path: '/admin/report', icon: FileText, label: 'Laporan Cetak', permission: AdminPermission.VIEW_REPORTS },
    ];

    const visibleNavItems = navItems.filter(item => hasPermission(item.permission));

    const handleReset = async () => {
        if (window.confirm('APAKAH ANDA YAKIN? Tindakan ini akan menghapus SEMUA data nilai yang sudah masuk dan tidak bisa dikembalikan. Ini biasanya dilakukan sebelum lomba baru dimulai.')) {
            setIsResetting(true);
            try {
                await resetScores();
                alert('Semua data nilai berhasil direset.');
            } catch (error: any) {
                console.error("Failed to reset scores:", error);
                alert(`Gagal mereset nilai: ${error.message}`);
            } finally {
                setIsResetting(false);
            }
        }
    };

  return (
    <div className="container mx-auto p-4 md:p-8">
        <Card className="mb-6 no-print">
            <h2 className="text-3xl font-bold text-merah flex items-center"><ShieldCheck size={30} className="mr-3"/>Dasbor Admin</h2>
            <p className="text-abu-abu-gelap mt-1">Selamat datang, Admin. Kelola semua aspek penilaian lomba di sini.</p>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <aside className="lg:col-span-1 no-print">
                <Card>
                    <h3 className="font-bold text-lg mb-4">Menu Navigasi</h3>
                    <nav className="space-y-2">
                        <NavLink
                             to="/admin"
                             end
                             className={({ isActive }) =>
                                `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                                isActive ? 'bg-merah text-putih shadow' : 'hover:bg-abu-abu'
                                }`
                            }
                        >
                            <BarChart2 size={20} />
                            <span>Rekap Nilai</span>
                        </NavLink>
                        {visibleNavItems.map(item => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                                    isActive ? 'bg-merah text-putih shadow' : 'hover:bg-abu-abu'
                                    }`
                                }
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </Card>
                
                {isSuperAdmin && (
                    <Card className="mt-6 border-merah border-2 bg-red-50">
                        <h3 className="font-bold text-lg mb-2 flex items-center text-merah-tua">
                            <AlertTriangle size={20} className="mr-2"/>
                            Zona Berbahaya
                        </h3>
                        <p className="text-sm text-abu-abu-gelap mb-4">Tindakan berikut ini bersifat permanen dan tidak dapat dibatalkan. Lakukan dengan hati-hati.</p>
                        <button
                            onClick={handleReset}
                            disabled={isResetting}
                            className="w-full bg-merah text-putih font-bold py-2 px-4 rounded-lg hover:bg-merah-tua flex items-center justify-center space-x-2 disabled:bg-gray-400"
                        >
                            {isResetting ? <LoaderCircle className="animate-spin" size={20} /> : <Trash2 size={20} />}
                            <span>{isResetting ? 'Mereset...' : 'Reset Semua Nilai'}</span>
                        </button>
                    </Card>
                )}
            </aside>

            <main className="lg:col-span-3">
               {showLeaderboard ? <Leaderboard /> : <Outlet />}
            </main>
        </div>
    </div>
  );
};

export default AdminDashboard;