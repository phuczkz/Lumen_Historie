import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminServiceForm, { ServiceFormData } from '../../components/AdminServiceForm';
import { LuArrowLeft } from 'react-icons/lu';
import medicalServiceService, { MedicalServiceCreatePayload, MedicalServiceCreationResponse } from '../../api/medicalServiceService';
import doctorService, { Doctor } from '../../api/doctorService';

interface ExpertOption {
  value: number;
  label: string;
}

const AdminAddServicePage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [availableExperts, setAvailableExperts] = useState<ExpertOption[]>([]);

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const experts = await doctorService.getAll();
        setAvailableExperts(experts.map(expert => ({
          value: expert.id,
          label: expert.full_name
        })));
      } catch (err) {
        console.error('Error fetching experts:', err);
        setSubmitError('Không thể tải danh sách chuyên gia.');
      }
    };

    fetchExperts();
  }, []);

  const handleCreateService = async (formData: ServiceFormData) => {
    const apiPayload: MedicalServiceCreatePayload = {
      name: formData.name,
      description: formData.description || null,
      price: formData.price as number,
      number_of_sessions: formData.number_of_sessions as number,
      article_content: formData.article_content || null,
      image: formData.image,
      doctor_ids: formData.doctor_ids
    };

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await medicalServiceService.create(apiPayload);
      console.log('Service created successfully:', response);
      alert(`Dịch vụ "${apiPayload.name}" đã được tạo thành công!`);
      navigate('/admin/services');
    } catch (err: any) {
      console.error('Error creating service:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Đã có lỗi xảy ra khi tạo dịch vụ.';
      setSubmitError(errorMessage);
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2">
        <LuArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </button>
      <h1 className="text-2xl font-semibold text-gray-800">Thêm Dịch vụ mới</h1>
      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Lỗi! </strong>
          <span className="block sm:inline">{submitError}</span>
        </div>
      )}
      <AdminServiceForm
        onSubmit={handleCreateService}
        isEditMode={false}
        availableExperts={availableExperts}
      />
      {isSubmitting && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-xl">
            <p className="text-gray-700">Đang tạo dịch vụ, vui lòng chờ...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAddServicePage;