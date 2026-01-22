import axiosClient from './axiosClient';

// Define types for Reminder data
export type ReminderType = 'email' | 'sms' | 'push';
export type ReminderStatus = 'pending' | 'sent' | 'failed';

export interface Reminder {
  id: number;
  client_id: number;
  session_id: number;
  type: ReminderType;
  scheduled_send: string; // DateTime string
  sent_at?: string | null; // DateTime string
  status: ReminderStatus;
  created_at?: string; // Assuming this is returned from backend, though not in POST/PUT explicitly always
  // Joined data
  client_name?: string;
  session_scheduled_at?: string;
}

export interface ReminderCreatePayload {
  client_id: number;
  session_id: number;
  type: ReminderType;
  scheduled_send: string; // ISO string for datetime
  status?: ReminderStatus;
}

export interface ReminderUpdatePayload {
  type?: ReminderType;
  scheduled_send?: string; // ISO string for datetime
  status?: ReminderStatus;
  sent_at?: string | null; // ISO string for datetime or null
}

// Backend returns the full reminder data on creation
export type ReminderCreationResponse = Reminder & { message: string; reminderId: number; };

export interface GetAllRemindersParams {
  clientId?: number;
  sessionId?: number;
}

const reminderService = {
  // Note: Backend has getAllReminders at /api/reminders with optional query params
  getAll: async (params?: GetAllRemindersParams): Promise<Reminder[]> => {
    const response = await axiosClient.get<Reminder[]>('/reminders', { params });
    return response.data;
  },
  getById: async (id: number): Promise<Reminder> => {
    const response = await axiosClient.get<Reminder>(`/reminders/${id}`);
    return response.data;
  },
  create: async (data: ReminderCreatePayload): Promise<ReminderCreationResponse> => {
    const response = await axiosClient.post<ReminderCreationResponse>('/reminders', data);
    return response.data;
  },
  update: async (id: number, data: ReminderUpdatePayload): Promise<{ message: string } & Partial<Reminder>> => {
    const response = await axiosClient.put<{ message: string } & Partial<Reminder>>(`/reminders/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await axiosClient.delete<{ message: string }>(`/reminders/${id}`);
    return response.data;
  },
};

export default reminderService; 