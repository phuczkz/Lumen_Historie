import axiosClient from './axiosClient';
import { Session } from './sessionService';

// Define types for Order data
export type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentMethod = 'card' | 'paypal' | 'cash' | null;
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: number;
  client_id: number;
  doctor_id: number;
  service_id: number;
  number_of_sessions: number;
  completed_sessions?: number;
  status: OrderStatus;
  notes?: string | null;
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  paid_at?: string | null; // DateTime string
  started_at?: string | null;
  completed_at?: string | null;
  order_created_at?: string; // Renamed from created_at in backend response
  order_updated_at?: string; // Renamed from updated_at in backend response

  // Expanded details from backend joins
  client_name?: string;
  client_email?: string;
  doctor_name?: string;
  doctor_email?: string;
  service_name?: string;
  service_price?: number;
  service_duration?: number;
  sessions?: Session[]; // Array of associated sessions
  appointments?: Appointment[]; // Array of associated appointments
}

export interface OrderCreatePayload {
  client_id: number;
  doctor_id: number;
  service_id: number;
  number_of_sessions: number;
  notes?: string | null;
  amount: number;
  payment_method?: PaymentMethod;
  payment_status?: PaymentStatus;
  paid_at?: string | null; // Optional: If payment made at creation
  availability_ids?: number[]; // Array of doctor_availability IDs for specific time slots
}

export interface OrderUpdatePayload {
  status?: OrderStatus;
  notes?: string | null;
  payment_method?: PaymentMethod;
  payment_status?: PaymentStatus;
  paid_at?: string | null;
  number_of_sessions?: number;
  amount?: number;
}

// Backend returns the full order data on creation
export type OrderCreationResponse = Order & { message: string; orderId: number; }; 

// Appointment interface
export interface Appointment {
  id: number;
  order_id: number;
  session_number: number;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  completion_notes?: string;
  created_at: string;
  updated_at: string;
  availability_id?: number;
  // Thông tin từ doctor_availability
  available_date?: string;
  start_time?: string;
  end_time?: string;
  availability_status?: 'available' | 'unavailable' | 'booked';
}

const orderService = {
  getAll: async (): Promise<Order[]> => {
    const response = await axiosClient.get<Order[]>('/orders');
    return response.data;
  },
  getById: async (id: number): Promise<Order> => {
    const response = await axiosClient.get<Order>(`/orders/${id}`);
    return response.data;
  },
  create: async (data: OrderCreatePayload): Promise<OrderCreationResponse> => {
    const response = await axiosClient.post<OrderCreationResponse>('/orders', data);
    return response.data;
  },
  update: async (id: number, data: OrderUpdatePayload): Promise<{ message: string } & Partial<Order>> => {
    const response = await axiosClient.put<{ message: string } & Partial<Order>>(`/orders/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await axiosClient.delete<{ message: string }>(`/orders/${id}`);
    return response.data;
  },
  updateStatus: async (id: number, status: OrderStatus): Promise<{ message: string } & Partial<Order>> => {
    const response = await axiosClient.patch<{ message: string } & Partial<Order>>(`/orders/${id}/status`, { status });
    return response.data;
  },
};

export default orderService; 