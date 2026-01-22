import axiosClient from './axiosClient';

export interface DashboardStats {
  totalRevenue: number;
  totalClients: number;
  totalServices: number;
  appointmentsToday: number;
  monthlyRevenue: number;
  inProgressCount: number;
}

export interface RecentActivity {
  type: 'appointment' | 'payment' | 'review';
  id: number;
  timestamp: string;
  status: string;
  client_name: string;
  doctor_name: string;
  service_name: string;
  created_at: string;
}

export interface TodaySchedule {
  id: number;
  scheduled_at: string;
  status: string;
  session_number: number;
  client_name: string;
  doctor_name: string;
  service_name: string;
  start_time?: string;
  end_time?: string;
}

export interface RevenueChart {
  month: string;
  revenue: number;
  orders_count: number;
}

export interface AppointmentDistribution {
  status: string;
  count: number;
}

export interface TotalInvoiceStats {
  totalInvoices: number;
  totalAmount: number;
  todayInvoices: number;
  yesterdayInvoices: number;
  growthRate: number;
}

export interface PatientAgeData {
  month: string;
  age_group: 'Child' | 'Adult' | 'Elderly';
  patient_count: number;
}

export interface RevenueChartData {
  day_name: string;
  date: string;
  income: number;
  expense: number;
}

export interface DepartmentData {
  department: string;
  patient_count: number;
  percentage: number;
}

export interface PatientOverviewByDepartments {
  totalPatients: number;
  departments: DepartmentData[];
}

export interface PaymentStatusData {
  payment_status: string;
  count: number;
  total_amount: number;
  percentage: number;
}

export interface PaymentStatusDistribution {
  totalOrders: number;
  distribution: PaymentStatusData[];
}

export interface MonthlyRevenueTrend {
  month: string;
  month_name: string;
  orders_count: number;
  revenue: number;
  total_amount: number;
}

export interface TopDoctor {
  id: number;
  doctor_name: string;
  specialty: string;
  patient_count: number;
  total_orders: number;
  total_revenue: number;
}

export interface ServiceRating {
  id: number;
  service_name: string;
  price: number;
  total_reviews: number;
  average_rating: number;
  total_patients: number;
}

const dashboardService = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await axiosClient.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },

  // Get recent activities
  getRecentActivities: async (limit: number = 10): Promise<RecentActivity[]> => {
    const response = await axiosClient.get<RecentActivity[]>(`/dashboard/activities?limit=${limit}`);
    return response.data;
  },

  // Get today's schedule
  getTodaySchedule: async (): Promise<TodaySchedule[]> => {
    const response = await axiosClient.get<TodaySchedule[]>('/dashboard/schedule');
    return response.data;
  },

  // Get revenue chart data
  getRevenueChart: async (): Promise<RevenueChart[]> => {
    const response = await axiosClient.get<RevenueChart[]>('/dashboard/revenue-chart');
    return response.data;
  },

  // Get appointments distribution
  getAppointmentsDistribution: async (): Promise<AppointmentDistribution[]> => {
    const response = await axiosClient.get<AppointmentDistribution[]>('/dashboard/appointments-distribution');
    return response.data;
  },

  // Get total invoice statistics
  getTotalInvoiceStats: async (): Promise<TotalInvoiceStats> => {
    const response = await axiosClient.get<TotalInvoiceStats>('/dashboard/total-invoice-stats');
    return response.data;
  },

  // Get patient overview by age
  getPatientOverviewByAge: async (): Promise<PatientAgeData[]> => {
    const response = await axiosClient.get<PatientAgeData[]>('/dashboard/patient-overview-by-age');
    return response.data;
  },

  // Get revenue chart data (weekly)
  getWeeklyRevenueChart: async (): Promise<RevenueChartData[]> => {
    const response = await axiosClient.get<RevenueChartData[]>('/dashboard/revenue-chart');
    return response.data;
  },

  // Get patient overview by departments
  getPatientOverviewByDepartments: async (): Promise<PatientOverviewByDepartments> => {
    const response = await axiosClient.get<PatientOverviewByDepartments>('/dashboard/patient-overview-by-departments');
    return response.data;
  },

  // Get payment status distribution
  getPaymentStatusDistribution: async (): Promise<PaymentStatusDistribution> => {
    const response = await axiosClient.get<PaymentStatusDistribution>('/dashboard/payment-status-distribution');
    return response.data;
  },

  // Get monthly revenue trend
  getMonthlyRevenueTrend: async (): Promise<MonthlyRevenueTrend[]> => {
    const response = await axiosClient.get<MonthlyRevenueTrend[]>('/dashboard/monthly-revenue-trend');
    return response.data;
  },

  // Get top doctors by patients
  getTopDoctorsByPatients: async (): Promise<TopDoctor[]> => {
    const response = await axiosClient.get<TopDoctor[]>('/dashboard/top-doctors-by-patients');
    return response.data;
  },

  // Get service ratings overview
  getServiceRatingsOverview: async (): Promise<ServiceRating[]> => {
    const response = await axiosClient.get<ServiceRating[]>('/dashboard/service-ratings-overview');
    return response.data;
  }
};

export default dashboardService;
