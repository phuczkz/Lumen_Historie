import axiosClient from './axiosClient';

// Define types for Session data
export type SessionStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Session {
  id: number;
  order_id: number;
  scheduled_at: string; // DateTime string
  status: SessionStatus;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  // Fields from JOIN with orders for context, if needed by frontend directly
  client_id?: number;
  doctor_id?: number;
}

export interface SessionCreatePayload {
  order_id: number;
  scheduled_at: string; // ISO string for datetime
  notes?: string | null;
  status?: SessionStatus;
}

export interface SessionUpdatePayload {
  scheduled_at?: string; // ISO string for datetime
  status?: SessionStatus;
  notes?: string | null;
}

// Backend returns the full session data on creation
export type SessionCreationResponse = Session & { message: string; sessionId: number; };

const sessionService = {
  // Note: Backend has getSessionsByOrderId under /api/sessions/order/:orderId
  getByOrderId: async (orderId: number): Promise<Session[]> => {
    const response = await axiosClient.get<Session[]>(`/sessions/order/${orderId}`);
    return response.data;
  },
  getById: async (id: number): Promise<Session> => {
    const response = await axiosClient.get<Session>(`/sessions/${id}`);
    return response.data;
  },
  create: async (data: SessionCreatePayload): Promise<SessionCreationResponse> => {
    const response = await axiosClient.post<SessionCreationResponse>('/sessions', data);
    return response.data;
  },
  update: async (id: number, data: SessionUpdatePayload): Promise<{ message: string } & Partial<Session>> => {
    const response = await axiosClient.put<{ message: string } & Partial<Session>>(`/sessions/${id}`, data);
    return response.data;
  },
  updateStatus: async (id: number, status: SessionStatus): Promise<{ message: string } & Partial<Session>> => {
    const response = await axiosClient.patch<{ message: string } & Partial<Session>>(`/sessions/${id}/status`, { status });
    return response.data;
  },
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await axiosClient.delete<{ message: string }>(`/sessions/${id}`);
    return response.data;
  },
};

export default sessionService; 