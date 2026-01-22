import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { LuImage, LuPlus, LuTrash2, LuCircleUserRound, LuUser, LuMail, LuPhone, LuBookmark, LuFileText, LuMapPin, LuGraduationCap, LuCalendar, LuMapPinned } from 'react-icons/lu';
import uploadFileApi from '../api/uploadFileApi';
import { DoctorQualification, DoctorExperience } from '../api/doctorService';

// Updated interface to align with Doctor backend fields
export interface ExpertFormData {
  id?: number; // ID from backend, not manually entered for create
  full_name: string;
  email: string;
  phone?: string | null;
  specialty?: string | null;
  bio?: string | null;
  profile_picture?: string | null; // URL of the uploaded picture
  status: 'active' | 'inactive';
  address?: string | null;
  qualifications?: DoctorQualification[];
  experiences?: DoctorExperience[];
  // department_id?: number | null; // Keeping this out for now for simplicity
}

interface AdminExpertFormProps {
  onSubmit: (data: ExpertFormData) => void;
  initialData?: Partial<ExpertFormData> | null; // For edit mode
  isEditMode: boolean;
}

const AdminExpertForm: React.FC<AdminExpertFormProps> = ({ onSubmit, initialData, isEditMode }) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ExpertFormData>({
    defaultValues: initialData || {
      full_name: '',
      email: '',
      phone: '',
      specialty: '',
      bio: '',
      profile_picture: null,
      status: 'active',
      address: '',
      qualifications: [],
      experiences: [],
    },
  });

  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(initialData?.profile_picture || null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [qualificationsList, setQualificationsList] = useState<DoctorQualification[]>(
    initialData?.qualifications || []
  );
  const [experiencesList, setExperiencesList] = useState<DoctorExperience[]>(
    initialData?.experiences || []
  );

  const currentProfilePictureUrl = watch('profile_picture');

  useEffect(() => {
    if (initialData) {
      console.log('AdminExpertForm - Received initialData:', initialData);
      const resetData: Partial<ExpertFormData> = {
        ...initialData,
        full_name: initialData.full_name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        specialty: initialData.specialty || '',
        bio: initialData.bio || '',
        profile_picture: initialData.profile_picture || null,
        status: initialData.status || 'active',
        address: initialData.address || '',
        qualifications: initialData.qualifications || [],
        experiences: initialData.experiences || [],
      };
      console.log('AdminExpertForm - Reset data:', resetData);
      console.log('AdminExpertForm - Qualifications:', resetData.qualifications);
      console.log('AdminExpertForm - Experiences:', resetData.experiences);
      reset(resetData as ExpertFormData);
      setProfilePicturePreview(initialData.profile_picture || null);
      setQualificationsList(initialData.qualifications || []);
      setExperiencesList(initialData.experiences || []);
    } else {
      console.log('AdminExpertForm - No initialData, using defaults');
      reset({
        full_name: '',
        email: '',
        phone: '',
        specialty: '',
        bio: '',
        profile_picture: null,
        status: 'active',
        address: '',
        qualifications: [],
        experiences: [],
        id: undefined,
      });
      setProfilePicturePreview(null);
      setQualificationsList([]);
      setExperiencesList([]);
    }
  }, [initialData, reset]);

  useEffect(() => {
    if (currentProfilePictureUrl && currentProfilePictureUrl !== profilePicturePreview) {
      setProfilePicturePreview(currentProfilePictureUrl);
    }
  }, [currentProfilePictureUrl, profilePicturePreview]);

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setUploadingPicture(true);
      const tempPreviewUrl = URL.createObjectURL(file);
      setProfilePicturePreview(tempPreviewUrl);

      try {
        const uploadEvent = { target: event.target } as unknown as React.ChangeEvent<HTMLInputElement>;
        const downloadURL = await uploadFileApi.uploadFile(uploadEvent);
        setValue("profile_picture", downloadURL, { shouldValidate: true });
        setProfilePicturePreview(downloadURL);
        if (tempPreviewUrl !== downloadURL) URL.revokeObjectURL(tempPreviewUrl);
      } catch (error) {
        console.error("Profile picture upload failed:", error);
        setValue("profile_picture", initialData?.profile_picture || null);
        setProfilePicturePreview(initialData?.profile_picture || null);
        alert('Lỗi tải ảnh lên. Vui lòng thử lại.');
        URL.revokeObjectURL(tempPreviewUrl);
      } finally {
        setUploadingPicture(false);
      }
    }
  };

  // Qualifications management
  const addQualification = () => {
    const newQualification: DoctorQualification = {
      degree: '',
      major: '',
      completion_year: new Date().getFullYear(),
      institution: ''
    };
    setQualificationsList([...qualificationsList, newQualification]);
  };

  const removeQualification = (index: number) => {
    const newList = qualificationsList.filter((_, i) => i !== index);
    setQualificationsList(newList);
  };

  const updateQualification = (index: number, field: keyof DoctorQualification, value: string | number) => {
    const newList = [...qualificationsList];
    newList[index] = { ...newList[index], [field]: value };
    setQualificationsList(newList);
  };

  // Experiences management
  const addExperience = () => {
    const newExperience: DoctorExperience = {
      position: '',
      start_date: '',
      end_date: null,
      workplace: '',
      description: ''
    };
    setExperiencesList([...experiencesList, newExperience]);
  };

  const removeExperience = (index: number) => {
    const newList = experiencesList.filter((_, i) => i !== index);
    setExperiencesList(newList);
  };

  const updateExperience = (index: number, field: keyof DoctorExperience, value: string | null) => {
    const newList = [...experiencesList];
    
    // If updating date fields, ensure proper format
    if ((field === 'start_date' || field === 'end_date') && value) {
      // Convert to YYYY-MM-DD format if needed
      const dateValue = value.includes('T') ? value.split('T')[0] : value;
      newList[index] = { ...newList[index], [field]: dateValue };
    } else {
      newList[index] = { ...newList[index], [field]: value };
    }
    
    setExperiencesList(newList);
  };

  // Helper function to format date for input
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
      // If it's already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      // Convert ISO string to YYYY-MM-DD
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const handleFormSubmit = (data: ExpertFormData) => {
    console.log("Expert Form Data Submitted:", data);
    console.log("Qualifications List State:", qualificationsList);
    console.log("Experiences List State:", experiencesList);
    
    if (uploadingPicture) {
        alert("Vui lòng đợi ảnh tải lên hoàn tất.");
        return;
    }
    const payload = {
      ...data,
      qualifications: qualificationsList,
      experiences: experiencesList,
    };
    console.log("Final Payload:", payload);
    console.log("Final Payload Experiences:", payload.experiences);
    
    const finalPayload = isEditMode ? payload : { ...payload, id: undefined };
    onSubmit(finalPayload);
  };

  return (
    <div className="bg-white rounded-[16px] shadow-sm border">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="p-8 space-y-6">
        {/* Avatar and Basic Info Section */}
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center relative overflow-hidden group bg-gray-50">
              {profilePicturePreview ? (
                <img src={profilePicturePreview} alt="Preview" className="w-full h-full object-cover rounded-full" />
              ) : (
                <LuCircleUserRound className="w-16 h-16 text-gray-400" /> 
              )}
               <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleProfilePictureUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="profile_picture_upload"
                  disabled={uploadingPicture}
                />
               <label htmlFor="profile_picture_upload" className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-opacity cursor-pointer ${uploadingPicture ? 'cursor-not-allowed' : ''}`}>
                  {!uploadingPicture && <LuImage className="text-white w-6 h-6 opacity-0 group-hover:opacity-100" />}
               </label>
            </div>
            {uploadingPicture && <p className='text-xs text-blue-600'>Đang tải ảnh...</p>}
            <input type="hidden" {...register("profile_picture")} />
          </div>

          {/* ID and Name */}
          <div className="flex-1 space-y-4">
            {isEditMode && initialData?.id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                <input 
                  type="text" 
                  value={`DB-001`} 
                  readOnly 
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 text-sm cursor-not-allowed"
                />
              </div>
            )}

            <div>
              <label htmlFor="full_name" className="block text-md font-medium mb-1">Họ và tên</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LuUser className="h-4 w-4 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  id="full_name" 
                  {...register("full_name", { required: 'Họ và tên là bắt buộc' })} 
                  className={`w-full pl-10 pr-3 py-2 border ${errors.full_name ? 'border-red-500' : 'border-gray-300'} rounded-[16px] shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`} 
                  placeholder="Nhập họ và tên chuyên gia"
                />
              </div>
              {errors.full_name && <p className="text-xs text-red-600 mt-1">{errors.full_name.message}</p>}
            </div>



            <div>
              <label className="block text-md font-medium mb-1">Mô tả</label>
              <textarea 
                {...register("bio")} 
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-[16px] shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm resize-none" 
                placeholder="Mô tả ngắn về chuyên gia..."
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          {/* <h3 className="text-lg font-medium mb-4">Thông tin liên hệ</h3> */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="email" className="block text-md font-semibold mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LuMail className="h-4 w-4 text-gray-400" />
                </div>
                <input 
                  type="email" 
                  id="email"
                  {...register("email", { 
                    required: 'Email là bắt buộc', 
                    pattern: { value: /^\S+@\S+$/i, message: 'Định dạng email không hợp lệ' }
                  })} 
                  className={`w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-[16px] shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`} 
                  placeholder="Nhập email"
                />
              </div>
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
            </div>

            {/* Số điện thoại */}
            <div>
              <label htmlFor="phone" className="block text-md font-semibold mb-1">Số điện thoại</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LuPhone className="h-4 w-4 text-gray-400" />
                </div>
                <input 
                  type="tel" 
                  id="phone"
                  {...register("phone")} 
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-[16px] shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
                  placeholder="09..."
                />
              </div>
            </div>

            {/* Địa chỉ */}
            <div>
              <label htmlFor="address" className="block text-md font-semibold mb-1">Địa chỉ</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LuMapPinned className="h-4 w-4 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  id="address"
                  {...register("address")} 
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-[16px] shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
                  placeholder="Nhập địa chỉ"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Bằng cấp */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Bằng cấp</h3>
            <button 
              type="button" 
              onClick={addQualification}
              className="flex items-center text-sm text-green-600 hover:text-green-700 font-semibold"
            >
              <LuPlus className="w-4 h-4 mr-1" />
              Thêm bằng cấp
            </button>
          </div>
          <div className="space-y-4">
            {qualificationsList.map((qualification, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-[16px]">
                <div>
                  <label className="block text-sm font-medium mb-1">Học vị</label>
                  <input 
                    type="text" 
                    value={qualification.degree}
                    onChange={(e) => updateQualification(index, 'degree', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-[16px] shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
                    placeholder="Cử nhân, Thạc sĩ, Tiến sĩ..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Chuyên ngành</label>
                  <input 
                    type="text" 
                    value={qualification.major}
                    onChange={(e) => updateQualification(index, 'major', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-[16px] shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
                    placeholder="Tâm lý học..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Năm hoàn thành</label>
                  <input 
                    type="number" 
                    value={qualification.completion_year}
                    onChange={(e) => updateQualification(index, 'completion_year', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-[16px] shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
                    placeholder="2020"
                    min="1950"
                    max={new Date().getFullYear()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Đơn vị đào tạo</label>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      value={qualification.institution}
                      onChange={(e) => updateQualification(index, 'institution', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-[16px] shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
                      placeholder="Trường Đại học..."
                    />
                    <button 
                      type="button" 
                      onClick={() => removeQualification(index)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <LuTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {qualificationsList.length === 0 && (
              <div className="text-sm text-gray-500 italic text-center py-4">Chưa có bằng cấp nào được thêm</div>
            )}
          </div>
        </div>

        {/* Kinh nghiệm */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Kinh nghiệm</h3>
            <button 
              type="button" 
              onClick={addExperience}
              className="flex items-center text-sm text-green-600 hover:text-green-700 font-semibold"
            >
              <LuPlus className="w-4 h-4 mr-1" />
              Thêm kinh nghiệm
            </button>
          </div>
          <div className="space-y-4">
            {experiencesList.map((experience, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-[16px]">
                <div>
                  <label className="block text-sm font-medium mb-1">Vị trí</label>
                  <input 
                    type="text" 
                    value={experience.position}
                    onChange={(e) => updateExperience(index, 'position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-[16px] shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
                    placeholder="Tâm lý học đường"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Thời gian bắt đầu</label>
                  <input 
                    type="date" 
                    value={formatDateForInput(experience.start_date)}
                    onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-[16px] shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian kết thúc</label>
                  <input 
                    type="date" 
                    value={formatDateForInput(experience.end_date)}
                    onChange={(e) => updateExperience(index, 'end_date', e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-[16px] shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
                    placeholder="Để trống nếu đang làm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Đơn vị công tác</label>
                  <input 
                    type="text" 
                    value={experience.workplace}
                    onChange={(e) => updateExperience(index, 'workplace', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-[16px] shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
                    placeholder="Đơn vị công tác"
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    type="button" 
                    onClick={() => removeExperience(index)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <LuTrash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium mb-1">Mô tả công việc</label>
                  <textarea 
                    value={experience.description || ''}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-[16px] shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm resize-none" 
                    placeholder="Mô tả chi tiết về công việc..."
                  />
                </div>
              </div>
            ))}
            {experiencesList.length === 0 && (
              <div className="text-sm text-gray-500 italic text-center py-4">Chưa có kinh nghiệm nào được thêm</div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-3 pt-6 border-t">
          <button 
            type="button" 
            onClick={() => navigate('/admin/experts')} 
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-[16px] shadow-sm  font-medium text-sm"
            disabled={uploadingPicture}
          >
            Hủy
          </button>
          <button 
            type="submit" 
            className={`px-6 py-2 border border-transparent rounded-[16px] shadow-sm text-sm font-medium bg-green-100 hover:bg-green-200 ${uploadingPicture ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={uploadingPicture}
          >
            {uploadingPicture ? 'Đang xử lý...' : (isEditMode ? 'Lưu thay đổi' : 'Thêm Chuyên gia')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminExpertForm; 