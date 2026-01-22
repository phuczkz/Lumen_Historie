import axiosClient from './axiosClient';
import { Doctor } from './doctorService';
import { Service } from './serviceService';

export interface Appointment {
  id: number;
  order_id: number;
  client_id: number;
  doctor_id: number;
  service_id: number;
  session_number: number;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  completion_notes?: string;
  created_at: string;
  updated_at: string;
  availability_id?: number;
  
  // Joined data
  doctor?: Doctor;
  service?: Service;
  
  // Progress data from orders
  progress?: {
    completed_sessions: number;
    total_sessions: number;
  };
}

export interface AppointmentsByDoctorResponse {
  appointments: AppointmentWithClient[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AppointmentWithClient {
  id: number;
  order_id: number;
  session_number: number;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  completion_notes?: string;
  created_at: string;
  updated_at: string;
  client_name: string;
  client_email: string;
  service_title: string;
  service_price: number;
  number_of_sessions: number;
  completed_sessions: number;
}

const appointmentService = {
  getMyAppointments: async (): Promise<Appointment[]> => {
    const response = await axiosClient.get<Appointment[]>('/appointments/my');
    return response.data;
  },

  cancelAppointment: async (id: number): Promise<void> => {
    await axiosClient.put(`/appointments/${id}/cancel`);
  },

  getAppointmentsByDoctorId: async (doctorId: number, page: number = 1, limit: number = 10): Promise<AppointmentsByDoctorResponse> => {
    const response = await axiosClient.get<AppointmentsByDoctorResponse>(`/appointments/doctor/${doctorId}?page=${page}&limit=${limit}`);
    return response.data;
  },
};

export default appointmentService;
