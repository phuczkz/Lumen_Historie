import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminExpertForm, { ExpertFormData } from '../../components/AdminExpertForm';
import { LuArrowLeft } from 'react-icons/lu';
import doctorService, { DoctorCreatePayload, DoctorCreationResponse } from '../../api/doctorService';

const AdminAddExpertPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleAddExpert = async (formData: ExpertFormData) => {
    // Remove id, qualifications, and experiences from formData as they are handled separately
    const { id, qualifications, experiences, ...payloadData } = formData;

    const apiPayload: DoctorCreatePayload = {
      ...payloadData,
      // Ensure any type conversions or specific field mapping needed for DoctorCreatePayload
      phone: formData.phone || null,
      specialty: formData.specialty || null,
      bio: formData.bio || null,
      profile_picture: formData.profile_picture || null,
      status: formData.status || 'active', // Default to active if not provided
      address: formData.address || null,
    };

    console.log('Submitting new expert data to API:', apiPayload);
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response: DoctorCreationResponse = await doctorService.create(apiPayload);
      console.log('Expert created successfully:', response);
      
      const doctorId = response.doctorId;

      // Add qualifications if any
      if (qualifications && qualifications.length > 0) {
        for (const qualification of qualifications) {
          if (qualification.degree && qualification.major && qualification.completion_year && qualification.institution) {
            try {
              await doctorService.addQualification(doctorId, {
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

      // Add experiences if any
      if (experiences && experiences.length > 0) {
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
              
              // Validate that start_date is properly formatted
              if (!newExperience.start_date) {
                console.error('Invalid start_date for experience:', experience);
                continue;
              }

              await doctorService.addExperience(doctorId, {
                position: newExperience.position,
                start_date: newExperience.start_date, // Already validated as not null above
                end_date: newExperience.end_date,
                workplace: newExperience.workplace,
                description: newExperience.description
              });
            } catch (expError) {
              console.error('Error adding experience:', expError);
            }
          }
        }
      }

      alert(`Chuyên gia "${response.full_name}" đã được tạo thành công!`);
      navigate('/admin/experts');
    } catch (error: any) {
      console.error('Error creating expert:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Đã có lỗi xảy ra khi thêm chuyên gia.';
      setSubmitError(errorMessage);
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <button 
        onClick={() => navigate('/admin/experts')} 
        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
      >
        <LuArrowLeft className="mr-1 h-4 w-4" />
          Quay lại Danh sách Chuyên gia
      </button>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Thêm Chuyên gia Mới</h1>
        
      </div>

      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
          <strong className="font-bold">Lỗi! </strong>
          <span className="block sm:inline">{submitError}</span>
        </div>
      )}

      <AdminExpertForm 
        onSubmit={handleAddExpert} 
        isEditMode={false} 
      />

      {isSubmitting && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <p className="text-lg text-gray-700">Đang thêm chuyên gia, vui lòng chờ...</p>
            {/* Optional: Add a spinner here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAddExpertPage; 