import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminServiceForm, { ServiceFormData } from '../../components/AdminServiceForm';
import medicalServiceService, { MedicalServiceUpdatePayload } from '../../api/medicalServiceService';
import doctorService, { Doctor } from '../../api/doctorService';
import { LuArrowLeft } from 'react-icons/lu';

interface ExpertOption {
  value: number;
  label: string;
}

const AdminEditServicePage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<Partial<ServiceFormData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [availableExperts, setAvailableExperts] = useState<ExpertOption[]>([]);
  const [initialAssignedExperts, setInitialAssignedExperts] = useState<ExpertOption[]>([]);

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
        setError('Không thể tải danh sách chuyên gia.');
      }
    };

    fetchExperts();
  }, []);

  useEffect(() => {
    if (!serviceId) {
      setError('Không tìm thấy ID dịch vụ.');
      setLoading(false);
      return;
    }
    const idFromParam = parseInt(serviceId, 10);
    if (isNaN(idFromParam)) {
      setError('ID dịch vụ không hợp lệ.');
      setLoading(false);
      return;
    }

    setLoading(true);
    medicalServiceService.getById(idFromParam)
      .then(serviceApiResponse => {
        if (serviceApiResponse && typeof serviceApiResponse.id === 'number') {
          // Set initial form data
          setInitialData({
            id: String(serviceApiResponse.id),
            name: serviceApiResponse.name,
            description: serviceApiResponse.description || '',
            price: serviceApiResponse.price,
            number_of_sessions: serviceApiResponse.number_of_sessions,
            article_content: serviceApiResponse.article_content || '',
            image: serviceApiResponse.image,
            doctor_ids: serviceApiResponse.doctor_ids
          });

          // Set initial assigned experts
          if (serviceApiResponse.doctor_details && serviceApiResponse.doctor_details.length > 0) {
            const assignedExperts = serviceApiResponse.doctor_details.map(doctor => ({
              value: doctor.id,
              label: doctor.name
            }));
            setInitialAssignedExperts(assignedExperts);
          }
        } else {
          setError('Không tìm thấy thông tin chi tiết cho dịch vụ này.');
        }
      })
      .catch(err => {
        console.error('Error fetching service details for edit:', err);
        setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tải dữ liệu dịch vụ.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [serviceId]);

  const handleEditService = async (formData: ServiceFormData) => {
    if (!serviceId) {
      setSubmitError("ID dịch vụ không hợp lệ để cập nhật.");
      return;
    }
    const idToUpdate = parseInt(serviceId, 10);

    const apiPayload: MedicalServiceUpdatePayload = {
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
      const response = await medicalServiceService.update(idToUpdate, apiPayload);
      console.log('Service updated successfully:', response);
      alert(`Dịch vụ "${apiPayload.name}" đã được cập nhật thành công!`);
      navigate('/admin/services');
    } catch (err: any) {
      console.error('Error updating service:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Đã có lỗi xảy ra khi cập nhật dịch vụ.';
      setSubmitError(errorMessage);
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Đang tải dữ liệu dịch vụ...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  if (!initialData) {
    return <div className="p-6 text-center">Không có dữ liệu để chỉnh sửa.</div>;
  }

  return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2">
        <LuArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </button>
      <h1 className="text-2xl font-semibold text-gray-800">Chỉnh sửa Dịch vụ</h1>
      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Lỗi cập nhật! </strong>
          <span className="block sm:inline">{submitError}</span>
        </div>
      )}
      <AdminServiceForm
        onSubmit={handleEditService}
        isEditMode={true}
        initialData={initialData}
        availableExperts={availableExperts}
        initialAssignedExperts={initialAssignedExperts}
      />
      {isSubmitting && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-xl">
            <p className="text-gray-700">Đang cập nhật, vui lòng chờ...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEditServicePage;