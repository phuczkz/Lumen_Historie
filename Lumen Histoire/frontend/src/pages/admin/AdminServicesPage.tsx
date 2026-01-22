import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminServiceCard from '../../components/AdminServiceCard';
import { LuPlus, LuSearch, LuChevronDown, LuSlidersHorizontal } from 'react-icons/lu';
import medicalServiceService, { MedicalService } from '../../api/medicalServiceService';
import doctorService, { Doctor } from '../../api/doctorService';

const AdminServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<MedicalService[]>([]);
  const [experts, setExperts] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalServices, setTotalServices] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [sortConfig, setSortConfig] = useState<{key: keyof MedicalService; direction: 'asc' | 'desc'} | null>(null);
  const [sessionsFilter, setSessionsFilter] = useState<string>('all');
  const [doctorFilter, setDoctorFilter] = useState<string>('all');

  const parseDoctorDetails = (service: MedicalService): Array<{ id: number; name: string; specialty: string }> => {
    if (!service.doctor_details || service.doctor_details.length === 0) return [];
    return service.doctor_details;
  };

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const fetchedExperts = await doctorService.getAll();
        setExperts(fetchedExperts);
      } catch (err: any) {
        console.error('Failed to fetch experts:', err);
        setError(err.response?.data?.message || 'Không thể tải danh sách chuyên gia.');
      }
    };
    fetchExperts();
  }, []);
  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let fetchedServices: MedicalService[];
      if (searchTerm.trim() !== '') {
        fetchedServices = await medicalServiceService.search(searchTerm.trim());
      } else {
        fetchedServices = await medicalServiceService.getAll();
      }
      setServices(fetchedServices);
      setTotalServices(fetchedServices.length);
    } catch (err: any) {
      console.error('Failed to fetch services:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách dịch vụ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchServices();
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [fetchServices]);

  const handleDeleteService = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này không?')) {
      try {
        await medicalServiceService.delete(id);
        setServices(prev => prev.filter(service => service.id !== id));
        setTotalServices(prev => prev - 1);
      } catch (err: any) {
        console.error('Failed to delete service:', err);
        setError(err.response?.data?.message || 'Không thể xóa dịch vụ. Vui lòng thử lại.');
      }
    }
  };

  const handleSort = (key: keyof MedicalService) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedServices = useMemo(() => {
    let result = [...services];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(service =>
        service.name?.toLowerCase().includes(searchLower) ||
        service.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply doctor filter
    if (doctorFilter !== 'all') {
      const doctorId = parseInt(doctorFilter);
      result = result.filter(service => 
        service.doctor_ids && service.doctor_ids.includes(doctorId)
      );
    }

    // Apply sessions filter
    if (sessionsFilter !== 'all') {
      const [minSessions, maxSessions] = sessionsFilter.split('-').map(Number);
      result = result.filter(service => {
        const sessions = service.number_of_sessions;
        if (maxSessions) {
          return sessions >= minSessions && sessions <= maxSessions;
        }
        return sessions >= minSessions;
      });
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
  }, [services, searchTerm, doctorFilter, sessionsFilter, sortConfig]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedServices.length / itemsPerPage);
  const paginatedServices = filteredAndSortedServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading && services.length === 0) {
    return <div className="p-6 text-center text-gray-600">Đang tải danh sách dịch vụ...</div>;
  }

  if (error && services.length === 0) {
    return <div className="p-6 text-center text-red-600 bg-red-50 py-4 rounded-md">{error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-[16px] shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => navigate('/admin/services/add')}
            className="flex items-center bg-green-100 text-black px-4 py-2 rounded-[16px] hover:bg-green-200 transition-colors text-sm font-medium">
            <LuPlus className="mr-2 h-4 w-4" />
            Thêm Dịch vụ
          </button>
          <div className="relative flex-grow sm:flex-grow-0">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <LuSearch className="h-5 w-5 text-gray-400" />
            </span>
            <input
              type="search"
              placeholder="Tìm kiếm dịch vụ..."
              className="pl-10 pr-4 py-2 w-full sm:w-60 rounded-[16px] border border-gray-300 bg-white text-sm focus:outline-none focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            className="border border-gray-300 rounded-[16px] p-2 text-sm focus:border-green-500"
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
          >
            <option value="all">Tất cả chuyên gia</option>
            {experts.map((expert) => (
              <option key={expert.id} value={expert.id.toString()}>
                {expert.full_name}
              </option>
            ))}
          </select>
          <select
            className="border border-gray-300 rounded-[16px] p-2 text-sm focus:border-green-500"
            value={sessionsFilter}
            onChange={(e) => setSessionsFilter(e.target.value)}
          >
            <option value="all">Tất cả số buổi</option>
            <option value="1-1">1 buổi</option>
            <option value="2-5">2-5 buổi</option>
            <option value="6-10">6-10 buổi</option>
            <option value="11">Trên 10 buổi</option>
          </select>
          <button 
            className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none"
            onClick={() => handleSort('name')}
          >
            <LuSlidersHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {error && services.length > 0 && (
        <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginatedServices.length === 0 && !loading && (
          <div className="col-span-full text-center py-10">
            <h3 className="text-lg font-medium text-gray-900">
              {searchTerm ? 'Không tìm thấy dịch vụ nào phù hợp với tìm kiếm của bạn.' : 'Chưa có dịch vụ nào được tạo.'}
            </h3>
            {!searchTerm && (
              <button 
                onClick={() => navigate('/admin/services/add')} 
                className="mt-4 inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
              >
                <LuPlus className="mr-2 h-4 w-4" />
                Thêm Dịch vụ
              </button>
            )}
          </div>
        )}
        {paginatedServices.map((service) => (
          <AdminServiceCard
            key={service.id}
            id={String(service.id)}
            title={service.name}
            imageUrl={service.image || '/default-service-image.jpg'}
            descriptionSnippet={service.description || ''}
            price={service.price}
            numberOfSessions={service.number_of_sessions}
            expertNames={service.doctor_names}
            expertDetails={parseDoctorDetails(service)}
            onDelete={() => handleDeleteService(service.id)}
          />
        ))}
      </div>

      {/* Phân trang */}
      {totalServices > 0 && (
        <div className="flex justify-between items-center mt-4 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-500">
            <select 
              value={itemsPerPage} 
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md p-1 mr-2 text-xs focus:border-green-500"
            >
              <option value="8">8</option>
              <option value="12">12</option>
              <option value="16">16</option>
            </select>
            <span>Hiển thị {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredAndSortedServices.length)} trên {filteredAndSortedServices.length} dịch vụ</span>
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

export default AdminServicesPage;