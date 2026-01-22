import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuSearch, LuArrowUpDown, LuCircleUserRound, LuEye, LuTrash2, LuPlus, LuFilePenLine } from 'react-icons/lu';
import clientService, { Client } from '../../api/clientService';

const AdminCustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalClients, setTotalClients] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{key: keyof Client; direction: 'asc' | 'desc'} | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let fetchedClients: Client[];
      if (searchTerm.trim() !== '') {
        fetchedClients = await clientService.search(searchTerm.trim());
      } else {
        fetchedClients = await clientService.getAll();
      }
      setClients(fetchedClients);
      setTotalClients(fetchedClients.length);
    } catch (err: any) {
      console.error('Failed to fetch clients:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách khách hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchClients();
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [fetchClients]);

  const handleDeleteClient = async (clientId: number, clientName?: string) => {
    const clientIdentifier = clientName || `ID C-${clientId}`;
    if (window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${clientIdentifier}" không? Thao tác này không thể hoàn tác.`)) {
      try {
        await clientService.delete(clientId);
        setClients(prevClients => prevClients.filter(client => client.id !== clientId));
        setTotalClients(prevTotal => prevTotal - 1);
        alert(`Đã xóa khách hàng "${clientIdentifier}".`);
      } catch (err: any) {
        console.error('Failed to delete client:', err);
        const deleteError = err.response?.data?.message || 'Không thể xóa khách hàng. Vui lòng thử lại.';
        setError(deleteError);
        alert(`Lỗi khi xóa: ${deleteError}`);
      }
    }
  };

  const handleSort = (key: keyof Client) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedClients = useMemo(() => {
    let result = [...clients];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(client =>
        client.full_name?.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower) ||
        client.phone?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(client => client.status === statusFilter);
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
  }, [clients, searchTerm, statusFilter, sortConfig]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedClients.length / itemsPerPage);
  const paginatedClients = filteredAndSortedClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading && clients.length === 0) {
    return <div className="p-6 text-center text-gray-600">Đang tải danh sách khách hàng...</div>;
  }

  if (error && clients.length === 0) {
    return <div className="p-6 text-center text-red-600 bg-red-50 py-4 rounded-md">{error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-[16px] shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Nhóm: tìm kiếm + nút thêm */}
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <button 
            onClick={() => navigate('/admin/customers/add')}
            className="flex-shrink-0 flex items-center bg-green-100 px-4 py-2 rounded-[16px] hover:bg-green-200 transition-colors text-sm font-medium"
          >
            <LuPlus className="mr-2 h-4 w-4" />
            Thêm Khách hàng
          </button>
          
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <LuSearch className="h-5 w-5 text-gray-400" />
            </span>
            <input
              type="search"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..." 
              className="pl-10 pr-4 py-2 w-full rounded-[16px] border border-gray-300 bg-white text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className='relative'>
          {/* Bộ lọc trạng thái đẩy sang phải */}
          <select
            className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-[16px] text-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ml-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
          <div className="pointer-events-none absolute top-1/2 right-3 transform -translate-y-1/2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>  

      </div>

      {error && clients.length > 0 && (
        <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 ">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-black uppercase tracking-wider">
                <button className="flex items-center group" onClick={() => handleSort('id')}>
                  ID <LuArrowUpDown className={`ml-1 h-3 w-3 ${sortConfig?.key === 'id' ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}`} />
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-black uppercase tracking-wider">
                <button className="flex items-center group" onClick={() => handleSort('full_name')}>
                  Họ và Tên <LuArrowUpDown className={`ml-1 h-3 w-3 ${sortConfig?.key === 'full_name' ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}`} />
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-black uppercase tracking-wider">
                <button className="flex items-center group" onClick={() => handleSort('email')}>
                  Email <LuArrowUpDown className={`ml-1 h-3 w-3 ${sortConfig?.key === 'email' ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}`} />
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-black uppercase tracking-wider">
                <button className="flex items-center group" onClick={() => handleSort('phone')}>
                  Số điện thoại <LuArrowUpDown className={`ml-1 h-3 w-3 ${sortConfig?.key === 'phone' ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}`} />
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-black tracking-wider">
                Giới tính
              </th>
              <th scope="col" className="px-6 py-3 text-center text-sm font-semibold text-black uppercase tracking-wider">
                <button className="flex items-center justify-center group mx-auto" onClick={() => handleSort('status')}>
                  Trạng thái <LuArrowUpDown className={`ml-1 h-3 w-3 ${sortConfig?.key === 'status' ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}`} />
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-center text-sm font-semibold text-blacktracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedClients.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                  {searchTerm ? 'Không tìm thấy khách hàng nào phù hợp.' : 'Chưa có khách hàng nào.'}
                </td>
              </tr>
            )}
            {paginatedClients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">C-{client.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 mr-3">
                      {client.avatar_url ? (
                        <img className="h-8 w-8 rounded-full object-cover" src={client.avatar_url} alt={client.full_name || 'Avatar'} />
                      ) : (
                        <LuCircleUserRound className="h-8 w-8 text-black" />
                      )}
                    </div>
                    {client.full_name || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{client.email}</td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{client.phone || 'N/A'}</td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                  {client.gender === 'male' ? 'Nam' : client.gender === 'female' ? 'Nữ' : client.gender || 'Không rõ'}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {client.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-2">
                  <Link 
                    to={`/admin/customers/${client.id}`} 
                    className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition-colors inline-flex items-center"
                    title="Xem chi tiết"
                  >
                    <LuEye className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => navigate(`/admin/customers/${client.id}/edit`)}
                    className="text-yellow-600 hover:text-yellow-800 p-1 rounded hover:bg-yellow-100 transition-colors inline-flex items-center"
                    title="Chỉnh sửa"
                  >
                    <LuFilePenLine className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClient(client.id, client.full_name || undefined)}
                    className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 transition-colors inline-flex items-center"
                    title="Xóa"
                  >
                    <LuTrash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalClients > 0 && (
        <div className="flex justify-between items-center mt-4 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-500">
            <select 
              value={itemsPerPage} 
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md p-1 mr-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span>Hiển thị {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredAndSortedClients.length)} trên {filteredAndSortedClients.length} kết quả</span>
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

export default AdminCustomersPage;