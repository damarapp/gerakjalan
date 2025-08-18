import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { LogIn, LogOut, Crown } from 'lucide-react';

const { Link } = ReactRouterDOM;

const Header: React.FC = () => {
  const { currentUser, logout } = useAppContext();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-merah shadow-md no-print">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
           <div className="bg-putih p-2 rounded-full">
             <Crown className="text-merah" size={24} />
           </div>
           <h1 className="text-xl md:text-2xl font-bold text-putih">
            E-Penilaian Gerak Jalan
           </h1>
        </Link>
        {currentUser ? (
          <div className="flex items-center space-x-4">
            <span className="text-putih hidden sm:block">
              Halo, <span className="font-semibold">{currentUser.name}</span>
            </span>
            <button
              onClick={handleLogout}
              className="bg-putih text-merah hover:bg-abu-abu transition-colors duration-200 font-bold py-2 px-4 rounded-lg flex items-center space-x-2"
              aria-label="Logout"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="bg-putih text-merah hover:bg-abu-abu transition-colors duration-200 font-bold py-2 px-4 rounded-lg flex items-center space-x-2"
            aria-label="Login"
          >
            <LogIn size={18} />
            <span>Login</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;