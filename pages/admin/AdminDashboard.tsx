
import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Card from '../../components/Card';
import { Users, UserCheck, MapPin, BarChart2, ShieldCheck, FileText } from 'lucide-react';
import Leaderboard from './Leaderboard';

const AdminDashboard: React.FC = () => {
    const location = useLocation();
    const showLeaderboard = location.pathname === '/admin' || location.pathname === '/admin/';
    
  const navItems = [
    { path: '/admin/teams', icon: Users, label: 'Kelola Regu' },
    { path: '/admin/users', icon: UserCheck, label: 'Kelola Pengguna' },
    { path: '/admin/posts', icon: MapPin, label: 'Kelola Pos' },
    { path: '/admin/report', icon: FileText, label: 'Laporan Cetak' },
  ];

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
                        {navItems.map(item => (
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
            </aside>

            <main className="lg:col-span-3">
               {showLeaderboard ? <Leaderboard /> : <Outlet />}
            </main>
        </div>
    </div>
  );
};

export default AdminDashboard;