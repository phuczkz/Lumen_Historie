import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ExpertCard from '../../components/ExpertCard'; 
import { LuPlus, LuSearch, LuChevronDown, LuSlidersHorizontal, LuFilePenLine, LuTrash2, LuCircleUserRound, LuEye, LuArrowUpDown } from 'react-icons/lu';
import { useNavigate, Link } from 'react-router-dom';
import doctorService, { Doctor } from '../../api/doctorService'; // Import Doctor type and service

// No longer using mock Expert interface or data

const AdminExpertsPage: React.FC = () => {
  const [experts, setExperts] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalExperts, setTotalExperts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [sortConfig, setSortConfig] = useState<{key: keyof Doctor; direction: 'asc' | 'desc'} | null>(null);
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');

  const fetchExperts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let fetchedExperts: Doctor[];
      if (searchTerm.trim() !== '') {
        fetchedExperts = await doctorService.search(searchTerm.trim());
      } else {
        fetchedExperts = await doctorService.getAll();
      }
      setExperts(fetchedExperts);
      setTotalExperts(fetchedExperts.length); // Assuming API doesn't provide total for pagination yet
    } catch (err: any) {
      console.error('Failed to fetch experts:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách chuyên gia.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchExperts();
    }, 300); // Debounce search calls
    return () => clearTimeout(debounceTimer);
  }, [fetchExperts]);

  const handleDeleteExpert = async (expertId: number, expertName?: string) => {
    const confirmMessage = expertName 
      ? `Bạn có chắc chắn muốn xóa chuyên gia "${expertName}" (ID: ${expertId}) không?`
      : `Bạn có chắc chắn muốn xóa chuyên gia ID: ${expertId} không?`;

    if (window.confirm(confirmMessage)) {
      try {
        await doctorService.delete(expertId);
        setExperts(prevExperts => prevExperts.filter(expert => expert.id !== expertId));
        setTotalExperts(prevTotal => prevTotal - 1);
        alert(`Đã xóa chuyên gia ${expertName || `ID ${expertId}`}.`);
      } catch (err: any) {
        console.error('Failed to delete expert:', err);
        const deleteError = err.response?.data?.message || 'Không thể xóa chuyên gia. Vui lòng thử lại.';
        setError(deleteError); 
        alert(`Lỗi khi xóa: ${deleteError}`);
      }
    }
  };

  const handleSort = (key: keyof Doctor) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedExperts = useMemo(() => {
    let result = [...experts];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(expert =>
        expert.full_name?.toLowerCase().includes(searchLower) ||
        expert.email?.toLowerCase().includes(searchLower) ||
        expert.phone?.includes(searchTerm) ||
        expert.specialty?.toLowerCase().includes(searchLower)
      );
    }

    // Apply specialty filter
    if (specialtyFilter !== 'all') {
      result = result.filter(expert => expert.specialty === specialtyFilter);
    }

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [experts, searchTerm, specialtyFilter, sortConfig]);

  // Get unique specialties for filter
  const specialties = useMemo(() => {
    const uniqueSpecialties = new Set(experts.map(expert => expert.specialty).filter(Boolean));
    return Array.from(uniqueSpecialties);
  }, [experts]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedExperts.length / itemsPerPage);
  const paginatedExperts = filteredAndSortedExperts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading && experts.length === 0) {
    return <div className="p-6 text-center text-gray-600">Đang tải danh sách chuyên gia...</div>;
  }

  if (error && experts.length === 0) {
    return <div className="p-6 text-center text-red-600 bg-red-50 py-4 rounded-md">{error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-[16px] shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => navigate('/admin/experts/add')} 
            className="flex items-center bg-green-100 px-4 py-2 rounded-[16px] hover:bg-green-200 transition-colors text-sm font-medium shadow-sm"
          >
            <LuPlus className="mr-2 h-4 w-4" />
            Thêm Chuyên gia
          </button>
          <div className="relative flex-grow sm:flex-grow-0">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <LuSearch className="h-5 w-5 text-gray-400" />
            </span>
            <input
              type="search"
              placeholder="Tìm chuyên gia theo tên, email..."
              className="pl-10 pr-4 py-2 w-full sm:w-80 rounded-[16px] border border-gray-300 bg-white text-sm focus:outline-none focus:ring-green-500 focus:border-green-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className='relative'>
            <select
              className="appearance-none pl-3 pr-10 py-2 border border-gray-300 rounded-[16px] text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
            >
              <option value="all">Tất cả chuyên khoa</option>
              {specialties.filter(specialty => specialty != null).map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute top-1/2 right-3 transform -translate-y-1/2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
        </div>

          <button 
            className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none shadow-sm"
            onClick={() => handleSort('full_name')}
          >
            <LuSlidersHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {error && experts.length > 0 && (
        <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      {!loading && experts.length === 0 && !error && (
        <div className="text-center py-10">
          <LuCircleUserRound className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            {searchTerm ? 'Không tìm thấy chuyên gia' : 'Chưa có chuyên gia nào'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.' : 'Bắt đầu bằng cách thêm một chuyên gia mới.'}
          </p>
          {!searchTerm && (
            <button 
              onClick={() => navigate('/admin/experts/add')} 
              className="mt-4 inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
            >
              <LuPlus className="mr-2 h-4 w-4" />
              Thêm Chuyên gia
            </button>
          )}
        </div>
      )}

      {paginatedExperts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {paginatedExperts.map((expert) => (
            <div key={expert.id} className="relative group">
              <ExpertCard 
                id={expert.id.toString()} 
                name={expert.full_name} 
                imageUrl={expert.profile_picture || 'https://via.placeholder.com/64x64.png?text=Avatar'}
                specialty={expert.specialty || 'Chưa cập nhật'}
                phone={expert.phone || 'N/A'}
                rating={expert.average_rating || 0} 
                reviewCount={expert.review_count || 0}
                services={expert.services}
              />
              <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Link 
                  to={`/admin/experts/${expert.id}`}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-md transition-colors shadow-sm" 
                  title="Xem chi tiết"
                >
                  <LuEye className="w-3 h-3" />
                </Link>
                <button 
                  onClick={() => navigate(`/admin/experts/${expert.id}/edit`)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white p-1.5 rounded-md transition-colors shadow-sm" 
                  title="Chỉnh sửa"
                >
                  <LuFilePenLine className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => handleDeleteExpert(expert.id, expert.full_name)}
                  className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-md transition-colors shadow-sm" 
                  title="Xóa"
                >
                  <LuTrash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Phân trang */}
      {totalExperts > 0 && (
        <div className="flex justify-between items-center mt-4 px-4 py-3 border-t border-gray-300">
          <div className="flex items-center text-sm text-gray-500">
            <select 
              value={itemsPerPage} 
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md p-1 mr-2 text-xs focus:outline-none focus:border-green-500 bg-white shadow-sm"
            >
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="36">36</option>
            </select>
            <span>Hiển thị {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredAndSortedExperts.length)} trên {filteredAndSortedExperts.length} chuyên gia</span>
          </div>

          <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`relative inline-flex items-center px-4 py-2 border ${currentPage === i + 1 ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'} text-sm font-medium`}
              >
                {i + 1}
              </button>
            ))}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>
            )}
            {totalPages > 5 && (
              <button
                onClick={() => setCurrentPage(totalPages)}
                className={`relative inline-flex items-center px-4 py-2 border ${currentPage === totalPages ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'} text-sm font-medium`}
              >
                {totalPages}
              </button>
            )}
            <button
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default AdminExpertsPage;