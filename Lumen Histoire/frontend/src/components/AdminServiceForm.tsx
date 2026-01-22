import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { LuDollarSign, LuImagePlus, LuUserPlus, LuHash, LuFileText, LuFolderPen } from 'react-icons/lu';
import Select from 'react-select';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import uploadFileApi from '../api/uploadFileApi'; // Assuming this API is suitable
// Consider using a Select component library like react-select for the expert dropdown
// import Select from 'react-select'; 

// Interfaces
interface ExpertOption {
  value: number; // Expert ID as number
  label: string; // Expert Name
}

export interface ServiceFormData {
  id?: string;
  name: string;
  description: string;
  price: number | string;
  number_of_sessions: number | string;
  article_content?: string | null;
  image?: string | null;
  doctor_ids?: number[];
}

interface AdminServiceFormProps {
  onSubmit: (data: ServiceFormData) => void;
  initialData?: Partial<ServiceFormData> | null;
  isEditMode: boolean;
  availableExperts?: ExpertOption[];
  initialAssignedExperts?: ExpertOption[];
}

const AdminServiceForm: React.FC<AdminServiceFormProps> = ({ 
  onSubmit, 
  initialData, 
  isEditMode,
  availableExperts = [],
  initialAssignedExperts = []
}) => {
  const navigate = useNavigate();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ServiceFormData>({
    defaultValues: {
      id: initialData?.id,
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price ?? '',
      number_of_sessions: initialData?.number_of_sessions ?? '',
      article_content: initialData?.article_content || '',
      image: initialData?.image || null,
      doctor_ids: initialData?.doctor_ids || []
    }
  });

  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedExperts, setSelectedExperts] = useState<ExpertOption[]>(initialAssignedExperts);
  const [articleContent, setArticleContent] = useState<string>(initialData?.article_content || '');

  const currentImage = watch('image');

  useEffect(() => {
    if (initialData) {
      reset({
        id: initialData.id,
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price ?? '', 
        number_of_sessions: initialData.number_of_sessions ?? '',
        article_content: initialData.article_content || '',
        image: initialData.image || null,
        doctor_ids: initialData.doctor_ids || []
      });
      setImagePreview(initialData.image || null);
      setArticleContent(initialData.article_content || '');
    } else {
      reset({
        name: '', 
        description: '', 
        price: '', 
        number_of_sessions: '',
        article_content: '',
        image: null,
        id: undefined,
        doctor_ids: []
      });
      setImagePreview(null);
      setSelectedExperts([]);
      setArticleContent('');
    }
  }, [initialData, reset]);

  useEffect(() => {
    if (initialAssignedExperts?.length > 0) {
      setSelectedExperts(initialAssignedExperts);
    }
  }, [initialAssignedExperts]);

  useEffect(() => {
    if (currentImage && currentImage !== imagePreview) {
      setImagePreview(currentImage);
    }
  }, [currentImage, imagePreview]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setUploadingImage(true);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl); 
      try {
        const uploadEvent = { target: event.target } as unknown as React.ChangeEvent<HTMLInputElement>;
        console.log('Starting image upload...');
        const downloadURL = await uploadFileApi.uploadFile(uploadEvent);
        console.log('Image uploaded, URL:', downloadURL);
        setValue("image", downloadURL, { shouldValidate: true });
        setImagePreview(downloadURL);
      } catch (error) {
        console.error("Service image upload failed:", error);
        setValue("image", initialData?.image || null);
        setImagePreview(initialData?.image || null);
        alert("Lỗi tải ảnh lên, vui lòng thử lại.");
      } finally {
        setUploadingImage(false);
        if (previewUrl !== imagePreview && !currentImage) {
          URL.revokeObjectURL(previewUrl);
        }
      }
    }
  };

  const handleExpertChange = (selectedOptions: readonly ExpertOption[]) => {
    setSelectedExperts([...selectedOptions]);
    setValue('doctor_ids', selectedOptions.map(opt => opt.value));
  };

  const handleFormSubmit = (data: ServiceFormData) => {
    const payload: ServiceFormData = {
      ...data,
      price: typeof data.price === 'string' && data.price !== '' ? parseFloat(data.price) : (typeof data.price === 'number' ? data.price : 0),
      number_of_sessions: typeof data.number_of_sessions === 'string' && data.number_of_sessions !== '' ? parseInt(data.number_of_sessions, 10) : (typeof data.number_of_sessions === 'number' ? data.number_of_sessions : 0),
      article_content: articleContent,
      image: data.image || null,
      doctor_ids: selectedExperts.map(expert => expert.value)
    };

    if (uploadingImage) {
      alert("Please wait for the image to finish uploading.");
      return;
    }
    onSubmit(payload);
  };

  return (
    <div className="bg-white rounded-[16px] shadow-sm border">
      {/* <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {isEditMode ? 'Chỉnh sửa Dịch vụ' : 'Thêm Dịch vụ'}
        </h2>
      </div> */}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">

        {/* {isEditMode && initialData?.id && (
          <div>
            <label htmlFor="serviceId" className="block text-sm font-medium text-gray-700 mb-1">ID Dịch vụ</label>
            <input 
              type="text" 
              id="serviceId" 
              value={initialData.id} 
              readOnly 
              className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 text-sm cursor-not-allowed"
            />
          </div>
        )} */}

        {/* Hình ảnh + Tên dịch vụ + Giá + Số buổi */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Ảnh dịch vụ */}
          <div className="flex flex-col space-y-2">
            <label htmlFor="service_image_upload" className="text-md font-semibold">
              Ảnh dịch vụ
            </label>
            <div className="w-64 h-32 border-2 border-dashed border-gray-300 rounded-[16px] flex items-center justify-center relative overflow-hidden group bg-gray-50">
              {imagePreview ? (
                <img src={imagePreview} alt="Service preview" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <LuImagePlus className="w-12 h-12 text-gray-400" />
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="service_image_upload"
                disabled={uploadingImage}
              />
              <label htmlFor="service_image_upload" className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-opacity cursor-pointer ${uploadingImage ? 'cursor-not-allowed' : ''}`}>
                {!uploadingImage && <LuImagePlus className="text-white w-8 h-8 opacity-0 group-hover:opacity-100" />}
              </label>
            </div>
            {uploadingImage && (
              <p className="text-xs text-blue-600 mt-1">Đang tải ảnh...</p>
            )}
          </div>

          {/* Input: Tên, Giá, Số buổi */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-md font-semibold mb-1">Tên dịch vụ</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LuFolderPen className="h-4 w-4 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  id="name" 
                  {...register("name", { required: 'Tên dịch vụ là bắt buộc' })} 
                  className={`w-full pl-10 pr-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-[16px] shadow-sm focus:outline-none focus:ring-green-400 focus:border-green-400 sm:text-sm`} 
                  placeholder="Ví dụ: Tham vấn tâm lý cá nhân"
                />
              </div>
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="price" className="block text-md font-semibold mb-1">Giá dịch vụ (VNĐ)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LuDollarSign className="h-4 w-4 text-gray-400" />
                </div>
                <input 
                  id="price" 
                  {...register("price", { 
                    required: 'Giá là bắt buộc', 
                    valueAsNumber: true, 
                    min: { value: 0, message: 'Giá phải là số không âm' } 
                  })} 
                  className={`w-full pl-10 pr-3 py-2 border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-[16px] shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`} 
                  placeholder="500000"
                />
              </div>
              {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <label htmlFor="number_of_sessions" className="block text-md font-semibold mb-1">Số buổi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LuHash className="h-4 w-4 text-gray-400" />
                </div>
                <input 
                  type="number" 
                  id="number_of_sessions" 
                  {...register("number_of_sessions", { 
                    required: 'Số buổi là bắt buộc', 
                    valueAsNumber: true, 
                    min: { value: 1, message: 'Số buổi phải lớn hơn 0' } 
                  })} 
                  className={`w-full pl-10 pr-3 py-2 border ${errors.number_of_sessions ? 'border-red-500' : 'border-gray-300'} rounded-[16px] shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`} 
                  placeholder="1"
                />
              </div>
              {errors.number_of_sessions && <p className="text-xs text-red-600 mt-1">{errors.number_of_sessions.message}</p>}
            </div>
          </div>
        </div>
  
        {/* Mô tả dịch vụ*/}
        <div>
          <label htmlFor="description" className="block text-md font-semibold mb-1">Mô tả ngắn</label>
          <textarea 
            id="description" 
            rows={3} 
            {...register("description", { required: 'Mô tả là bắt buộc' })} 
            className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-[16px] shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm resize-none`} 
            placeholder="Mô tả ngắn gọn về dịch vụ..."
          />
          {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
        </div>

        {/* Nội dung bài viết */}
        <div>
          <label htmlFor="article_content" className="block text-md font-semibold mb-3">
            Nội dung bài viết
          </label>
          <div className="border border-gray-300 rounded-md">
            <SunEditor
              setContents={articleContent}
              onChange={setArticleContent}
              setOptions={{
                buttonList: [
                  ['undo', 'redo'],
                  ['font', 'fontSize', 'formatBlock'],
                  ['bold', 'italic', 'underline', 'strike'],
                  ['fontColor', 'hiliteColor'],
                  ['align', 'list', 'lineHeight'],
                  ['outdent', 'indent'],
                  ['table', 'link', 'image'],
                  ['fullScreen', 'showBlocks', 'codeView'],
                  ['removeFormat']
                ],
                height: '300px',
                width: '100%',
                showPathLabel: false,
                placeholder: 'Viết nội dung chi tiết về dịch vụ...'
              }}
            />
          </div>
          {/* <p className="text-xs text-gray-500 mt-1">Hỗ trợ định dạng rich text với SunEditor</p> */}
        </div>

        {/* Chuyên gia phụ trách*/}
        <div>
          <label className="block text-md font-semibold mb-3">
            Chuyên gia phụ trách
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <LuUserPlus className="w-4 h-4 text-gray-500" />
            </div>
            <Select
            isMulti
            value={selectedExperts}
            onChange={handleExpertChange}
            options={availableExperts}
            className="react-select-container"
            classNamePrefix="select"
            placeholder="Chọn chuyên gia..."
            noOptionsMessage={() => "Không có chuyên gia nào"}
            styles={{
              control: (provided, state) => ({
                ...provided,
                paddingLeft: '1.75rem',
                fontSize: '0.875rem',
                borderRadius: 16,
                borderColor: state.isFocused ? '#4ade80' : '#d1d5db', // green-400 hoặc gray-300
                boxShadow: state.isFocused ? '0 0 0 1px #4ade80' : 'none', // hiệu ứng focus
                '&:hover': {
                  borderColor: '#4ade80'
                }
              }),
              input: (provided) => ({
                ...provided,
                fontSize: '0.875rem'
              }),
              placeholder: (provided) => ({
                ...provided,
                fontSize: '0.875rem',
                color: '#9ca3af'
              }),
              multiValueLabel: (provided) => ({
                ...provided,
                fontSize: '0.75rem'
              })
            }}
          />

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-3 pt-6 border-t">
          <button 
            type="button" 
            onClick={() => navigate('/admin/services')} 
            className="px-6 py-2 rounded-[16px] shadow-sm text-sm font-medium bg-gray-200 hover:bg-gray-300 focus:outline-none"
            disabled={uploadingImage}
          >
            Hủy
          </button>
          <button 
            type="submit" 
            className={`px-6 py-2  rounded-[16px] shadow-sm text-sm font-medium bg-green-100 hover:bg-green-200 focus:outline-none  ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={uploadingImage}
          >
            {uploadingImage ? 'Đang xử lý...' : (isEditMode ? 'Lưu thay đổi' : 'Thêm Dịch vụ')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminServiceForm;