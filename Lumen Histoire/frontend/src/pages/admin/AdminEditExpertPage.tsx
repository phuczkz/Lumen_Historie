import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminExpertForm, { ExpertFormData } from '../../components/AdminExpertForm';
import { LuArrowLeft } from 'react-icons/lu';
import doctorService, { Doctor, DoctorUpdatePayload } from '../../api/doctorService';

const AdminEditExpertPage: React.FC = () => {
  const { expertId } = useParams<{ expertId: string }>();
  const navigate = useNavigate();
  
  const [initialData, setInitialData] = useState<Partial<ExpertFormData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!expertId) {
      setFetchError('ID chuyên gia không hợp lệ.');
      setLoading(false);
      return;
    }

    const fetchExpert = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const numericId = parseInt(expertId, 10);
        if (isNaN(numericId)) {
          setFetchError('ID chuyên gia không hợp lệ.');
          setInitialData(null);
          setLoading(false);
          return;
        }
        const data: Doctor = await doctorService.getById(numericId);
        // Map Doctor to ExpertFormData for the form
        const formData: Partial<ExpertFormData> = {
            id: data.id,
            full_name: data.full_name,
            email: data.email,
            phone: data.phone || '',
            specialty: data.specialty || '',
            bio: data.bio || '',
            profile_picture: data.profile_picture || null,
            status: data.status || 'active',
            address: data.address || '',
            qualifications: data.qualifications || [],
            experiences: data.experiences || [],
        };
        console.log('Fetched doctor data:', data);
        console.log('Mapped form data:', formData);
        setInitialData(formData);
      } catch (err: any) {
        console.error('Failed to fetch expert:', err);
        setFetchError(err.response?.data?.message || 'Không thể tải thông tin chuyên gia.');
        setInitialData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchExpert();
  }, [expertId]);

  const handleEditExpert = async (formData: ExpertFormData) => {
    if (!expertId) {
      setSubmitError('ID chuyên gia không hợp lệ cho việc cập nhật.');
      return;
    }
    
    const numericExpertId = parseInt(expertId, 10);
    const { qualifications, experiences, ...basicData } = formData;
    
    // Update basic doctor info
    const apiPayload: DoctorUpdatePayload = {
        full_name: basicData.full_name,
        email: basicData.email,
        phone: basicData.phone || null,
        specialty: basicData.specialty || null,
        bio: basicData.bio || null,
        profile_picture: basicData.profile_picture || null,
        status: basicData.status,
        address: basicData.address || null,
    };

    console.log('Submitting updated expert data to API:', apiPayload);
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Update basic doctor information
      await doctorService.update(numericExpertId, apiPayload);

      console.log('Form data experiences before processing:', experiences);

      // Handle qualifications - for simplicity, we'll delete all existing and re-add
      // In a production app, you might want to implement a more sophisticated sync
      const currentData = await doctorService.getById(numericExpertId);
      
      console.log('Current data from API:', currentData);
      console.log('Current experiences from API:', currentData.experiences);

      // Delete existing qualifications
      if (currentData.qualifications) {
        for (const qual of currentData.qualifications) {
          if (qual.id) {
            try {
              await doctorService.deleteQualification(qual.id);
            } catch (error) {
              console.error('Error deleting qualification:', error);
            }
          }
        }
      }

      // Add new qualifications
      if (qualifications && qualifications.length > 0) {
        console.log('Adding qualifications:', qualifications);
        for (const qualification of qualifications) {
          if (qualification.degree && qualification.major && qualification.completion_year && qualification.institution) {
            try {
              await doctorService.addQualification(numericExpertId, {
                degree: qualification.degree,
                major: qualification.major,
                completion_year: qualification.completion_year,
                institution: qualification.institution
              });
            } catch (qualError) {
              console.error('Error adding qualification:', qualError);
            }
          }
        }
      }

      // Delete existing experiences
      if (currentData.experiences && currentData.experiences.length > 0) {
        console.log('Deleting existing experiences:', currentData.experiences);
        for (const exp of currentData.experiences) {
          if (exp.id) {
            try {
              await doctorService.deleteExperience(exp.id);
            } catch (error) {
              console.error('Error deleting experience:', error);
            }
          }
        }
      }

      // Add new experiences
      if (experiences && experiences.length > 0) {
        console.log('Adding new experiences:', experiences);
        for (const experience of experiences) {
          if (experience.position && experience.start_date && experience.workplace) {
            try {
              // Ensure dates are in proper format (YYYY-MM-DD)
              const formatDate = (dateString: string | null | undefined): string | null => {
                if (!dateString) return null;
                // If it's already in YYYY-MM-DD format, return as is
                if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                  return dateString;
                }
                // Convert ISO string to YYYY-MM-DD
                try {
                  const date = new Date(dateString);
                  return date.toISOString().split('T')[0];
                } catch (error) {
                  console.error('Error formatting date:', dateString, error);
                  return null;
                }
              };

              const newExperience = {
                position: experience.position,
                start_date: formatDate(experience.start_date),
                end_date: formatDate(experience.end_date),
                workplace: experience.workplace,
                description: experience.description || null
              };
              
              console.log('Adding experience with formatted dates:', newExperience);
              
              // Validate that start_date is properly formatted
              if (!newExperience.start_date) {
                console.error('Invalid start_date for experience:', experience);
                continue;
              }
              
              // Create properly typed experience object
              const validExperience = {
                position: experience.position,
                start_date: newExperience.start_date, // Already validated as not null above
                end_date: newExperience.end_date,
                workplace: experience.workplace,
                description: newExperience.description
              };
              
              await doctorService.addExperience(numericExpertId, validExperience);
            } catch (expError) {
              console.error('Error adding experience:', expError);
              // Continue with other experiences even if one fails
            }
          } else {
            console.warn('Skipping incomplete experience:', experience);
          }
        }
      } else {
        console.log('No experiences to add, experiences array:', experiences);
      }

      alert('Thông tin chuyên gia đã được cập nhật thành công!');
      navigate('/admin/experts');
    } catch (error: any) {
      console.error('Error updating expert:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Đã có lỗi xảy ra khi cập nhật thông tin chuyên gia.';
      setSubmitError(errorMessage);
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Đang tải thông tin chuyên gia...</div>;
  }

  if (fetchError) {
    return (
      <div className="p-6">
        <button onClick={() => navigate('/admin/experts')} className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <LuArrowLeft className="mr-2 h-4 w-4" />
          Quay lại Danh sách Chuyên gia
        </button>
        <div className="text-center text-red-600 bg-red-50 py-4 rounded-md">{fetchError}</div>
      </div>
    );
  }

  if (!initialData && !loading) { // Added !loading to prevent brief flash if fetch fails quickly
    return (
        <div className="p-6">
            <button onClick={() => navigate('/admin/experts')} className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <LuArrowLeft className="mr-2 h-4 w-4" />
            Quay lại Danh sách Chuyên gia
            </button>
            <div className="p-6 text-center text-red-600">Không tìm thấy dữ liệu chuyên gia để chỉnh sửa.</div>
        </div>
    );
  }
  
  return (
    <div className="space-y-4 w-full">
      <button 
            onClick={() => navigate('/admin/experts')} 
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <LuArrowLeft className="mr-1 h-4 w-4" />
          Quay lại Danh sách
      </button>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Chỉnh sửa Thông tin Chuyên gia</h1>
      </div>

      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
          <strong className="font-bold">Lỗi! </strong>
          <span className="block sm:inline">{submitError}</span>
        </div>
      )}
      
      {initialData && (
          <AdminExpertForm 
            onSubmit={handleEditExpert} 
            initialData={initialData} 
            isEditMode={true} 
        />
      )}

      {isSubmitting && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <p className="text-lg text-gray-700">Đang cập nhật, vui lòng chờ...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEditExpertPage; 