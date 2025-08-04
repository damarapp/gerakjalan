
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import { UserRole } from './types';
import { LoaderCircle } from 'lucide-react';

import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageTeams from './pages/admin/ManageTeams';
import ManageUsers from './pages/admin/ManageUsers';
import ManagePosts from './pages/admin/ManagePosts';
import ReportPage from './pages/admin/ReportPage';
import JudgePortal from './pages/judge/JudgePortal';
import PublicLeaderboard from './pages/public/PublicLeaderboard';

const App: React.FC = () => {
  const { currentUser, loading } = useAppContext();

  const getHomeRoute = () => {
    if (!currentUser) return '/login';
    switch (currentUser.role) {
      case UserRole.ADMIN: return '/admin';
      case UserRole.JUDGE: return '/judge';
      case UserRole.PUBLIC: return '/leaderboard';
      default: return '/login';
    }
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-abu-abu">
              <LoaderCircle className="animate-spin text-merah" size={48} />
          </div>
      );
  }

  const renderRoutes = () => {
    if (!currentUser) {
      return (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      );
    }

    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            {currentUser.role === UserRole.ADMIN && (
              <Route path="/admin" element={<AdminDashboard />}>
                 <Route path="teams" element={<ManageTeams />} />
                 <Route path="users" element={<ManageUsers />} />
                 <Route path="posts" element={<ManagePosts />} />
                 <Route path="report" element={<ReportPage />} />
              </Route>
            )}
            {currentUser.role === UserRole.JUDGE && (
              <Route path="/judge" element={<JudgePortal />} />
            )}
            {currentUser.role === UserRole.PUBLIC && (
              <Route path="/leaderboard" element={<PublicLeaderboard />} />
            )}
            <Route path="*" element={<Navigate to={getHomeRoute()} />} />
          </Routes>
        </main>
      </div>
    );
  };

  return <HashRouter>{renderRoutes()}</HashRouter>;
};

export default App;
