import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminCustomerForm, { CustomerFormData } from '../../components/AdminCustomerForm';
import clientService, { ClientCreatePayload, ClientCreationResponse } from '../../api/clientService';
import { LuArrowLeft } from 'react-icons/lu';

const AdminAddCustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleAddCustomer = async (formData: CustomerFormData) => {
    // CustomerFormData includes id (optional), ClientCreatePayload does not.
    // We already ensure id is undefined in AdminCustomerForm when isEditMode is false.
    const apiPayload: ClientCreatePayload = {
      google_id: formData.google_id,
      email: formData.email,
      full_name: formData.full_name || null, // API expects null if empty
      avatar_url: formData.avatar_url || null, // API expects null if empty
      phone: formData.phone || null, // API expects null if empty
      birth_date: formData.birth_date || null, // API expects null if empty
      gender: formData.gender || null, // API expects null if empty
      status: formData.status, // Already 'active' | 'inactive'
    };

    console.log('Submitting new customer data to API:', apiPayload);
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response: ClientCreationResponse = await clientService.create(apiPayload);
      console.log('Customer created successfully:', response);
      alert(`Khách hàng "${response.full_name || response.email}" đã được tạo thành công!`);
      navigate('/admin/customers'); 
    } catch (error: any) {
      console.error('Error creating customer:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra khi thêm khách hàng.';
      setSubmitError(errorMessage);
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 w-full">

      <button 
        onClick={() => navigate('/admin/customers')} 
        className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-3 pt-2"
      >
        <LuArrowLeft className="mr-2 h-4 w-4" />
        Quay lại Danh sách Khách hàng
      </button>
      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Lỗi! </strong>
          <span className="block sm:inline">{submitError}</span>
        </div>
      )}
      <AdminCustomerForm 
        onSubmit={handleAddCustomer} 
        isEditMode={false} 
      />
      {isSubmitting && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-xl">
            <p className="text-gray-700">Đang xử lý, vui lòng chờ...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAddCustomerPage; 