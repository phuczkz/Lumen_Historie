import axiosClient from './axiosClient';

// Define types for Department data
export interface Department {
  id: number;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DepartmentCreatePayload {
  name: string;
  description?: string | null;
}

export interface DepartmentUpdatePayload {
  name?: string;
  description?: string | null;
}

// Response for creation might include the full object or just a message and ID
export interface DepartmentCreationResponse {
  message: string;
  departmentId: number;
  name: string;
  description?: string | null;
}

const departmentService = {
  getAll: async (): Promise<Department[]> => {
    const response = await axiosClient.get<Department[]>('/departments');
    return response.data;
  },
  getById: async (id: number): Promise<Department> => {
    const response = await axiosClient.get<Department>(`/departments/${id}`);
    return response.data;
  },
  create: async (data: DepartmentCreatePayload): Promise<DepartmentCreationResponse> => {
    const response = await axiosClient.post<DepartmentCreationResponse>('/departments', data);
    return response.data;
  },
  update: async (id: number, data: DepartmentUpdatePayload): Promise<{ message: string } & Partial<Department>> => {
    const response = await axiosClient.put<{ message: string } & Partial<Department>>(`/departments/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await axiosClient.delete<{ message: string }>(`/departments/${id}`);
    return response.data;
  },
  search: async (searchTerm: string): Promise<Department[]> => {
    const response = await axiosClient.get<Department[]>('/departments/search', { params: { searchTerm } });
    return response.data;
  },
};

export default departmentService; 