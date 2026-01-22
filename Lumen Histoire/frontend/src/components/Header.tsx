import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import doctorService, { Doctor } from '../api/doctorService';
import serviceService, { Service } from '../api/serviceService';

// Placeholder Dropdown Arrow Icon
const DropdownIcon = () => (
  <svg className="ml-1 h-4 w-4 inline-block text-gray-500 group-hover:text-green-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

// Placeholder User Icon
const UserIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
   <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
);

// Define a type for user info stored in localStorage
interface UserInfo {
  email: string;
  role: string;
  full_name: string; // Updated to match the new key
  name: string;
  avatar_url: string;
}

// Search result types
interface SearchResult {
  id: number;
  title: string;
  type: 'expert' | 'service';
  subtitle?: string;
  link: string;
}

const Header: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  
  // Search states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const navigate = useNavigate();
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const aboutDropdownRef = useRef<HTMLDivElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // Check localStorage on component mount
useEffect(() => {
  const loadUserInfo = () => {
    try {
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo));
      } else {
        setUserInfo(null);
      }
    } catch {
      setUserInfo(null);
      localStorage.removeItem('userInfo');
    }
  };

  loadUserInfo();

  window.addEventListener('userInfoUpdated', loadUserInfo);
  window.addEventListener('storage', loadUserInfo);

  return () => {
    window.removeEventListener('userInfoUpdated', loadUserInfo);
    window.removeEventListener('storage', loadUserInfo);
  };
}, []);

  // Search functionality
  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults([]);
        setIsSearchDropdownOpen(false);
        return;
      }

      setIsSearching(true);
      try {
        let experts: any[] = [];
        let services: any[] = [];

        try {
          experts = await doctorService.getAll();
        } catch (expertError) {
          console.error('Failed to fetch experts:', expertError);
        }

        try {
          services = await serviceService.getAll();
        } catch (serviceError) {
          console.error('Failed to fetch services:', serviceError);
        }

        console.log('Search data:', { experts, services });

        // Safe filter for experts
        const expertResults: SearchResult[] = (Array.isArray(experts) ? experts : [])
          .filter(expert => {
            if (!expert || typeof expert !== 'object') return false;
            const fullName = expert.full_name || '';
            const specialty = expert.specialty || '';
            return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   specialty.toLowerCase().includes(searchTerm.toLowerCase());
          })
          .slice(0, 5)
          .map(expert => ({
            id: expert.id,
            title: expert.full_name || 'Chuyên gia không tên',
            type: 'expert' as const,
            subtitle: expert.specialty || 'Chuyên gia',
            link: `/chuyen-gia/${expert.id}`
          }));

        // Safe filter for services
        const serviceResults: SearchResult[] = (Array.isArray(services) ? services : [])
          .filter(service => {
            if (!service || typeof service !== 'object') return false;
            const title = service.title || service.name || '';
            const description = service.description || '';
            return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   description.toLowerCase().includes(searchTerm.toLowerCase());
          })
          .slice(0, 5)
          .map(service => ({
            id: service.id,
            title: service.title || service.name || 'Dịch vụ không tên',
            type: 'service' as const,
            subtitle: `${(service.price || 0).toLocaleString('vi-VN')} VNĐ - ${service.number_of_sessions || 0} buổi`,
            link: `/dich-vu/${service.id}`
          }));

        const allResults = [...expertResults, ...serviceResults].slice(0, 8);
        console.log('Search results:', allResults);
        setSearchResults(allResults);
        setIsSearchDropdownOpen(allResults.length > 0);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
        setIsSearchDropdownOpen(false);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Combined Effect to handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (aboutDropdownRef.current && !aboutDropdownRef.current.contains(event.target as Node)) {
        setIsAboutDropdownOpen(false);
      }
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    };
    if (isUserDropdownOpen || isAboutDropdownOpen || isSearchDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen, isAboutDropdownOpen, isSearchDropdownOpen]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('userInfo');
      setUserInfo(null);
      setIsUserDropdownOpen(false);
      console.log('User logged out and localStorage cleared.');
      navigate('/client/login'); 
    } catch (error) {
      console.error('Failed to clear user info from localStorage:', error);
    }
  };

  const handleSearchResultClick = (result: SearchResult) => {
    setSearchTerm('');
    setSearchResults([]);
    setIsSearchDropdownOpen(false);
    navigate(result.link);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsSearchDropdownOpen(false);
      // Navigate to search results page or show all results
      if (searchResults.length > 0) {
        navigate(searchResults[0].link);
      }
    }
  };

  const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen);
  const toggleAboutDropdown = () => setIsAboutDropdownOpen(!isAboutDropdownOpen);
  const closeAboutDropdown = () => setIsAboutDropdownOpen(false);

  // Define base and active classes for NavLink (adjusting for new design)
  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
    const baseClasses = "px-3 py-2 rounded-md text-sm font-medium";
    const inactiveClasses = "text-gray-700 hover:text-green-700"; 
    const activeClasses = "font-semibold text-green-700";
    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
    <header className="bg-white shadow-sm px-8 relative">
      {/* Top Row */}
      <div className="flex justify-between items-center py-3 border-b border-gray-200">
        {/* Logo and Brand Name */}
        <Link to="/" className="flex items-center space-x-3">
          <img src="../logo.png" alt="Lumen Histoire Logo" className="h-10 mr-1" />
          <span className="text-xl font-bold text-gray-800">Lumen Histoire</span>   
        </Link>
        
        {/* Right side controls */}
        <div className="flex items-center space-x-4">
          {userInfo ? (
            <>
              {/* Enhanced Search */}
               <div className="relative hidden sm:block" ref={searchDropdownRef}>
                 <form onSubmit={handleSearchSubmit}>
                   <div className="relative">
                     <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                       <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                         <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                       </svg>
                     </span>
                     <input 
                       type="search" 
                       placeholder="Tìm kiếm dịch vụ, chuyên gia..." 
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-pink-50 text-sm focus:outline-none focus:ring-1 focus:ring-pink-300 focus:border-transparent w-64"
                     />
                     {isSearching && (
                       <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                         <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                       </div>
                     )}
                   </div>
                 </form>
                 
                 {/* Search Results Dropdown */}
                 {isSearchDropdownOpen && searchResults.length > 0 && (
                   <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                     <div className="py-2">
                       {searchResults.map((result) => (
                         <button
                           key={`${result.type}-${result.id}`}
                           onClick={() => handleSearchResultClick(result)}
                           className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                         >
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                             result.type === 'expert' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                           }`}>
                             {result.type === 'expert' ? '👨‍⚕️' : '🏥'}
                           </div>
                           <div className="flex-1 min-w-0">
                             <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                             <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                           </div>
                           <div className="text-xs text-gray-400 capitalize">
                             {result.type === 'expert' ? 'Chuyên gia' : 'Dịch vụ'}
                           </div>
                         </button>
                       ))}
                       
                       {searchTerm.trim().length >= 2 && (
                         <div className="px-4 py-2 border-t border-gray-100">
                           <Link 
                             to={`/chuyen-gia?search=${encodeURIComponent(searchTerm)}`}
                             className="text-xs text-green-600 hover:text-green-700 mr-4"
                             onClick={() => {
                               setSearchTerm('');
                               setIsSearchDropdownOpen(false);
                             }}
                           >
                             Xem tất cả chuyên gia
                           </Link>
                           <Link 
                             to={`/dich-vu?search=${encodeURIComponent(searchTerm)}`}
                             className="text-xs text-blue-600 hover:text-blue-700"
                             onClick={() => {
                               setSearchTerm('');
                               setIsSearchDropdownOpen(false);
                             }}
                           >
                             Xem tất cả dịch vụ
                           </Link>
                         </div>
                       )}
                     </div>
                   </div>
                 )}
               </div>

               {/* Appointments Link */}
               <Link to="/lich-hen" className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-700">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
                 Lịch hẹn của tôi
               </Link>

               <button className="p-2 rounded-full bg-pink-50 hover:bg-pink-100 text-gray-500">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341A6.002 6.002 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
               </button>
              
              {/* User Info Dropdown Area */}
              <div className="relative" ref={userDropdownRef}> 
          <button onClick={toggleUserDropdown} className="flex items-center space-x-2 focus:outline-none">
            {userInfo.avatar_url ? (
            <img
              src={userInfo.avatar_url}
             alt="Avatar"
              className="h-8 w-8 rounded-full object-cover border border-gray-200"
            />
            ) : (
              <UserIcon />
          )}
  <div className="text-sm text-left">
    <span className="font-medium text-gray-800">{userInfo.full_name || userInfo.name || 'Người dùng'}</span>
    <span className="block text-gray-500 text-xs capitalize">{userInfo.role}</span>
  </div>
</button>
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsUserDropdownOpen(false)}>Trang cá nhân</Link>
                    {userInfo.role === 'admin' && <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsUserDropdownOpen(false)}>Trang quản lý Admin</Link>}
                    {userInfo.role === 'doctor' && <Link to="/doctor-dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsUserDropdownOpen(false)}>Trang quản lý Bác sĩ</Link>}
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Đăng xuất</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Login/Register Buttons */}
              <Link to="/client/login" className="text-sm font-medium text-gray-700 hover:text-green-700">
                Đăng nhập
              </Link>
              <Link 
                to="/client/register" 
                className="ml-4 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex justify-between items-center py-3">
        {/* Navigation Links */}
        <nav className="flex space-x-1">
          {/* About Dropdown */}
           <div className="relative" ref={aboutDropdownRef}>
             <button 
               onClick={toggleAboutDropdown}
               className="group px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-700 inline-flex items-center focus:outline-none"
             >
               <span>Giới thiệu</span>
               <DropdownIcon />
             </button>
             {isAboutDropdownOpen && (
               <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                 <Link to="/gioi-thieu/ve-chung-toi" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={closeAboutDropdown}>Về Chúng tôi</Link>
                 <Link to="/gioi-thieu/nguyen-tac-dao-duc" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={closeAboutDropdown}>Nguyên tắc đạo đức</Link>
                 <Link to="/gioi-thieu/cau-hoi-thuong-gap" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={closeAboutDropdown}>Câu hỏi thường gặp</Link>
               </div>
             )}
           </div>
          
           {/* Other Nav Links */}
          <NavLink to="/chuyen-gia" className={getNavLinkClass}>Chuyên gia</NavLink>
          <NavLink to="/dich-vu" className={getNavLinkClass}>Dịch vụ</NavLink>
          <NavLink to="/lien-he" className={getNavLinkClass}>Liên hệ</NavLink>
        </nav>

        {/* CTA Button */}
        {userInfo ? (
          <Link to="/dich-vu" className="bg-green-200 text-green-800 px-5 py-2 rounded-full text-sm font-medium hover:bg-green-300 transition-colors duration-200">
            Đặt lịch tư vấn
          </Link>
        ) : (
          <Link to="/dich-vu" className="bg-green-200 text-green-800 px-5 py-2 rounded-full text-sm font-medium hover:bg-green-300 transition-colors duration-200">
            Đặt lịch tư vấn
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;