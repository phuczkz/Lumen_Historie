import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import uploadFileApi from '../api/uploadFileApi'; // Import the upload API
import { LuCake, LuIdCard, LuMail, LuPhone, LuUser, LuUsers} from 'react-icons/lu';

// Interface cho dữ liệu form khách hàng
export interface CustomerFormData {
  id?: number; // Chỉ dùng cho edit mode
  google_id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  status: 'active' | 'inactive';
}

interface AdminCustomerFormProps {
  onSubmit: (data: CustomerFormData) => void;
  initialData?: Partial<CustomerFormData> | null;
  isEditMode: boolean;
  errorMessage?: string | null; // Added to match usage in AdminEditCustomerPage
  // Thêm các props khác nếu cần, ví dụ: danh sách các lựa chọn có sẵn
}

const AdminCustomerForm: React.FC<AdminCustomerFormProps> = ({ 
    onSubmit, 
    initialData, 
    isEditMode,
    errorMessage // Added to match usage
}) => {
  const navigate = useNavigate();
  const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm<CustomerFormData>({
    defaultValues: {
      google_id: initialData?.google_id || '',
      email: initialData?.email || '',
      full_name: initialData?.full_name || '',
      avatar_url: initialData?.avatar_url || '',
      phone: initialData?.phone || '',
      birth_date: initialData?.birth_date || '',
      gender: initialData?.gender || null,
      status: initialData?.status || 'active',
    }
  });

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatar_url || null);

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        google_id: initialData.google_id || '',
        email: initialData.email || '',
        full_name: initialData.full_name || '',
        avatar_url: initialData.avatar_url || '',
        phone: initialData.phone || '',
        birth_date: initialData.birth_date || '',
        gender: initialData.gender || null,
        status: initialData.status || 'active',
      });
      setAvatarPreview(initialData.avatar_url || null);
    } else {
      reset({
          google_id: '',
          email: '',
          full_name: '',
          avatar_url: '',
          phone: '',
          birth_date: '',
          gender: null,
          status: 'active',
          id: undefined // Đảm bảo ID không được gửi khi tạo mới
      });
      setAvatarPreview(null);
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data: CustomerFormData) => {
    // Loại bỏ ID nếu không phải edit mode để đảm bảo API create không nhận ID
    const payload = isEditMode ? data : { ...data, id: undefined }; 
    onSubmit(payload);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setUploadingAvatar(true);
      setAvatarPreview(URL.createObjectURL(file)); // Show preview immediately
      try {
        // Pass the event object directly as your API expects e.target.files
        const uploadEvent = { target: event.target } as unknown as React.ChangeEvent<HTMLInputElement>;
        const downloadURL = await uploadFileApi.uploadFile(uploadEvent);
        setValue("avatar_url", downloadURL, { shouldValidate: true });
        setAvatarPreview(downloadURL); // Update preview with actual URL
      } catch (error) {
        console.error("Avatar upload failed:", error);
        // Optionally, reset avatar_url or show an error to the user
        setValue("avatar_url", initialData?.avatar_url || ''); // Revert to initial or empty
        setAvatarPreview(initialData?.avatar_url || null); // Revert preview
        // TODO: Show error to user
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-white p-6 rounded-[16px] shadow-sm space-y-5 border ">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {isEditMode ? 'Chỉnh sửa Thông tin Khách hàng' : 'Thêm Khách hàng Mới'}
      </h2>

      {isEditMode && initialData?.id && (
        
        <div className="mb-4">
            <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-1">ID Khách hàng</label>
            <input 
                type="text" 
                id="customerId" 
                value={`C-${initialData.id}`} 
                readOnly 
                className="w-full px-3 py-2 border border-gray-300 rounded-[16px] shadow-sm bg-gray-100 text-gray-500 text-sm cursor-not-allowed"
            />
        </div>
       )}

      <div className="flex flex-col md:flex-row md:items-center md:gap-7">
        {/* Avatar Upload */}
        <div className="flex-shrink-0">
          <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện</label>
          <div className="mt-1 flex items-center space-x-4">
            {avatarPreview ? (
              <img 
                src={avatarPreview} 
                alt="Avatar preview" 
                className="w-16 h-16 rounded-full object-cover border border-gray-300"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                Preview
              </div>
            )}
            <input
              type="file"
              id="avatar_file_upload"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="block text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-green-50 file:text-green-700
                        hover:file:bg-green-100"
            />
            <input type="hidden" {...register("avatar_url")} />
          </div>
          {uploadingAvatar && <p className="text-xs text-blue-600 mt-1">Đang tải ảnh lên...</p>}
          {errors.avatar_url && <p className="text-xs text-red-600 mt-1">{errors.avatar_url.message}</p>}
        </div>

        {/* Họ và Tên */}
        <div className="md:mt-0 w-full">
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">Họ và Tên</label>
          <div className="relative">
            <div className="absolute top-1/2 left-0 pl-3 transform -translate-y-1/2 pointer-events-none">
              <LuUser className="w-4 h-4 text-gray-400"/>
            </div>
            <input
              type="text"
              id="full_name"
              {...register("full_name")}
              className={`w-full pl-10 pr-3 py-2 border ${errors.full_name ? 'border-red-500' : 'border-gray-300'} rounded-[16px] shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
              placeholder="Nhập họ và tên khách hàng"
            />
          </div>
          {errors.full_name && <p className="text-xs text-red-600 mt-1">{errors.full_name.message}</p>}
        </div>

        {/* Giới tính */}
        <div className="md:mt-0 w-full md:max-w-[240px]">
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
            Giới tính
          </label>
          <div className="relative">
            {/* Icon giới tính bên trái */}
            <div className="absolute top-1/2 left-0 pl-3 transform -translate-y-1/2 pointer-events-none">
              <LuUsers className="w-4 h-4 text-gray-400" />
            </div>
            {/* Select input */}
            <select
              id="gender"
              {...register("gender")}
              className={`appearance-none w-full pl-10 pr-10 py-2 border ${
                errors.gender ? 'border-red-500' : 'border-gray-300'
              } rounded-[16px] shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white`}
            >
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
            <div className="pointer-events-none absolute top-1/2 right-3 transform -translate-y-1/2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

          {errors.gender && <p className="text-xs text-red-600 mt-1">{errors.gender.message}</p>}
        </div>
      </div>

      {/* Email - SDT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LuMail className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              {...register("email", {
                required: 'Email là bắt buộc',
                pattern: {
                  value: /^\S+@\S+$/,
                  message: 'Định dạng email không hợp lệ'
                }
              })}
              className={`w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-[16px] shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
              placeholder="example@email.com"
            />
          </div>
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
        </div>

        {/* PHONE */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Số điện thoại
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LuPhone className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="tel"
              id="phone"
              {...register("phone")}
              className={`w-full pl-10 pr-3 py-2 border ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              } rounded-[16px] shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
              placeholder="Nhập số điện thoại"
            />
          </div>
          {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
        </div>
      </div>

      {/* Ngày sinh - Trạng thái */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ngày sinh  */}
        <div>
          <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
          <div className="relative">
            {/* Icon lịch bên trái */}
            <div className="absolute top-1/2 left-0 pl-3 transform -translate-y-1/2 pointer-events-none">
              <LuCake className="w-4 h-4 text-gray-400"/>
            </div>
            <input
              type="date"
              id="birth_date"
              {...register("birth_date")}
              className={`w-full pl-10 pr-3 py-2 border ${
                errors.birth_date ? 'border-red-500' : 'border-gray-300'
              } rounded-[16px] shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
            />
          </div>
          {errors.birth_date && <p className="text-xs text-red-600 mt-1">{errors.birth_date.message}</p>}
        </div>

        {/* Trạng thái */}
        <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
        <div className="relative">
          <select
            id="status"
            {...register("status")}
            className={`appearance-none w-full pl-3 pr-10 py-2 border ${
              errors.status ? 'border-red-500' : 'border-gray-300'
            } rounded-[16px] shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white`}
          >
            <option value="active">Hoạt động (Active)</option>
            <option value="inactive">Không hoạt động (Inactive)</option>
          </select>

          {/* Icon mũi tên ▼ */}
          <div className="pointer-events-none absolute top-1/2 right-3 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
        {errors.status && <p className="text-xs text-red-600 mt-1">{errors.status.message}</p>}
      </div>
      </div>

      {/* Google id */}
      <div>
        <label htmlFor="google_id" className="block text-sm font-medium text-gray-700 mb-1">Google ID <span className="text-red-500">*</span></label>
         <div className='relative'>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LuIdCard className="w-4 h-4 text-gray-400" />
          </div> 
          <input 
            type="text" 
            id="google_id" 
            {...register("google_id", { required: 'Google ID là bắt buộc' })} 
            className={`w-full pl-10 px-3 py-2 border ${errors.google_id ? 'border-red-500' : 'border-gray-300'} rounded-[16px] shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`} 
            placeholder="Nhập Google ID của khách hàng"
            />
          {errors.google_id && <p className="text-xs text-red-600 mt-1">{errors.google_id.message}</p>}
        </div>
      </div>

      
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}
      
      <div className="flex justify-center space-x-3 pt-5 border-t">
         <button 
            type="button" 
            onClick={() => navigate(-1)} // Quay lại trang trước đó
            className="px-4 py-2 border border-gray-300 rounded-[16px] shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
           Hủy
         </button>
         <button 
            type="submit" 
            className="px-4 py-2 border border-transparent rounded-[16px] shadow-sm text-sm font-medium bg-green-200 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-200"
        >
           {isEditMode ? 'Lưu thay đổi' : 'Thêm Khách hàng'}
         </button>
       </div>
    </form>
  );
};

export default AdminCustomerForm; 