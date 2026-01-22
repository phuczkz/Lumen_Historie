import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Assuming react-icons is available or using placeholders
import { LuBell, LuCircleUserRound } from 'react-icons/lu'; // Corrected: Replaced LuUserCircle with LuCircleUserRound

// Reuse the UserInfo interface (ensure it's imported or defined if needed)
interface UserInfo {
  id: number; // Added id to match localStorage structure
  username: string; // Changed from email/name to username
  role: string;
}

interface AdminHeaderProps {
  title: string; // To display the current page title
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user info (similar to main Header)
  useEffect(() => {
    try {
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        const parsedInfo = JSON.parse(storedUserInfo);
        // Ensure the parsed info matches the UserInfo interface structure
        if (parsedInfo && typeof parsedInfo.username === 'string' && typeof parsedInfo.role === 'string') {
          setUserInfo(parsedInfo);
        } else {
          console.warn('Stored user info is not in the expected format:', parsedInfo);
          setUserInfo(null);
          localStorage.removeItem('userInfo'); // Clear invalid data
          // navigate('/login');
        }
      } else {
        setUserInfo(null);
         // navigate('/login'); 
      }
    } catch (error) {
      console.error('Failed to load user info from localStorage:', error);
      setUserInfo(null);
      localStorage.removeItem('userInfo');
    }
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  const handleLogout = () => {
    // Reuse or adapt logout logic
    try {
      localStorage.removeItem('userInfo');
      setUserInfo(null);
      setIsUserDropdownOpen(false);
      console.log('Admin logged out and localStorage cleared.');
      navigate('/admin/login');
    } catch (error) {
      console.error('Failed to clear user info from localStorage:', error);
    }
  };

  const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left Side - Page Title */}
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>

      {/* Right Side - Search, Notifications, User */}
      <div className="flex items-center space-x-4">
        {/* Notifications Icon */}
        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none">
           <span className="sr-only">View notifications</span>
           <LuBell className="h-6 w-6" />
        </button>

        {/* User Menu Dropdown */}
        {userInfo && (
          <div className="relative" ref={userDropdownRef}>
            <button 
              onClick={toggleUserDropdown} 
              className="flex items-center space-x-2 focus:outline-none"
            >
              <LuCircleUserRound className="h-8 w-8 text-gray-600" />
              <div className="text-sm text-left hidden md:block">
                 <span className="font-medium text-gray-800">{userInfo.username}</span>
                 <span className="block text-gray-500 text-xs capitalize">{userInfo.role}</span>
              </div>
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-30 border border-gray-200">
                <Link to="/admin/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsUserDropdownOpen(false)}>Hồ sơ</Link>
                <Link to="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsUserDropdownOpen(false)}>Cài đặt</Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button 
                  onClick={handleLogout} 
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader; 