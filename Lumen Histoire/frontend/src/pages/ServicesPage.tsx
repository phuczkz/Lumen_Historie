import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import serviceService, { Service } from '../api/serviceService'; // Import serviceService and Service type
import { LuLoader, LuTriangleAlert, LuPackageSearch } from 'react-icons/lu'; // Added icons

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // URL search parameters
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter and sort states
  const [expertFilter, setExpertFilter] = useState<string>('all');
  const [sessionFilter, setSessionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name-asc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 12;

  // Initialize search term from URL parameters
  useEffect(() => {
    const urlSearchTerm = searchParams.get('search');
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await serviceService.getAll();
        setServices(data);
        setFilteredServices(data);
      } catch (err: any) {
        console.error("Failed to fetch services:", err);
        setError(err.response?.data?.message || 'Không thể tải danh sách dịch vụ. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Get unique experts for filter dropdown
  const uniqueExperts = React.useMemo(() => {
    const experts = services
      .flatMap(service => service.doctor_names || [])
      .filter((expert, index, array) => array.indexOf(expert) === index)
      .sort();
    return experts;
  }, [services]);

  // Get unique session counts for filter dropdown
  const uniqueSessionCounts = React.useMemo(() => {
    const sessionCounts = services
      .map(service => service.number_of_sessions)
      .filter((count, index, array) => array.indexOf(count) === index)
      .sort((a, b) => a - b);
    return sessionCounts;
  }, [services]);

  // Filter and sort services
  useEffect(() => {
    let filtered = [...services];

          // Apply search filter
      if (searchTerm.trim()) {
        filtered = filtered.filter(service => 
          (service.name || service.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (service.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (service.doctor_names && service.doctor_names.some(name => 
            name.toLowerCase().includes(searchTerm.toLowerCase())
          ))
        );
      }

    // Apply expert filter
    if (expertFilter !== 'all') {
      filtered = filtered.filter(service => 
        service.doctor_names && service.doctor_names.includes(expertFilter)
      );
    }

    // Apply session count filter
    if (sessionFilter !== 'all') {
      const sessionCount = parseInt(sessionFilter);
      filtered = filtered.filter(service => service.number_of_sessions === sessionCount);
    }

          // Apply sorting
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'name-asc':
            return (a.name || a.title || '').localeCompare(b.name || b.title || '');
          case 'name-desc':
            return (b.name || b.title || '').localeCompare(a.name || a.title || '');
          case 'price-asc':
            return (typeof a.price === 'string' ? parseFloat(a.price) : a.price) - (typeof b.price === 'string' ? parseFloat(b.price) : b.price);
          case 'price-desc':
            return (typeof b.price === 'string' ? parseFloat(b.price) : b.price) - (typeof a.price === 'string' ? parseFloat(a.price) : a.price);
          case 'sessions-asc':
            return a.number_of_sessions - b.number_of_sessions;
          case 'sessions-desc':
            return b.number_of_sessions - a.number_of_sessions;
          default:
            return 0;
        }
      });

    setFilteredServices(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [services, expertFilter, sessionFilter, sortBy, searchTerm]);

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
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        className="bg-white bg-center text-white text-center py-16 px-4 sm:py-24 lg:py-32 relative"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80)' }}
      >
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">CÁC GÓI DỊCH VỤ CỦA CHÚNG TÔI</h1>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Search and Filter Controls */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm dịch vụ theo tên, mô tả, chuyên gia..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-[16px] leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-green-500"
              />
            </div>
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Expert Filter */}
              <div className="flex items-center space-x-2">
                <label htmlFor="expert-filter" className="text-sm font-medium text-gray-800">Chuyên gia:</label>
                <select
                  id="expert-filter"
                  value={expertFilter}
                  onChange={(e) => setExpertFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-[16px] text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-white min-w-[180px]"
                >
                  <option value="all">Tất cả chuyên gia</option>
                  {uniqueExperts.map((expert) => (
                    <option key={expert} value={expert}>{expert}</option>
                  ))}
                </select>
              </div>

              {/* Session Count Filter */}
              <div className="flex items-center space-x-2">
                <label htmlFor="session-filter" className="text-sm font-medium text-gray-700">Số buổi:</label>
                <select
                  id="session-filter"
                  value={sessionFilter}
                  onChange={(e) => setSessionFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-[16px] text-sm focus:outline-none focus:border-green-500 bg-white min-w-[120px]"
                >
                  <option value="all">Tất cả</option>
                  {uniqueSessionCounts.map((count) => (
                    <option key={count} value={count.toString()}>{count} buổi</option>
                  ))}
                </select>
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-600">
                Tìm thấy {filteredServices.length} dịch vụ
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
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
                <option value="sessions-asc">Ít buổi đến nhiều buổi</option>
                <option value="sessions-desc">Nhiều buổi đến ít buổi</option>
              </select>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <LuLoader className="animate-spin h-12 w-12 text-green-600" />
            <p className="ml-3 text-lg text-gray-700">Đang tải danh sách dịch vụ...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-20 bg-red-50 p-6 rounded-lg border border-red-200">
            <LuTriangleAlert className="h-12 w-12 text-red-500 mb-3" />
            <p className="text-lg font-medium text-red-700">Lỗi tải dữ liệu</p>
            <p className="text-sm text-red-600 mb-4">{error}</p>
          </div>
        )}

        {!loading && !error && filteredServices.length === 0 && (
            <div className="text-center py-20">
                 <LuPackageSearch className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-700">Không tìm thấy dịch vụ nào</h3>
                <p className="text-sm text-gray-500">
                  {searchTerm || expertFilter !== 'all' || sessionFilter !== 'all'
                    ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.' 
                    : 'Hiện tại chưa có thông tin dịch vụ nào được cập nhật.'}
                </p>
            </div>
        )}

        {!loading && !error && currentServices.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
            {currentServices.map((service) => (
                <Link key={service.id} to={`/dich-vu/${service.id}`} className="group block border border-gray-200 rounded-[16px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1 bg-white flex flex-col no-underline">
                {service.image ? (
                    <img src={service.image} alt={service.name || service.title || ''} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"/>
                ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                        <LuPackageSearch className="w-16 h-16" />
                    </div>
                )}
                <div className="p-4 flex flex-col flex-grow">
                    {service.duration && <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded mb-2 self-start">{service.duration}</span>}
                    <h4 className="text-lg font-semibold group-hover:text-green-700 mb-2 flex-grow truncate" title={service.name || service.title || ''}>{service.name || service.title}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3 h-16" title={service.description || ''}>{service.description}</p>
                    {service.doctor_names && service.doctor_names.length > 0 && (
                      <p className="text-xs text-gray-500 mb-2 truncate">
                        Chuyên gia: {service.doctor_names.slice(0, 2).join(', ')}
                        {service.doctor_names.length > 2 && ` +${service.doctor_names.length - 2} khác`}
                      </p>
                    )}
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-base font-bold pb-2">Chi phí: {(typeof service.price === 'string' ? parseFloat(service.price) : service.price).toLocaleString('vi-VN')}đ</p>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full mb-2 mt-1">{service.number_of_sessions} buổi</span>
                    </div>
                    <button className="mt-auto w-full bg-red-100 font-semibold py-2 px-4 rounded-[16px] hover:bg-red-200 transition-colors duration-200" 
                    onClick={(e) => {
                      e.preventDefault(); // Ngăn Link bị chặn
                      window.location.href = `/dich-vu/${service.id}`;
                    }}>
                    Đăng ký ngay
                    </button>
                </div>
                </Link>
            ))}
            </div>
        )}

        {/* Pagination */}
        {!loading && !error && filteredServices.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4">
                <span className="text-sm text-gray-600">
                  Hiển thị {indexOfFirstService + 1}-{Math.min(indexOfLastService, filteredServices.length)} trên {filteredServices.length} kết quả
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

export default ServicesPage;