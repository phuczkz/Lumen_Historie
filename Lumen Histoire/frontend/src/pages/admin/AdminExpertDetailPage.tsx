import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import doctorService, { Doctor } from '../../api/doctorService';
import appointmentService, { AppointmentWithClient } from '../../api/appointmentService';
import reviewService, { Review } from '../../api/reviewService';
import DoctorAvailabilityManager from '../../components/DoctorAvailabilityManager';
import { 
  LuArrowLeft, 
  LuLoader, 
  LuTriangleAlert, 
  LuCircleUserRound, 
  LuMail, 
  LuPhone, 
  LuMapPin, 
  LuCalendarDays, 
  LuClock,
  LuUser,
  LuStar,
  LuChevronRight,
  LuBadgeCheck,
  LuActivity,
  LuFilter,
  LuCalendarClock,
  LuBriefcase,
  LuGraduationCap
} from 'react-icons/lu';
import { format } from 'date-fns';

const AdminExpertDetailPage: React.FC = () => {
  const { expertId } = useParams<{ expertId: string }>();
  const navigate = useNavigate();
  const [expert, setExpert] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<AppointmentWithClient[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'consultation' | 'upcoming' | 'reviews' | 'schedule'>('consultation');

  useEffect(() => {
    if (!expertId) {
      setError('ID chuyên gia không được cung cấp.');
      setLoading(false);
      return;
    }

    const fetchExpertData = async () => {
      setLoading(true);
      setError(null);
      try {
        const numericId = parseInt(expertId, 10);
        if (isNaN(numericId)) {
          setError('ID chuyên gia không hợp lệ.');
          setLoading(false);
          return;
        }

        // Fetch expert details, appointments, and reviews in parallel
        const [expertData, appointmentsData, reviewsData] = await Promise.all([
          doctorService.getById(numericId),
          appointmentService.getAppointmentsByDoctorId(numericId, 1, 20),
          reviewService.getByDoctorId(numericId)
        ]);

        setExpert(expertData);
        setAppointments(appointmentsData.appointments);
        setReviews(reviewsData);
      } catch (err: any) {
        console.error('Error fetching expert data:', err);
        setError(err.response?.data?.message || 'Không thể tải thông tin chi tiết chuyên gia.');
      } finally {
        setLoading(false);
      }
    };

    fetchExpertData();
  }, [expertId]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm');
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm - dd/MM/yyyy');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'confirmed': return 'Đã xác nhận';
      case 'pending': return 'Chờ xác nhận';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <LuStar 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const completedAppointments = appointments.filter(apt => apt.status === 'completed');
  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'confirmed' || apt.status === 'pending'
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)] p-6">
        <div className="text-center">
          <LuLoader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700 font-medium">Đang tải thông tin chuyên gia...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Link to="/admin/experts" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <LuArrowLeft className="mr-2 h-5 w-5" /> Quay lại danh sách
        </Link>
        <div className="bg-red-50 p-6 rounded-xl border border-red-200 max-w-xl mx-auto text-center">
          <LuTriangleAlert className="h-12 w-12 text-red-500 mb-3 mx-auto" />
          <p className="font-semibold text-red-700 text-lg">Lỗi</p>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="p-6">
        <Link to="/admin/experts" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <LuArrowLeft className="mr-2 h-5 w-5" /> Quay lại danh sách
        </Link>
        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 max-w-xl mx-auto text-center">
          <LuTriangleAlert className="h-12 w-12 text-yellow-500 mb-3 mx-auto" />
          <p className="font-semibold text-yellow-700 text-lg">Không tìm thấy chuyên gia</p>
          <p className="text-sm text-yellow-600 mt-1">Không có dữ liệu cho chuyên gia này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background rounded-[16px]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <Link to="/admin/experts" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium group">
            <LuArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Quay lại danh sách chuyên gia
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-[16px] border border-gray-1 overflow-hidden mb-6">
          <div className="bg-white px-6 py-8">

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-6 lg:space-y-0 lg:space-x-6">
              {/* Left: Avatar + Info */}
              <div className="flex items-start space-x-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {expert.profile_picture ? (
                    <img 
                      className="h-24 w-24 rounded-full object-cover ring-4 ring-white"
                      src={expert.profile_picture}
                      alt={expert.full_name}
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-white shadow-lg flex items-center justify-center ring-4 ring-white">
                      <LuCircleUserRound className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h1 className="text-2xl font-bold text-gray-900 mr-3">
                      {expert.full_name}
                    </h1>
                    {expert.id && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100">
                        <LuBadgeCheck className="h-4 w-4 mr-1" />
                        Mã: DB-{String(expert.id).padStart(3, '0')}
                      </span>
                    )}
                  </div>
                  {expert.bio && (
                    <p className="text-gray-700 text-sm leading-relaxed max-w-2xl">{expert.bio}</p>
                  )}
                </div>
              </div>

              {/* Contact box */}
              <div className="w-full lg:max-w-xs bg-background rounded-xl p-4 space-y-4">
                <div className="flex items-center space-x-3">
                  <LuMail className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Email</p>
                    <p className="text-sm text-gray-900">{expert.email || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <LuPhone className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Điện thoại</p>
                    <p className="text-sm text-gray-900">{expert.phone || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <LuMapPin className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Địa chỉ</p>
                    <p className="text-sm text-gray-900">{expert.address || 'Chưa cập nhật'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bằng cấp - Kinh nghiệm */}
            <div className="mt-6 border-t border-gray-300">
              <div className="flex flex-col lg:flex-row lg:space-x-6">               
                {/* Trình độ học vấn */}
                <div className="w-full lg:w-1/2 bg-white p-4 lg:mb-0">
                  <h4 className="text-md font-bold text-gray-800 mb-3">Trình độ học vấn</h4>
                  <div className="space-y-1.5">
                    {expert.qualifications && expert.qualifications.length > 0 ? (
                      expert.qualifications.map((q, index) => (
                        <div key={index} className="flex items-start space-x-3 mb-4">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <LuGraduationCap className="h-5 w-5" />
                          </div>
                          <div className="text-sm text-gray-700 space-y-0.5">
                            <p className="font-medium">
                              {q.degree}
                              {q.major && ` – ${q.major}`}
                            </p>
                            <p className="text-xs text-gray-600">
                              {[q.institution, q.completion_year].filter(Boolean).join(' – ')}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Chưa cập nhật</p>
                    )}
                  </div>
                </div>

                {/* Kinh nghiệm làm việc */}
                <div className="w-full lg:w-1/2 bg-white p-4">
                  <h4 className="text-md font-bold text-gray-800 mb-3">Kinh nghiệm làm việc</h4>
                  <div className="space-y-1.5">
                    {expert.experiences && expert.experiences.length > 0 ? (
                      expert.experiences.map((exp: any, index: number) => {
                        const start = new Date(exp.start_date);
                        const end = exp.end_date ? new Date(exp.end_date) : new Date();
                        const diffYears = Math.max(1, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365)));

                        return (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="p-3 bg-red-100 rounded-full">
                              <LuBriefcase className="h-4 w-4" />
                            </div>
                            <div className="text-sm text-gray-700 space-y-0.5">
                              <p className="font-medium">
                                {exp.position} – {exp.workplace}
                              </p>
                              <p className="text-gray-500 text-sm">{diffYears} năm kinh nghiệm</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-500">Chưa cập nhật</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-1">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('consultation')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium text-md transition-all duration-200 ${
                  activeTab === 'consultation'
                    ? 'bg-green-200'
                    : 'hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <LuActivity className="h-4 w-4" />
                  <span>Lịch sử tham vấn</span>
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                    {completedAppointments.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium text-md transition-all duration-200 ${
                  activeTab === 'upcoming'
                    ? 'bg-green-200'
                    : 'hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <LuCalendarDays className="h-4 w-4" />
                  <span>Sắp tới</span>
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                    {upcomingAppointments.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium text-md transition-all duration-200 ${
                  activeTab === 'reviews'
                    ? 'bg-green-200'
                    : 'hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <LuStar className="h-4 w-4" />
                  <span>Đánh giá khách hàng</span>
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                    {reviews.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium text-md transition-all duration-200 ${
                  activeTab === 'schedule'
                    ? 'bg-green-200'
                    : 'hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <LuCalendarClock className="h-4 w-4" />
                  <span>Lịch làm việc</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl border border-gray-100">

          {/* Tab Lịch sử tư vấn*/}
          {activeTab === 'consultation' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Hồ sơ tham vấn</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <LuFilter className="h-4 w-4 mr-1" />
                  <span>Tất cả {completedAppointments.length} buổi</span>
                </div>
              </div>

              {completedAppointments.length > 0 ? (
                <div className="space-y-4">
                  {completedAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-300 rounded-xl p-4 hover:bg-background transition-all duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-lg font-bold">
                              {appointment.service_title}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100">
                              Buổi {appointment.session_number}
                            </span> 
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 font-medium mb-1">Khách hàng</p>
                              <p className="text-sm text-gray-900 font-medium">{appointment.client_name}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium mb-1">Ngày & Giờ</p>
                              <p className="text-sm text-gray-900">{formatDateTime(appointment.scheduled_at)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium mb-1">Trạng thái</p>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                                {getStatusText(appointment.status)}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium mb-1">Số buổi đã tham vấn</p>
                              <p className="text-sm text-gray-900">{appointment.completed_sessions}/{appointment.number_of_sessions}</p>
                            </div>
                          </div>
                          {appointment.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-500 font-medium mb-1">Ghi chú</p>
                              <p className="text-sm text-gray-700">{appointment.notes}</p>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <LuCalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Chưa có lịch sử tham vấn nào</p>
                </div>
              )}
            </div>
          )}

          {/* Tab Lịch hẹn sắp tới*/}
          {activeTab === 'upcoming' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Lịch hẹn sắp tới</h2>
                <div className="flex items-center text-sm">
                  <LuClock className="h-4 w-4 mr-1" />
                  <span>{upcomingAppointments.length} cuộc hẹn</span>
                </div>
              </div>

              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-00 rounded-[16px] p-4 hover:background transition-all duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-lg font-bold">
                              {appointment.service_title}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100">
                              Buổi {appointment.session_number}
                            </span> 
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 font-medium mb-1">Khách hàng</p>
                              <p className="text-sm text-gray-900 font-medium">{appointment.client_name}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium mb-1">Ngày & Giờ</p>
                              <p className="text-sm text-gray-900 font-medium text-blue-600">{formatDateTime(appointment.scheduled_at)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium mb-1">Trạng thái</p>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                                {getStatusText(appointment.status)}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium mb-1">Tiến độ</p>
                              <p className="text-sm text-gray-900">{appointment.completed_sessions}/{appointment.number_of_sessions}</p>
                            </div>
                          </div>
                        </div>
                        <button className="ml-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <LuChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <LuClock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Không có lịch hẹn sắp tới</p>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Đánh giá của khách hàng</h2>
                <div className="flex items-center text-sm">
                  <LuUser className="h-4 w-4 mr-1" />
                  <span>{reviews.length} đánh giá</span>
                </div>
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-gray-300 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                            <LuUser className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">{review.client_name || review.customer_name}</h4>
                              <div className="flex items-center space-x-1 mt-1">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-md font-semibold">{review.service_name}</p>
                              <p className="text-sm">{formatDate(review.created_at || '')}</p>
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <LuStar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Chưa có đánh giá nào</p>
                </div>
              )}
            </div>
          )}

          {/* Tab Lịch làm việc*/}
          {activeTab === 'schedule' && (
            <div className="p-6">
              {/* Doctor Availability Manager */}
              <DoctorAvailabilityManager doctorId={expert.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminExpertDetailPage; 