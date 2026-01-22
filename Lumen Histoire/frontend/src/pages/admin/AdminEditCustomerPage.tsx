import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import clientService, { Client, ClientUpdatePayload } from '../../api/clientService';
import AdminCustomerForm from '../../components/AdminCustomerForm'; // Corrected path
import { LuArrowLeft } from 'react-icons/lu';

const AdminEditCustomerPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setError('ID khách hàng không hợp lệ.');
      setLoading(false);
      return;
    }

    const fetchCustomer = async () => {
      setLoading(true);
      setError(null);
      try {
        const numericId = parseInt(customerId, 10);
        if (isNaN(numericId)) {
          setError('ID khách hàng không hợp lệ.');
          setInitialData(null);
          return;
        }
        const data = await clientService.getById(numericId);
        setInitialData(data);
      } catch (err: any) {
        console.error('Failed to fetch customer:', err);
        setError(err.response?.data?.message || 'Không thể tải thông tin khách hàng.');
        setInitialData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId]);

  const handleSubmit = async (formData: ClientUpdatePayload) => {
    if (!customerId) {
      setFormError('ID khách hàng không hợp lệ.');
      return;
    }
    setFormError(null);
    try {
      const numericId = parseInt(customerId, 10);
      // Ensure all fields in ClientUpdatePayload are present, even if undefined
      const payload: ClientUpdatePayload = {
        email: formData.email,
        full_name: formData.full_name,
        avatar_url: formData.avatar_url,
        phone: formData.phone,
        birth_date: formData.birth_date,
        gender: formData.gender,
        status: formData.status,
      };
      await clientService.update(numericId, payload);
      // TODO: Add success toast notification
      alert('Đã cập nhật thông tin khách hàng thành công!');
      navigate(`/admin/customers/${customerId}`); // Navigate to detail page
    } catch (err: any) {
      console.error('Failed to update customer:', err);
      const updateError = err.response?.data?.message || 'Không thể cập nhật khách hàng. Vui lòng thử lại.';
      setFormError(updateError);
      // TODO: Add error toast notification
      alert(`Lỗi cập nhật: ${updateError}`);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Đang tải biểu mẫu chỉnh sửa...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <button onClick={() => navigate('/admin/customers')} className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <LuArrowLeft className="mr-2 h-4 w-4" />
          Quay lại Danh sách Khách hàng
        </button>
        <div className="text-center text-red-600 bg-red-50 py-4 rounded-md">{error}</div>
      </div>
    );
  }

  if (!initialData) {
    return (
        <div className="p-6">
            <button onClick={() => navigate('/admin/customers')} className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <LuArrowLeft className="mr-2 h-4 w-4" />
            Quay lại Danh sách Khách hàng
            </button>
            <div className="p-6 text-center text-red-600">Không tìm thấy dữ liệu khách hàng để chỉnh sửa.</div>
        </div>
    );
  }
  
  // Map Client to ClientUpdatePayload for the form's initial data, handling potential nulls
  const formInitialData: ClientUpdatePayload = {
    email: initialData.email,
    full_name: initialData.full_name ?? undefined, // Ensure undefined if null
    avatar_url: initialData.avatar_url ?? undefined, // Ensure undefined if null
    phone: initialData.phone ?? undefined, // Ensure undefined if null
    birth_date: initialData.birth_date ?? undefined, // Ensure undefined if null
    gender: initialData.gender ?? undefined, // Ensure undefined if null
    status: initialData.status,
  };


  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Chỉnh sửa Khách hàng</h1>
        <button onClick={() => navigate(`/admin/customers/${customerId}`)} className="flex items-center text-sm text-blue-600 hover:text-blue-800">
          <LuArrowLeft className="mr-1 h-4 w-4" />
          Quay lại chi tiết
        </button>
      </div>
      
      <AdminCustomerForm
        onSubmit={handleSubmit}
        initialData={formInitialData}
        isEditMode={true}
        errorMessage={formError}
      />
    </div>
  );
};

export default AdminEditCustomerPage; 