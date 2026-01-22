import axiosClient from './axiosClient';

// Define types for DoctorAvailability data
export type AvailabilityStatus = 'available' | 'blocked';

export interface DoctorAvailability {
  id: number;
  doctor_id: number;
  available_date: string; // YYYY-MM-DD
  start_time: string;     // HH:MM:SS or HH:MM
  end_time: string;       // HH:MM:SS or HH:MM
  status: AvailabilityStatus;
  is_active: boolean;
  // Joined data
  doctor_name?: string;
}

export interface DoctorAvailabilityCreatePayload {
  doctor_id: number;
  available_date: string; // YYYY-MM-DD
  start_time: string;     // HH:MM or HH:MM:SS
  end_time: string;       // HH:MM or HH:MM:SS
  status?: AvailabilityStatus;
  is_active?: boolean;
}

export interface DoctorAvailabilityUpdatePayload {
  available_date?: string; // YYYY-MM-DD
  start_time?: string;     // HH:MM or HH:MM:SS
  end_time?: string;       // HH:MM or HH:MM:SS
  status?: AvailabilityStatus;
  is_active?: boolean;
}

// Backend returns the full availability data on creation
export type DoctorAvailabilityCreationResponse = DoctorAvailability & { message: string; availabilityId: number; };

export interface GetDoctorAvailabilityParams {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  status?: AvailabilityStatus;
  isActive?: boolean;
}

const doctorAvailabilityService = {
  // Note: Backend route is /api/availability/doctor/:doctorId
  getByDoctorId: async (doctorId: number, params?: GetDoctorAvailabilityParams): Promise<DoctorAvailability[]> => {
    const response = await axiosClient.get<DoctorAvailability[]>(`/availability/doctor/${doctorId}`, { params });
    return response.data;
  },
  getById: async (id: number): Promise<DoctorAvailability> => {
    const response = await axiosClient.get<DoctorAvailability>(`/availability/${id}`);
    return response.data;
  },
  create: async (data: DoctorAvailabilityCreatePayload): Promise<DoctorAvailabilityCreationResponse> => {
    const response = await axiosClient.post<DoctorAvailabilityCreationResponse>('/availability', data);
    return response.data;
  },
  update: async (id: number, data: DoctorAvailabilityUpdatePayload): Promise<{ message: string } & Partial<DoctorAvailability>> => {
    const response = await axiosClient.put<{ message: string } & Partial<DoctorAvailability>>(`/availability/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await axiosClient.delete<{ message: string }>(`/availability/${id}`);
    return response.data;
  },
};

export default doctorAvailabilityService; 