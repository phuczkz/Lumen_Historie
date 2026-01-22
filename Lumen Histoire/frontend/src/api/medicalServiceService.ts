import axiosClient from './axiosClient';

// Define types for Medical Service data
export interface MedicalService {
  id: number;
  name: string;
  description: string | null;
  price: number;
  number_of_sessions: number;
  article_content: string | null;
  image: string | null;
  created_at?: string;
  updated_at?: string;
  doctor_ids: number[];
  doctor_names: string[];
  doctor_details?: Array<{
    id: number;
    name: string;
    specialty: string;
  }>;
}

export interface MedicalServiceCreatePayload {
  name: string;
  description?: string | null;
  price: number;
  number_of_sessions: number;
  article_content?: string | null;
  image?: string | null;
  doctor_ids?: number[];
}

export interface MedicalServiceUpdatePayload {
  name?: string;
  description?: string | null;
  price?: number;
  number_of_sessions?: number;
  article_content?: string | null;
  image?: string | null;
  doctor_ids?: number[];
}

export interface MedicalServiceCreationResponse {
  message: string;
  serviceId: number;
  name: string;
  description?: string | null;
  price: number;
  number_of_sessions: number;
}

const medicalServiceService = {
  getAll: async (): Promise<MedicalService[]> => {
    const response = await axiosClient.get<MedicalService[]>('/services');
    return response.data;
  },
  getById: async (id: number): Promise<MedicalService> => {
    const response = await axiosClient.get<MedicalService>(`/services/${id}`);
    return response.data;
  },
  create: async (data: MedicalServiceCreatePayload): Promise<MedicalServiceCreationResponse> => {
    const response = await axiosClient.post<MedicalServiceCreationResponse>('/services', data);
    return response.data;
  },
  update: async (id: number, data: MedicalServiceUpdatePayload): Promise<{ message: string } & Partial<MedicalService>> => {
    const response = await axiosClient.put<{ message: string } & Partial<MedicalService>>(`/services/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await axiosClient.delete<{ message: string }>(`/services/${id}`);
    return response.data;
  },
  search: async (searchTerm: string): Promise<MedicalService[]> => {
    const response = await axiosClient.get<MedicalService[]>('/services/search', { params: { searchTerm } });
    return response.data;
  },
};

export default medicalServiceService;