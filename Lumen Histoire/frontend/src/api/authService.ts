import { da } from 'date-fns/locale';
import axiosClient from './axiosClient';

// Common types
export interface AuthResponseData {
  message: string;
  token?: string;
  adminId?: number;
  clientId?: number;
  username?: string;
  email?: string;
  full_name?: string;
  avatar_url?: string; // Added for client profile
}

// Admin types
interface AdminLoginPayload {
  username: string;
  password: string;
}

interface RegisterAdminPayload {
  username: string;
  password: string;
}

// Client types
interface ClientLoginPayload {
  email: string;
  password: string;
}

interface RegisterClientPayload {
  email: string;
  full_name: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  adminId?: number;
  username?: string;
  clientId?: number;
  email?: string;
  full_name?: string;
}

export interface AdminProfile {
  id: number;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface ClientProfile {
  id: number;
  google_id: string;
  email: string;
  phone: string | null;
  gender: string;
  birth_date: string | null;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive';
}

export interface UpdateAdminProfileData {
  username?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface UpdateClientProfileData {
  full_name?: string;
  currentPassword?: string;
  newPassword?: string;
  avatar_url?: string;
}

const authService = {
  // Admin Authentication
  registerAdmin: async (data: RegisterAdminPayload): Promise<LoginResponse> => {
    const response = await axiosClient.post<LoginResponse>('/auth/admin/register', data);
    return response.data;
  },

  loginAdmin: async (data: AdminLoginPayload): Promise<LoginResponse> => {
    const response = await axiosClient.post<LoginResponse>('/auth/admin/login', data);
    return response.data;
  },

  // Client Authentication
  registerClient: async (email: string, full_name: string, password: string): Promise<LoginResponse> => {
    const response = await axiosClient.post<LoginResponse>('/auth/client/register', { email, full_name, password });
    return response.data;
  },

  loginClient: async (data: ClientLoginPayload): Promise<LoginResponse> => {
    const response = await axiosClient.post<LoginResponse>('/auth/client/login', data);
    return response.data;
  },

  // Admin Profile Management
  getAdminProfile: async (): Promise<AdminProfile> => {
    const response = await axiosClient.get<AdminProfile>('/auth/admin/profile');
    return response.data;
  },

  updateAdminProfile: async (data: UpdateAdminProfileData): Promise<{ message: string }> => {
    const response = await axiosClient.put<{ message: string }>('/auth/admin/profile', data);
    return response.data;
  },

  // Client Profile Management
  getClientProfile: async (): Promise<ClientProfile> => {
    const response = await axiosClient.get<ClientProfile>('/auth/client/profile');
    return response.data;
  },

  updateClientProfile: async (data: UpdateClientProfileData): Promise<{ message: string }> => {
    const response = await axiosClient.put<{ message: string }>('/auth/client/profile', data);
    return response.data;
  }
};

export default authService;