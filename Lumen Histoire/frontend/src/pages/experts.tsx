import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom'; // Import Link for navigation and useSearchParams
import doctorService, { Doctor } from '../api/doctorService'; // Adjust path as needed
import { LuLoader, LuTriangleAlert, LuCircleUserRound, LuSearch } from 'react-icons/lu'; // Corrected icon to LuCircleUserRound

const ExpertsPage: React.FC = () => {
  const [experts, setExperts] = useState<Doctor[]>([]);
  const [filteredExperts, setFilteredExperts] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // URL search parameters
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter and sort states
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name-asc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const expertsPerPage = 12;

  // Initialize search term from URL parameters
  useEffect(() => {
    const urlSearchTerm = searchParams.get('search');
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchExperts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await doctorService.getAll();
        setExperts(data);
        setFilteredExperts(data);
      } catch (err: any) {
        console.error("Failed to fetch experts:", err);
        setError(err.response?.data?.message || 'Không thể tải danh sách chuyên gia. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, []);

  // Get unique specialties for filter dropdown
  const uniqueSpecialties = React.useMemo(() => {
    const specialties = experts
      .map(expert => expert.specialty)
      .filter((specialty): specialty is string => specialty !== null && specialty !== undefined && specialty.trim() !== '')
      .filter((specialty, index, array) => array.indexOf(specialty) === index)
      .sort();
    return specialties;
  }, [experts]);

  // Filter and sort experts
  useEffect(() => {
    let filtered = [...experts];

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(expert => 
        expert.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (expert.specialty && expert.specialty.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (expert.bio && expert.bio.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply specialty filter
    if (specialtyFilter !== 'all') {
      filtered = filtered.filter(expert => expert.specialty === specialtyFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.full_name.localeCompare(b.full_name);
        case 'name-desc':
          return b.full_name.localeCompare(a.full_name);
        case 'specialty-asc':
          return (a.specialty || '').localeCompare(b.specialty || '');
        case 'specialty-desc':
          return (b.specialty || '').localeCompare(a.specialty || '');
        default:
          return 0;
      }
    });

    setFilteredExperts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [experts, specialtyFilter, sortBy, searchTerm]);

  // Update search term and URL parameters
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  // Pagination logic
  const indexOfLastExpert = currentPage * expertsPerPage;
  const indexOfFirstExpert = indexOfLastExpert - expertsPerPage;
  const currentExperts = filteredExperts.slice(indexOfFirstExpert, indexOfLastExpert);
  const totalPages = Math.ceil(filteredExperts.length / expertsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      {/* Hero Section */}
      <section 
        className="bg-cover bg-center text-white text-center py-16 px-4 sm:py-24 lg:py-32 relative"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80)' }} 
      >
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">ĐỘI NGŨ CHUYÊN GIA CỦA CHÚNG TÔI</h1>
        </div>
      </section>

      {/* Experts Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Search and Filter Controls */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LuSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm chuyên gia theo tên, chuyên khoa..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-[16px] leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-green-500"
              />
            </div>
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Specialty Filter */}
              <div className="flex items-center space-x-2">
                <label htmlFor="specialty-filter" className="text-sm font-medium text-gray-700">Chuyên khoa:</label>
                <select
                  id="specialty-filter"
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-[16px] text-sm focus:outline-none focus:border-green-500 bg-white min-w-[180px]"
                >
                  <option value="all">Tất cả chuyên khoa</option>
                  {uniqueSpecialties.map((specialty) => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-600">
                Tìm thấy {filteredExperts.length} chuyên gia
              </div>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center space-x-2">
              <label htmlFor="sort-select" className="text-sm font-medium text-gray-700">Sắp xếp:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-[16px] text-sm focus:outline-none focus:border-green-500 bg-white"
              >
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
                <option value="specialty-asc">Chuyên khoa A-Z</option>
                <option value="specialty-desc">Chuyên khoa Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <LuLoader className="animate-spin h-12 w-12 text-green-600" />
            <p className="ml-3 text-lg text-gray-700">Đang tải danh sách chuyên gia...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-20 bg-red-50 p-6 rounded-[16px] border border-red-200">
            <LuTriangleAlert className="h-12 w-12 text-red-500 mb-3" />
            <p className="text-lg font-medium text-red-700">Lỗi tải dữ liệu</p>
            <p className="text-sm text-red-600 mb-4">{error}</p>
          </div>
        )}

        {!loading && !error && filteredExperts.length === 0 && (
            <div className="text-center py-20">
                 <LuCircleUserRound className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-700">Không tìm thấy chuyên gia nào</h3>
                <p className="text-sm text-gray-500">
                  {searchTerm || specialtyFilter !== 'all' 
                    ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.' 
                    : 'Hiện tại chưa có thông tin chuyên gia nào được cập nhật.'}
                </p>
            </div>
        )}

        {!loading && !error && currentExperts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentExperts.map((expert) => (
                <Link key={expert.id} to={`/chuyen-gia/${expert.id}`} className="group block">
                  <div className="bg-white rounded-[16px] shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden h-full">
                    {/* Profile Picture */}
                    <div className="relative w-full h-48 flex items-center justify-center overflow-hidden">
                      {expert.profile_picture ? (
                        <img 
                          src={expert.profile_picture} 
                          alt={expert.full_name} 
                          className="w-40 h-40 bg-green-100 rounded-full flex items-center justify-center"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                          <LuCircleUserRound className="w-12 h-12 text-green-600" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      {/* Name */}
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 mb-2 transition-colors duration-200">
                        {expert.full_name}
                      </h3>
                      
                      {/* Bio */}
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                        {expert.bio ? 
                          (expert.bio.length > 120 ? expert.bio.substring(0, 120) + '...' : expert.bio) 
                          : 'Chuyên gia tâm lý với nhiều năm kinh nghiệm trong lĩnh vực tư vấn và điều trị.'}
                      </p>
   
                      
                      {/* Action Button */}
                      <div className="flex items-center justify-between border-t border-gray-100">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="text-sm text-gray-600 ml-1">(5.0)</span>
                        </div>
                        
                        <div className="flex items-center text-green-600 font-medium text-sm group-hover:text-green-700 transition-colors">
                          Xem chi tiết
                          <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
            ))}
            </div>
        )}

        {/* Pagination */}
        {!loading && !error && filteredExperts.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4">
                <span className="text-sm text-gray-600">
                  Hiển thị {indexOfFirstExpert + 1}-{Math.min(indexOfLastExpert, filteredExperts.length)} trên {filteredExperts.length} kết quả
                </span>
                
                {totalPages > 1 && (
                  <nav className="flex items-center space-x-1">
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      &lt;
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-3 py-1 border rounded-md text-sm font-medium ${
                            currentPage === pageNumber
                              ? 'border-green-500 bg-green-500 text-white'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      &gt;
                    </button>
                  </nav>
                )}
            </div>
        )}
      </section>
    </div>
  );
};

export default ExpertsPage; // Changed from Homepage to ExpertsPage