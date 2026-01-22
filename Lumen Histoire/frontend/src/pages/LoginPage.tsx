import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService, { AuthResponseData } from '../api/authService'; // Import authService
import { LuLoader } from 'react-icons/lu'; // For loading state

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState(''); // Changed from email to username to match authService
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Assuming admin login requires username (can be email if backend supports it)
      const response: AuthResponseData = await authService.loginAdmin({ username, password });
      console.log('Login successful:', response);

      if (response.token && response.adminId && response.username) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userInfo', JSON.stringify({ 
            id: response.adminId, 
            username: response.username, // Use username from response
            role: 'admin' 
        }));
        console.log('Admin info (including username) and token saved to localStorage');
        navigate('/admin');
      } else {
        setError(response.message || 'Đăng nhập không thành công. Thiếu thông tin token, ID hoặc username.');
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Sai tên đăng nhập hoặc mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/">
          <img 
            className="mx-auto h-12 w-auto" 
            src="../logo.png" // Adjust the path to your logo image
            alt="Lumen Histoire Logo" 
          />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Đăng nhập tài khoản Admin
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Hoặc{' '}
          <Link to="/admin/register" className="font-medium text-green-600 hover:text-green-500">
            tạo tài khoản Admin mới
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-gray-600">
          <Link to="/client/login" className="font-medium text-blue-600 hover:text-blue-500">
            Đăng nhập với tư cách Client
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Tên đăng nhập (Admin)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                   </svg>
                 </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-[16px] placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="admin_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                    </svg>
                 </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-[16px] placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm p-2 bg-red-50 rounded-md">{error}</div>
            )}

            {/* Removed remember me and forgot password for simplicity, can be added back */}

            <div>
              <button 
                type="submit" 
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-[16px] shadow-sm text-sm font-medium bg-green-200 hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <LuLoader className="animate-spin h-5 w-5 mr-2" />
                    Đang xử lý...
                  </div>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 