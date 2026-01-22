import axiosClient from './axiosClient';

export interface Service {
  id: number;
  title?: string | null;
  name?: string | null; // Some APIs return 'name' instead of 'title'
  duration?: string; // Assuming duration is a string like "1 buổi"
  description: string | null;
  experts?: string; // Optional, as it might not always be present or could be a list of IDs
  price: number | string; // Price in VND - can be string or number
  number_of_sessions: number; // Number of sessions for this service
  image?: string | null; // Optional image URL
  // Add other fields that might come from the API
  content?: string; // For detailed content on ServiceDetailPage
  target_audience?: string;
  objectives?: string[];
  process_description?: string;
  benefits?: string[];
  created_at?: string;
  updated_at?: string;
  article_content?: string | null;
  doctor_ids?: number[]; // List of doctor IDs who can provide this service
  doctor_names?: string[]; // List of doctor names
  doctor_details?: {
    id: number;
    name: string;
    specialty: string;
  }[]; // List of doctor details with specialty information
}

const serviceService = {
  getAll: async (): Promise<Service[]> => {
    const response = await axiosClient.get<Service[]>('/services');
    return response.data;
  },

  getById: async (id: number): Promise<Service> => {
    const response = await axiosClient.get<Service>(`/services/${id}`);
    return response.data;
  },

  // Add other methods like create, update, delete if needed
  // create: async (serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> => {
  //   const response = await axiosClient.post<Service>('/services', serviceData);
  //   return response.data;
  // },

  // update: async (id: number, serviceData: Partial<Omit<Service, 'id' | 'created_at' | 'updated_at'>>): Promise<Service> => {
  //   const response = await axiosClient.put<Service>(`/services/${id}`, serviceData);
  //   return response.data;
  // },

  // delete: async (id: number): Promise<void> => {
  //   await axiosClient.delete(`/services/${id}`);
  // },
};

export default serviceService; 