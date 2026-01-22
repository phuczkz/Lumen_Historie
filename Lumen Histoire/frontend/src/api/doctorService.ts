import axiosClient from './axiosClient';

// Define types for Qualification and Experience
export interface DoctorQualification {
  id?: number;
  doctor_id?: number;
  degree: string;
  major: string;
  completion_year: number;
  institution: string;
  created_at?: string;
  updated_at?: string;
}

export interface DoctorExperience {
  id?: number;
  doctor_id?: number;
  position: string;
  start_date: string;
  end_date?: string | null;
  workplace: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Define types for Doctor Service
export interface DoctorService {
  id: number;
  name: string;
  description?: string;
  price?: number;
  duration_minutes?: number;
}

// Define types for Doctor data
export interface Doctor {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  specialty?: string | null;
  bio?: string | null;
  profile_picture?: string | null;
  status: 'active' | 'inactive';
  department_id?: number | null;
  address?: string | null;
  // Fields from JOIN with departments
  department_name?: string | null;
  department_description?: string | null;
  // Review data
  average_rating?: number;
  review_count?: number;
  // Related data
  qualifications?: DoctorQualification[];
  experiences?: DoctorExperience[];
  services?: DoctorService[];
  created_at?: string;
  updated_at?: string;
}

export interface DoctorCreatePayload {
  full_name: string;
  email: string;
  phone?: string | null;
  specialty?: string | null;
  bio?: string | null;
  profile_picture?: string | null;
  status?: 'active' | 'inactive';
  department_id?: number | null;
  address?: string | null;
}

export interface DoctorUpdatePayload {
  full_name?: string;
  email?: string;
  phone?: string | null;
  specialty?: string | null;
  bio?: string | null;
  profile_picture?: string | null;
  status?: 'active' | 'inactive';
  department_id?: number | null;
  address?: string | null;
}

export interface DoctorCreationResponse {
  message: string;
  doctorId: number;
  // Include other fields from DoctorCreatePayload if returned by backend
  full_name: string;
  email: string;
  status: 'active' | 'inactive';
}

const doctorService = {
  getAll: async (): Promise<Doctor[]> => {
    const response = await axiosClient.get<Doctor[]>('/doctors');
    return response.data;
  },
  getById: async (id: number): Promise<Doctor> => {
    const response = await axiosClient.get<Doctor>(`/doctors/${id}`);
    return response.data;
  },
  create: async (data: DoctorCreatePayload): Promise<DoctorCreationResponse> => {
    const response = await axiosClient.post<DoctorCreationResponse>('/doctors', data);
    return response.data;
  },
  update: async (id: number, data: DoctorUpdatePayload): Promise<{ message: string } & Partial<Doctor>> => {
    const response = await axiosClient.put<{ message: string } & Partial<Doctor>>(`/doctors/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await axiosClient.delete<{ message: string }>(`/doctors/${id}`);
    return response.data;
  },
  search: async (searchTerm: string): Promise<Doctor[]> => {
    const response = await axiosClient.get<Doctor[]>('/doctors/search', { params: { searchTerm } });
    return response.data;
  },

  // Qualifications management
  addQualification: async (doctorId: number, qualification: Omit<DoctorQualification, 'id' | 'doctor_id' | 'created_at' | 'updated_at'>): Promise<{ message: string; qualificationId: number }> => {
    const response = await axiosClient.post(`/doctors/${doctorId}/qualifications`, qualification);
    return response.data as { message: string; qualificationId: number };
  },
  updateQualification: async (qualificationId: number, qualification: Omit<DoctorQualification, 'id' | 'doctor_id' | 'created_at' | 'updated_at'>): Promise<{ message: string }> => {
    const response = await axiosClient.put(`/doctors/qualifications/${qualificationId}`, qualification);
    return response.data as { message: string };
  },
  deleteQualification: async (qualificationId: number): Promise<{ message: string }> => {
    const response = await axiosClient.delete(`/doctors/qualifications/${qualificationId}`);
    return response.data as { message: string };
  },

  // Experiences management
  addExperience: async (doctorId: number, experience: Omit<DoctorExperience, 'id' | 'doctor_id' | 'created_at' | 'updated_at'>): Promise<{ message: string; experienceId: number }> => {
    const response = await axiosClient.post(`/doctors/${doctorId}/experiences`, experience);
    return response.data as { message: string; experienceId: number };
  },
  updateExperience: async (experienceId: number, experience: Omit<DoctorExperience, 'id' | 'doctor_id' | 'created_at' | 'updated_at'>): Promise<{ message: string }> => {
    const response = await axiosClient.put(`/doctors/experiences/${experienceId}`, experience);
    return response.data as { message: string };
  },
  deleteExperience: async (experienceId: number): Promise<{ message: string }> => {
    const response = await axiosClient.delete(`/doctors/experiences/${experienceId}`);
    return response.data as { message: string };
  },
};

export default doctorService; 