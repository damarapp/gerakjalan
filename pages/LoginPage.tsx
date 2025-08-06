import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';
import Card from '../components/Card';
import { LogIn, KeyRound, LoaderCircle, User as UserIcon } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login } = useAppContext();
  const [role, setRole] = useState<UserRole>(UserRole.JUDGE);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        await login(role, username, password);
    } catch (err: any) {
        setError(err.message || 'Login gagal. Silakan coba lagi.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleRoleChange = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setUsername('');
    setPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-abu-abu p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-merah">Selamat Datang!</h2>
          <p className="text-abu-abu-gelap">Silakan login untuk melanjutkan</p>
        </div>

        <div className="mb-6 flex justify-center rounded-lg bg-gray-200 p-1">
          <button
            onClick={() => handleRoleChange(UserRole.JUDGE)}
            className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${role === UserRole.JUDGE ? 'bg-merah text-putih' : 'text-gray-600'}`}
          >
            Juri
          </button>
          <button
            onClick={() => handleRoleChange(UserRole.ADMIN)}
            className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${role === UserRole.ADMIN ? 'bg-merah text-putih' : 'text-gray-600'}`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <>
            <div>
                <label htmlFor="username-input" className="block text-sm font-medium text-abu-abu-gelap mb-2">
                    Nama Pengguna
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                      type="text"
                      id="username-input"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-merah focus:border-merah"
                      required
                      placeholder={role === UserRole.JUDGE ? "Masukkan nama pengguna juri" : "Masukkan username admin"}
                      autoComplete="username"
                  />
                </div>
            </div>
            <div>
                <label htmlFor="password-input" className="block text-sm font-medium text-abu-abu-gelap mb-2">
                    Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <KeyRound className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                      type="password"
                      id="password-input"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-merah focus:border-merah"
                      required
                      placeholder="Masukkan password"
                      autoComplete="current-password"
                  />
                </div>
            </div>
          </>
          
          {error && <p className="text-merah text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="w-full bg-merah text-putih font-bold py-3 px-4 rounded-lg hover:bg-merah-tua transition-colors duration-300 disabled:bg-gray-400 flex items-center justify-center space-x-2"
          >
            {isLoading ? <LoaderCircle className="animate-spin" size={20} /> : <LogIn size={20} />}
            <span>{isLoading ? 'Memproses...' : 'Login'}</span>
          </button>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;