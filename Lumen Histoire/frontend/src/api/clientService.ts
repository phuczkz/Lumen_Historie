import axiosClient from './axiosClient';

// Define types for Client data
export interface Client {
  id: number;
  google_id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface ClientCreatePayload {
  google_id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  status?: 'active' | 'inactive';
}

export interface ClientUpdatePayload {
  email?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  status?: 'active' | 'inactive';
}

export interface ClientCreationResponse {
  message: string;
  clientId: number;
  google_id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  status: 'active' | 'inactive';
}

const clientService = {
  getAll: async (): Promise<Client[]> => {
    const response = await axiosClient.get<Client[]>('/clients');
    return response.data;
  },
  getById: async (id: number): Promise<Client> => {
    const response = await axiosClient.get<Client>(`/clients/${id}`);
    return response.data;
  },
  create: async (data: ClientCreatePayload): Promise<ClientCreationResponse> => {
    const response = await axiosClient.post<ClientCreationResponse>('/clients', data);
    return response.data;
  },
  update: async (id: number, data: ClientUpdatePayload): Promise<{ message: string } & Partial<Client>> => {
    const response = await axiosClient.put<{ message: string } & Partial<Client>>(`/clients/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await axiosClient.delete<{ message: string }>(`/clients/${id}`);
    return response.data;
  },
  search: async (searchTerm: string): Promise<Client[]> => {
    const response = await axiosClient.get<Client[]>('/clients/search', { params: { searchTerm } });
    return response.data;
  },
};

export default clientService; 