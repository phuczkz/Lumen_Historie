import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  LuArrowLeft, LuMail, LuUser, LuCheck, LuX, LuCalendarDays,
  LuCircleUserRound, LuShieldQuestion, LuExternalLink, LuFilePenLine as LuEdit, LuTrash2,
  LuPhone, LuCake, LuUsers
} from 'react-icons/lu';
import clientService, { Client } from '../../api/clientService';
import { format } from 'date-fns';

const AdminCustomerDetailPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setError('Không tìm thấy ID khách hàng.');
      setLoading(false);
      return;
    }

    const fetchCustomer = async () => {
      setLoading(true);
      setError(null);
      try {
        const numericCustomerId = parseInt(customerId, 10);
        if (isNaN(numericCustomerId)) {
          setError('ID khách hàng không hợp lệ.');
          setCustomer(null);
          return;
        }
        const data = await clientService.getById(numericCustomerId);
        setCustomer(data);
      } catch (err: any) {
        console.error('Error fetching customer details:', err);
        setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tải dữ liệu khách hàng.');
        setCustomer(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId]);

  const handleDeleteClient = async () => {
    if (!customer || !customer.id) return;
    const clientIdentifier = customer.full_name || `ID C-${customer.id}`;
    if (window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${clientIdentifier}" không? Thao tác này không thể hoàn tác.`)) {
      try {
        await clientService.delete(customer.id);
        alert(`Đã xóa khách hàng "${clientIdentifier}".`);
        navigate('/admin/customers');
      } catch (err: any) {
        console.error('Failed to delete client:', err);
        const deleteError = err.response?.data?.message || 'Không thể xóa khách hàng. Vui lòng thử lại.';
        setError(deleteError);
        alert(`Lỗi khi xóa: ${deleteError}`);
      }
    }
  };

  if (loading) return <div className="p-6 text-center">Đang tải thông tin khách hàng...</div>;
  if (error) return <div className="p-6 text-center text-red-600 bg-red-50 py-4 rounded-md">{error}</div>;
  if (!customer) return <div className="p-6 text-center">Không tìm thấy thông tin khách hàng.</div>;

  return (
    <div className="min-h-screen bg-background rounded-[16px]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <button onClick={() => navigate('/admin/customers')} className="flex items-center text-sm text-gray-600 hover:text-gray-900">
          <LuArrowLeft className="mr-2 h-4 w-4" />
          Quay lại Danh sách Khách hàng
        </button>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigate(`/admin/customers/${customer.id}/edit`)}
            className="flex items-center bg-yellow-500 text-white px-3 py-2 rounded-md hover:bg-yellow-600 transition-colors text-sm font-medium"
          >
            <LuEdit className="mr-1.5 h-4 w-4" />
            Chỉnh sửa
          </button>
          <button
            onClick={handleDeleteClient}
            className="flex items-center bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
          >
            <LuTrash2 className="mr-1.5 h-4 w-4" />
            Xóa
          </button>
        </div>
      </div>


      <div className="bg-white p-6 rounded-[16px] border border-gray-200">
        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-6">
          <div className="flex-shrink-0 mb-4 md:mb-0">
            {customer.avatar_url ? (
              <img className="h-32 w-32 rounded-full object-cover shadow-md" src={customer.avatar_url} alt={customer.full_name || 'Avatar'} />
            ) : (
              <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center shadow-md">
                <LuCircleUserRound className="h-20 w-20 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">{customer.full_name || 'Chưa cập nhật tên'}</h1>
            <p className="text-sm text-gray-500 mb-3">ID Khách hàng: C-{customer.id}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div className="flex items-center">
                <LuMail className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                <span className="text-gray-700 break-all">{customer.email}</span>
              </div>
              <div className="flex items-center">
                {customer.status === 'active' ? 
                  <LuCheck className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" /> : 
                  <LuX className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
                }
                <span className={`font-medium ${customer.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  {customer.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                </span>
              </div>
              {customer.phone && (
                <div className="flex items-center">
                  <LuPhone className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700">{customer.phone}</span>
                </div>
              )}
              {customer.birth_date && (
                <div className="flex items-center">
                  <LuCake className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700">
                    Sinh: {format(new Date(customer.birth_date), 'dd/MM/yyyy')}
                  </span>
                </div>
              )}
              {customer.gender && (
                <div className="flex items-center">
                  <LuUsers className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700">
                    {customer.gender === 'male' ? 'Nam' : customer.gender === 'female' ? 'Nữ' : 'Khác'}
                  </span>
                </div>
              )}
              {customer.google_id && (
                <div className="flex items-center sm:col-span-2">
                  <LuShieldQuestion className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700">Google ID: {customer.google_id}</span>
                </div>
              )}
              {customer.created_at && (
                <div className="flex items-center">
                  <LuCalendarDays className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700">
                    Ngày tạo: {format(new Date(customer.created_at), 'dd/MM/yyyy HH:mm')}
                  </span>
                </div>
              )}
              {customer.updated_at && (
                <div className="flex items-center">
                  <LuCalendarDays className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700">
                    Cập nhật: {format(new Date(customer.updated_at), 'dd/MM/yyyy HH:mm')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomerDetailPage; 