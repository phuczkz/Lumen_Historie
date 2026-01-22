import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { LuArrowLeft, LuFilePenLine, LuTrash2, LuDollarSign, LuUsers, LuCalendar, LuHash, LuClock, LuStar } from 'react-icons/lu';
import medicalServiceService, { MedicalService } from '../../api/medicalServiceService';
import doctorService, { Doctor } from '../../api/doctorService';

const AdminServiceDetailPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<MedicalService | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) {
      setError('Không tìm thấy ID dịch vụ.');
      setLoading(false);
      return;
    }
    const id = parseInt(serviceId, 10);
    if (isNaN(id)) {
        setError('ID dịch vụ không hợp lệ.');
        setLoading(false);
        return;
    }

    setLoading(true);
    
    // Fetch service details and doctors in parallel
    Promise.all([
      medicalServiceService.getById(id),
      fetchServiceDoctors(id)
    ])
      .then(([serviceData, doctorsData]) => {
        if (serviceData) {
          setService(serviceData);
          setDoctors(doctorsData);
        } else {
          setError('Không tìm thấy thông tin chi tiết cho dịch vụ này.');
        }
      })
      .catch(err => {
        console.error('Error fetching service details:', err);
        setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tải dữ liệu dịch vụ.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [serviceId]);

  const fetchServiceDoctors = async (serviceId: number): Promise<Doctor[]> => {
    try {
      const serviceData = await medicalServiceService.getById(serviceId);
      if (serviceData?.doctor_ids && serviceData.doctor_ids.length > 0) {
        const doctorPromises = serviceData.doctor_ids.map(doctorId => 
          doctorService.getById(doctorId)
        );
        const doctorsData = await Promise.all(doctorPromises);
        return doctorsData.filter(Boolean); // Remove any null results
      }
      return [];
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return [];
    }
  };

  const handleDelete = async () => {
      if(service && window.confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${service.name}" không?`)) {
        try {
            await medicalServiceService.delete(service.id);
            console.log("Deleting service:", service.id);
            navigate('/admin/services');
        } catch (err: any) {
            console.error('Failed to delete service:', err);
            setError(err.response?.data?.message || 'Không thể xóa dịch vụ. Vui lòng thử lại.');
        }
      }
  }

  if (loading) {
    return <div className="p-6 text-center">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  if (!service) {
    return <div className="p-6 text-center">Không tìm thấy dịch vụ.</div>;
  }

  return (
    <div className="min-h-screen bg-background gray-200 rounded-[16px]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto py-4">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LuArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </button>
            <div className="flex items-center space-x-3">
               <button 
                 onClick={handleDelete}
                 className="flex items-center px-4 py-2 bg-gray-200 rounded-[16px] hover:bg-gray-300 transition-colors text-sm font-medium"
                 title="Xóa dịch vụ"
               >
                  <LuTrash2 className="w-4 h-4 mr-2" />
                  Xóa
               </button>
               <Link 
                 to={`/admin/services/${service.id}/edit`} 
                 className="flex items-center px-4 py-2 bg-red-200 rounded-[16px] hover:bg-red-300 transition-colors text-sm font-medium"
                 title="Chỉnh sửa dịch vụ"
               >
                 <LuFilePenLine className="w-4 h-4 mr-2" />
                 Chỉnh sửa
               </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Service Header */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <span className="bg-green-100 text-green-700 text-sm font-semibold px-4 py-2 rounded-full">
                {service.number_of_sessions} buổi
              </span>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              {service.name}
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {service.description}
            </p>
          </div>
        </div>

        {/* Service Image */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <img 
            src={service.image || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"}
            alt={service.name}
            className="w-full h-96 object-cover"
          />
        </div>

        {/* Chi tiết về dịch vụ */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Chi tiết về dịch vụ</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed">
              Cùng cấp một không gian an toàn và chuyên nghiệp dành cho bạn để tìm hiểu, giải tỏa cùng các phương pháp tâm lý, cảm xúc và quan hệ.
            </p>
            
            {service.article_content && (
              <div 
                className="text-gray-700 leading-relaxed mt-4"
                dangerouslySetInnerHTML={{ __html: service.article_content }}
              />
            )}
          </div>
        </div>

        {/* Quy trình tư vấn */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quy trình tư vấn</h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Đặt lịch hẹn tư vấn</h3>
                <p className="text-gray-600">Chọn thời gian phù hợp với lịch trình của bạn</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Tham gia buổi tư vấn</h3>
                <p className="text-gray-600">Tham gia {service.number_of_sessions} buổi tư vấn theo lịch đã đặt</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Nhận hỗ trợ liên tục</h3>
                <p className="text-gray-600">Được hỗ trợ và theo dõi tình trạng thường xuyên</p>
              </div>
            </div>
          </div>
        </div>

        {/* Đội ngũ chuyên gia */}
        {doctors.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Đội ngũ chuyên gia của chúng tôi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="text-center group">
                  <div className="relative mb-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mx-auto flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                      {doctor.profile_picture ? (
                        <img 
                          src={doctor.profile_picture} 
                          alt={doctor.full_name}
                          className="w-32 h-32 rounded-full object-cover"
                        />
                      ) : (
                        <LuUsers className="w-16 h-16 text-blue-600" />
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{doctor.full_name}</h3>
                  <p className="text-blue-600 font-medium mb-4">{doctor.specialty}</p>
                  
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center justify-center space-x-1">
                      <LuCalendar className="w-4 h-4" />
                      <span>{(doctor as any).years_of_experience || 0} năm kinh nghiệm</span>
                    </div>
                    
                    {doctor.qualifications && doctor.qualifications.length > 0 && (
                      <div>
                        <p className="font-medium text-gray-700 mb-2">Bằng cấp:</p>
                        {doctor.qualifications.slice(0, 2).map((qual, index) => (
                          <p key={index} className="text-xs leading-relaxed">
                            {qual.degree} - {qual.institution} ({qual.completion_year})
                          </p>
                        ))}
                        {doctor.qualifications.length > 2 && (
                          <p className="text-xs text-gray-500 mt-1">+{doctor.qualifications.length - 2} bằng cấp khác</p>
                        )}
                      </div>
                    )}
                    
                    {doctor.experiences && doctor.experiences.length > 0 && (
                      <div>
                        <p className="font-medium text-gray-700 mb-2">Kinh nghiệm:</p>
                        {doctor.experiences.slice(0, 1).map((exp, index) => (
                          <p key={index} className="text-xs leading-relaxed">
                            {exp.position} tại {exp.workplace}
                          </p>
                        ))}
                        {doctor.experiences.length > 1 && (
                          <p className="text-xs text-gray-500 mt-1">+{doctor.experiences.length - 1} kinh nghiệm khác</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Service Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LuDollarSign className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Giá dịch vụ</h3>
            <p className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('vi-VN').format(Number(service.price))} VNĐ
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LuHash className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Số buổi</h3>
            <p className="text-2xl font-bold text-blue-600">
              {service.number_of_sessions} buổi
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LuUsers className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Chuyên gia</h3>
            <p className="text-2xl font-bold text-purple-600">
              {doctors.length} người
            </p>
          </div>
        </div>

        {/* Service metadata */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Thông tin dịch vụ</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">ID dịch vụ:</span>
              <span className="font-medium">SV-{service.id.toString().padStart(3, '0')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ngày tạo:</span>
              <span className="font-medium">
                {service.created_at ? new Date(service.created_at).toLocaleDateString('vi-VN') : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cập nhật lần cuối:</span>
              <span className="font-medium">
                {service.updated_at ? new Date(service.updated_at).toLocaleDateString('vi-VN') : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminServiceDetailPage; 