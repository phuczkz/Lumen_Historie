import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import doctorService, { Doctor } from '../api/doctorService';
import { LuArrowLeft, LuLoader, LuTriangleAlert, LuCircleUserRound, LuMail, LuPhone, LuBriefcase, LuCalendarDays, LuFileText } from 'react-icons/lu'; // Corrected icons
import { format } from 'date-fns';

const ExpertDetailPage: React.FC = () => {
  const { expertId } = useParams<{ expertId: string }>();
  const [expert, setExpert] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!expertId) {
      setError('ID chuyên gia không được cung cấp.');
      setLoading(false);
      return;
    }

    const fetchExpertDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const numericId = parseInt(expertId, 10);
        if (isNaN(numericId)) {
          setError('ID chuyên gia không hợp lệ.');
          setExpert(null);
          setLoading(false);
          return;
        }
        const data = await doctorService.getById(numericId);
        setExpert(data);
      } catch (err: any) {
        console.error('Error fetching expert details:', err);
        setError(err.response?.data?.message || 'Không thể tải thông tin chi tiết chuyên gia.');
        setExpert(null);
      } finally {
        setLoading(false);
      }
    };

    fetchExpertDetail();
  }, [expertId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LuLoader className="animate-spin h-12 w-12 text-green-600" />
        <p className="ml-3 text-lg text-gray-700">Đang tải thông tin chuyên gia...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <Link to="/chuyen-gia" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
            <LuArrowLeft className="mr-2 h-5 w-5" /> Quay lại danh sách chuyên gia
        </Link>
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 max-w-md mx-auto">
            <LuTriangleAlert className="h-12 w-12 text-red-500 mb-3 mx-auto" />
            <p className="text-xl font-semibold text-red-700">Lỗi</p>
            <p className="text-md text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!expert) {
    return (
        <div className="container mx-auto p-6 text-center">
            <Link to="/chuyen-gia" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
                <LuArrowLeft className="mr-2 h-5 w-5" /> Quay lại danh sách chuyên gia
            </Link>
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 max-w-md mx-auto">
                <LuTriangleAlert className="h-12 w-12 text-yellow-500 mb-3 mx-auto" /> {/* Or a different icon */}
                <p className="text-xl font-semibold text-yellow-700">Không tìm thấy chuyên gia</p>
                <p className="text-md text-yellow-600">Không có dữ liệu cho chuyên gia này.</p>
            </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */} 
        <div className="mb-6">
            <Link to="/chuyen-gia" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium group">
                <LuArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Quay lại danh sách chuyên gia
            </Link>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="md:flex">
            {/* Profile Picture Section */} 
            <div className="md:w-1/3 bg-gradient-to-br from-green-500 to-teal-600 p-6 flex flex-col items-center justify-center">
                {expert.profile_picture ? (
                    <img 
                        className="h-40 w-40 rounded-full object-cover ring-4 ring-white shadow-lg mx-auto"
                        src={expert.profile_picture}
                        alt={expert.full_name}
                    />
                    ) : (
                    <LuCircleUserRound className="h-40 w-40 text-white opacity-80 mx-auto" /> // Placeholder icon
                )}
                <h1 className="text-2xl font-bold text-white mt-4 text-center break-words">{expert.full_name}</h1>
                {expert.specialty && (
                    <p className="text-sm text-green-100 mt-1 text-center break-words">{expert.specialty}</p>
                )}
            </div>

            {/* Details Section */} 
            <div className="md:w-2/3 p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-3 flex items-center">
                    <LuCircleUserRound className="w-5 h-5 mr-2 text-green-600" /> Thông tin cơ bản
                </h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div className="sm:col-span-1">
                    <dt className="font-medium text-gray-500 flex items-center"><LuMail className="w-4 h-4 mr-2 text-gray-400"/>Email</dt>
                    <dd className="text-gray-800 break-all">{expert.email}</dd>
                  </div>
                  {expert.phone && (
                    <div className="sm:col-span-1">
                        <dt className="font-medium text-gray-500 flex items-center"><LuPhone className="w-4 h-4 mr-2 text-gray-400"/>Điện thoại</dt>
                        <dd className="text-gray-800">{expert.phone}</dd>
                    </div>
                  )}
                  <div className="sm:col-span-1">
                    <dt className="font-medium text-gray-500 flex items-center"><LuBriefcase className="w-4 h-4 mr-2 text-gray-400"/>Trạng thái</dt>
                    <dd className={`font-semibold ${expert.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                        {expert.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
                    </dd>
                  </div>
                  {expert.created_at && (
                     <div className="sm:col-span-1">
                        <dt className="font-medium text-gray-500 flex items-center"><LuCalendarDays className="w-4 h-4 mr-2 text-gray-400"/>Ngày tham gia</dt>
                        <dd className="text-gray-800">{format(new Date(expert.created_at), 'dd/MM/yyyy')}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {expert.bio && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-3 flex items-center">
                    <LuFileText className="w-5 h-5 mr-2 text-green-600" /> Tiểu sử
                  </h2>
                  <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                    {expert.bio}
                  </p>
                </div>
              )}
              
              {/* Placeholder for other sections like Services, Degrees, Experiences if added later */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertDetailPage; 