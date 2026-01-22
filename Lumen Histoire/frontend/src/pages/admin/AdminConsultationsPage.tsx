import React, { useState, useMemo, useEffect } from 'react';
import { LuSearch, LuCalendar, LuChevronDown, LuArrowUpDown, LuEye } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import orderService, { Order, OrderStatus } from '../../api/orderService';
import { format } from 'date-fns';

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'in_progress':
      return 'bg-purple-100 text-purple-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return 'Chờ xác nhận';
    case 'confirmed':
      return 'Đã xác nhận';
    case 'in_progress':
      return 'Đang tiến hành';
    case 'completed':
      return 'Đã hoàn thành';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return 'Không xác định';
  }
};

const AdminConsultationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: keyof Order; direction: 'asc' | 'desc'} | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderService.getAll();
        setOrders(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải danh sách đơn tư vấn');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleSort = (key: keyof Order) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(order =>
        order.client_name?.toLowerCase().includes(searchLower) ||
        order.doctor_name?.toLowerCase().includes(searchLower) ||
        order.service_name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        // Handle null/undefined values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
        if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [orders, searchTerm, statusFilter, sortConfig]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);
  const paginatedOrders = filteredAndSortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderSortIcon = (key: keyof Order) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <LuArrowUpDown className="ml-1 h-3 w-3 opacity-50 group-hover:opacity-100" />;
    }
    return (
      <LuArrowUpDown 
        className={`ml-1 h-3 w-3 ${sortConfig.direction === 'asc' ? 'text-green-600' : 'text-green-600 rotate-180'}`} 
      />
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg m-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-[16px] shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <div className="relative w-full sm:w-auto">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <LuSearch className="h-5 w-5 text-gray-400" />
          </span>
          <input
            type="search"
            placeholder="Tìm kiếm theo tên khách hàng, chuyên gia..." 
            className="pl-10 pr-4 py-2 w-full sm:w-96 rounded-[16px] border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-fit">
          <div className="relative">
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
              className="appearance-none pl-3 pr-10 py-2 border border-gray-300 rounded-[16px] shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="in_progress">Đang tiến hành</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
            {/* Icon mũi tên bên phải */}
            <div className="pointer-events-none absolute top-1/2 right-3 transform -translate-y-1/2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                <button className="flex items-center group" onClick={() => handleSort('id')}>
                  ID {renderSortIcon('id')}
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-semibold tracking-wider">
                <button className="flex items-center group" onClick={() => handleSort('client_name')}>
                  Khách hàng {renderSortIcon('client_name')}
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-semibold tracking-wider">
                <button className="flex items-center group" onClick={() => handleSort('doctor_name')}>
                  Chuyên gia {renderSortIcon('doctor_name')}
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-semibold tracking-wider">
                <button className="flex items-center group" onClick={() => handleSort('service_name')}>
                  Dịch vụ {renderSortIcon('service_name')}
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-semibold tracking-wider">
                Tiến độ
              </th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-semibold tracking-wider">
                <button className="flex items-center group" onClick={() => handleSort('status')}>
                  Trạng thái {renderSortIcon('status')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedOrders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-gray-100 cursor-pointer"
                onClick={() => navigate(`/admin/consultations/${order.id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">#{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{order.client_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{order.doctor_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{order.service_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs">
                      {order.completed_sessions || 0}/{order.number_of_sessions}
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-400 h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${Math.min(((order.completed_sessions || 0) / order.number_of_sessions) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">
                      {Math.round(((order.completed_sessions || 0) / order.number_of_sessions) * 100)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="flex justify-between items-center mt-4 px-4 py-3 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-500">
          <select 
            className="border border-gray-300 rounded-md p-1 mr-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span>Hiển thị {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredAndSortedOrders.length)} trên {filteredAndSortedOrders.length} kết quả</span>
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
    </div>
  );
};

export default AdminConsultationsPage;