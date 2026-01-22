import axiosClient from './axiosClient';

// Define types for Review data
export interface Review {
  client: any;
  id: number;
  appointment_id: number;
  client_id: number;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string | null;
  created_at?: string;
  // Joined data from backend
  customer_name?: string; // from client.full_name (for general reviews)
  client_name?: string; // from client.full_name (for doctor reviews)
  date_time?: string; // from appointment.scheduled_at
  appointment_date?: string; // from appointment.scheduled_at (for doctor reviews)
  service_id?: number; // from service.id
  service_name: string; // from service.name
  expert_id?: number; // from doctor.id
  expert_name?: string; // from doctor.full_name
  session_number?: number; // from appointment.session_number
}

export interface ReviewCreatePayload {
  appointment_id: number;
  client_id: number;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string | null;
}

export interface ReviewUpdatePayload {
  rating?: 1 | 2 | 3 | 4 | 5;
  comment?: string | null;
}

// Backend returns the full review data on creation
export type ReviewCreationResponse = Review & { message: string; reviewId: number; };

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  totalPages: number;
}

const reviewService = {
  // Get reviews by appointment ID
  getByAppointmentId: async (appointmentId: number): Promise<Review[]> => {
    const response = await axiosClient.get<Review[]>(`/reviews/appointment/${appointmentId}`);
    return response.data;
  },
  getById: async (id: number): Promise<Review> => {
    const response = await axiosClient.get<Review>(`/reviews/${id}`);
    return response.data;
  },
  create: async (data: ReviewCreatePayload): Promise<ReviewCreationResponse> => {
    const response = await axiosClient.post<ReviewCreationResponse>('/reviews', data);
    return response.data;
  },
  update: async (id: number, data: ReviewUpdatePayload): Promise<{ message: string } & Partial<Review>> => {
    const response = await axiosClient.put<{ message: string } & Partial<Review>>(`/reviews/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await axiosClient.delete<{ message: string }>(`/reviews/${id}`);
    return response.data;
  },
  // Get all reviews with pagination and search
  getAll: async (page: number = 1, limit: number = 7, search: string = '', expertId?: string, serviceId?: string): Promise<ReviewsResponse> => {
    let url = `/reviews?page=${page}&limit=${limit}&search=${search}`;
    if (expertId) url += `&expert=${expertId}`;
    if (serviceId) url += `&service=${serviceId}`;
    const response = await axiosClient.get<ReviewsResponse>(url);
    return response.data;
  },
  // Get reviews for a specific doctor
  getByDoctorId: async (doctorId: number): Promise<Review[]> => {
    const response = await axiosClient.get<Review[]>(`/reviews/doctor/${doctorId}`);
    return response.data;
  },
};

export default reviewService; 