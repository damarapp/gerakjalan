
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
import LandingPage from './pages/public/LandingPage';

const App: React.FC = () => {
  const { currentUser, loading } = useAppContext();

  const getHomeRoute = () => {
    if (!currentUser) return '/'; // Default to landing page
    switch (currentUser.role) {
      case UserRole.ADMIN: return '/admin';
      case UserRole.JUDGE: return '/judge';
      default: return '/';
    }
  };

  if (loading && !currentUser) { // Show loading screen only on initial load
      return (
          <div className="flex items-center justify-center min-h-screen bg-abu-abu">
              <LoaderCircle className="animate-spin text-merah" size={48} />
          </div>
      );
  }

  // Layout for authenticated users
  const PrivateLayout = () => (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );

  return (
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/leaderboard" element={<PublicLeaderboard />} />

          {/* Conditional Login Route */}
          <Route 
            path="/login" 
            element={currentUser ? <Navigate to={getHomeRoute()} /> : <LoginPage />} 
          />
          
          {/* Protected Routes for Authenticated Users */}
          {currentUser ? (
              <Route element={<PrivateLayout />}>
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
                  {/* Redirect any other authenticated path to their home */}
                   <Route path="*" element={<Navigate to={getHomeRoute()} />} />
              </Route>
          ) : (
             <>
                {/* For any other route when not logged in, redirect to login page before showing it */}
                <Route path="/admin/*" element={<Navigate to="/login" />} />
                <Route path="/judge" element={<Navigate to="/login" />} />
             </>
          )}

           {/* Fallback for any non-defined routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
  );
};

export default App;