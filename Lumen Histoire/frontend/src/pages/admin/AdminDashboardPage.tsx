import React, { useEffect, useState } from "react";
import PatientAgeDonutChart from "../../components/charts/PatientAgeDonutChart";
import { useNavigate } from "react-router-dom";
import dashboardService, {
  DashboardStats,
  RecentActivity,
  TodaySchedule,
  TotalInvoiceStats,
  PatientAgeData,
  RevenueChartData,
  PatientOverviewByDepartments,
  PaymentStatusDistribution,
  MonthlyRevenueTrend,
  TopDoctor,
  ServiceRating,
} from "../../api/dashboardService";
import {
  LuDollarSign,
  LuUsers,
  LuCalendar,
  LuTrendingUp,
  LuClock,
  LuCheck,
  LuTriangle,
  LuStar,
  LuCreditCard,
  LuUserCheck,
} from "react-icons/lu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [schedule, setSchedule] = useState<TodaySchedule[]>([]);
  const [invoiceStats, setInvoiceStats] = useState<TotalInvoiceStats | null>(
    null
  );
  const [patientAgeData, setPatientAgeData] = useState<PatientAgeData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueChartData[]>([]);
  const [departmentData, setDepartmentData] =
    useState<PatientOverviewByDepartments | null>(null);
  const [paymentDistribution, setPaymentDistribution] =
    useState<PaymentStatusDistribution | null>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyRevenueTrend[]>([]);
  const [topDoctors, setTopDoctors] = useState<TopDoctor[]>([]);
  const [serviceRatings, setServiceRatings] = useState<ServiceRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          statsData,
          activitiesData,
          scheduleData,
          invoiceStatsData,
          patientAgeResult,
          revenueResult,
          departmentResult,
          paymentDistributionResult,
          monthlyTrendResult,
          topDoctorsResult,
          serviceRatingsResult,
        ] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getRecentActivities(8),
          dashboardService.getTodaySchedule(),
          dashboardService.getTotalInvoiceStats(),
          dashboardService.getPatientOverviewByAge(),
          dashboardService.getWeeklyRevenueChart(),
          dashboardService.getPatientOverviewByDepartments(),
          dashboardService.getPaymentStatusDistribution(),
          dashboardService.getMonthlyRevenueTrend(),
          dashboardService.getTopDoctorsByPatients(),
          dashboardService.getServiceRatingsOverview(),
        ]);

        setStats(statsData);
        setActivities(activitiesData);
        setSchedule(scheduleData);

        console.log("Dữ liệu lịch:", scheduleData);
        setInvoiceStats(invoiceStatsData);
        setPatientAgeData(patientAgeResult);
        setRevenueData(revenueResult);
        setDepartmentData(departmentResult);
        setPaymentDistribution(paymentDistributionResult);
        setMonthlyTrend(monthlyTrendResult);
        setTopDoctors(topDoctorsResult);
        setServiceRatings(serviceRatingsResult);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Không thể tải dữ liệu dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <LuCalendar className="h-4 w-4" />;
      case "payment":
        return <LuCreditCard className="h-4 w-4" />;
      case "review":
        return <LuStar className="h-4 w-4" />;
      default:
        return <LuCheck className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "appointment":
        return "bg-blue-100 text-blue-600";
      case "payment":
        return "bg-green-100 text-green-600";
      case "review":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getActivityText = (activity: RecentActivity) => {
    switch (activity.type) {
      case "appointment":
        return `${activity.client_name} đã đặt lịch với ${activity.doctor_name}`;
      case "payment":
        return `${activity.client_name} đã thanh toán cho ${activity.service_name}`;
      case "review":
        return `${activity.client_name} đã đánh giá ${activity.doctor_name}`;
      default:
        return "Hoạt động mới";
    }
  };

  function getVietnameseDateString() {
    const days = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];
    const now = new Date();
    const dayOfWeek = days[now.getDay()];
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    return `${dayOfWeek}, ngày ${day} tháng ${month} năm ${year}`;
  }

  const AGE_LABELS: Record<"Child" | "Adult" | "Elderly", string> = {
    Child: "Trẻ em",
    Adult: "Người lớn",
    Elderly: "Người cao tuổi",
  };

  const AGE_COLORS: Record<"Child" | "Adult" | "Elderly", string> = {
    Child: "#A78BFA", // Tím
    Adult: "#6EE7B7", // Xanh
    Elderly: "#FCD34D", // Vàng
  };

  // Tổng số khách hàng (sau khi có dữ liệu)
  const total = patientAgeData.reduce((sum, a) => sum + a.patient_count, 0);

  // Luôn đảm bảo 3 lớp
  const allAgeGroups: ("Child" | "Adult" | "Elderly")[] = [
    "Child",
    "Adult",
    "Elderly",
  ];

  const ringData = allAgeGroups.map((group) => {
    const found = patientAgeData.find((d) => d.age_group === group);
    const count = found ? found.patient_count : 0;

    return {
      age_group: group,
      label: AGE_LABELS[group],
      color: AGE_COLORS[group],
      value: count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
      data: [
        { name: "shown", value: count },
        { name: "blank", value: total - count },
      ],
    };
  });

  // Chart colors
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff7f"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">
            Đang tải dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex justify-center items-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
          <LuTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">
            Lỗi tải dữ liệu
          </h3>
          <p className="text-gray-600 text-center">{error}</p>
        </div>
      </div>
    );
  }
  const isToday = (dateString: string): boolean => {
    const date = new Date(dateString);
    const now = new Date();

    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  const todaySchedule = schedule.filter((appointment) =>
    isToday(appointment.scheduled_at)
  );
  return (
    <div className="min-h-screen bg-background rounded-[16px] mb-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* First Row - Stats Cards */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          {/* Stats Cards (trở về 1 dòng 4 ô) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card: Doanh thu */}
            <div className="bg-white rounded-[16px] p-6 h-32 border border-gray-100 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <LuDollarSign className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">
                  Doanh thu
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                {formatCurrency(stats?.monthlyRevenue || 0)}
              </h3>
              <p className="text-sm text-gray-500">Tháng này</p>
            </div>

            {/* Card: Số khách hàng */}
            <div className="bg-white rounded-[16px] p-6 h-32 border border-gray-100 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <LuUsers className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Số khách hàng
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                {stats?.totalClients.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-500">Tổng số khách hàng</p>
            </div>

            {/* Card: Gói dịch vụ */}
            <div className="bg-white rounded-[16px] p-6 h-32 border border-gray-100 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <LuTrendingUp className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">
                  Gói dịch vụ
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                {stats?.totalServices}
              </h3>
              <p className="text-sm text-gray-500">Tổng gói dịch vụ</p>
            </div>

            {/* Card: Lịch hôm nay */}
            <div className="bg-white rounded-[16px] p-6 h-32 border border-gray-100 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <LuCalendar className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Lịch hôm nay
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                {stats?.appointmentsToday}
              </h3>
              <p className="text-sm text-gray-500">Số lịch hẹn</p>
            </div>
          </div>

          {/* PatientAgeDonutChart giữ nguyên bên dưới */}
          <div className="bg-white rounded-[16px] shadow-md px-6 py-5 w-full mb-6">
            <div className="col-span-2">
              <PatientAgeDonutChart ringData={ringData} />
            </div>
          </div>
        </div>

        {/* Recent Activity + Lịch làm việc */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-[16px] shadow-md border border-gray-200 overflow-hidden">
            <div className="pt-4 pl-5">
              <h2 className="text-lg font-bold">Hoạt động gần đây</h2>
            </div>
            <div className="p-4 pb-4 max-h-64 overflow-y-auto space-y-4">
              {activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-[16px] ${getActivityColor(
                        activity.type
                      )}`}
                    >
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 mb-1">
                        {getActivityText(activity)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <LuClock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Chưa có hoạt động nào gần đây</p>
                </div>
              )}
            </div>
          </div>

          {/* Lịch làm việc hôm nay */}
          <div className="bg-white rounded-[16px] shadow-md border border-gray-100 overflow-hidden ">
            <div className="pt-4 pl-5 bg-white">
              <h2 className="text-lg font-bold mb-1">Lịch tham vấn hôm nay</h2>
              <p className="text-xs ">{getVietnameseDateString()}</p>
            </div>
            <div className="p-4 max-h-64 overflow-y-auto space-y-3">
              {todaySchedule.length > 0 ? (
                todaySchedule.slice(0, 6).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center border border-gray-300 space-x-3 p-3 rounded-[16px] hover:bg-gray-50 transition-all duration-200"
                  >
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 ">
                        <p className="text-sm font-semibold">
                          {appointment.doctor_name}
                        </p>
                        <span className="text-xs font-semibold bg-red-100 px-1.5 py-1 rounded-full">
                          Room{" "}
                          {appointment.session_number
                            .toString()
                            .padStart(3, "0")}
                        </span>
                      </div>
                      <p className="text-xs mb-1">{appointment.client_name}</p>
                      <p className="text-xs font-medium">
                        {formatTime(appointment.scheduled_at)} -{" "}
                        {appointment.end_time || "10:30AM"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <LuCalendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    Không có lịch hẹn hôm nay
                  </p>
                </div>
              )}
            </div>
            {todaySchedule.length > 0 && (
              <div className="p-4">
                <button
                  onClick={() => navigate("/admin/schedule")}
                  className="w-full bg-green-100 hover:bg-green-200 font-medium py-2 px-3 rounded-[16px] "
                >
                  Xem tất cả
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Second Row - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Patient Overview by Services */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Khách hàng theo dịch vụ
            </h2>
            <p className="text-sm text-gray-600">
              Tổng: {departmentData?.totalPatients?.toLocaleString() || "0"}{" "}
              khách hàng
            </p>
          </div>
          <div className="h-80">
            {departmentData?.departments &&
            departmentData.departments.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData.departments}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="patient_count"
                    nameKey="department"
                  >
                    {departmentData.departments.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <LuUserCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Chưa có dữ liệu khách hàng theo dịch vụ
                  </p>
                </div>
              </div>
            )}
          </div>
          {departmentData?.departments &&
            departmentData.departments.length > 0 && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {departmentData.departments.map((dept, index) => (
                  <div
                    key={dept.department}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-gray-700">{dept.department}</span>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Service Ratings */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Đánh giá dịch vụ
            </h2>
            <p className="text-sm text-gray-600">
              Rating trung bình các dịch vụ
            </p>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {serviceRatings && serviceRatings.length > 0 ? (
              serviceRatings.slice(0, 8).map((service, index) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 text-sm">
                      {service.service_name}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <LuStar
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.round(service.average_rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">
                        {service.average_rating.toFixed(1)} (
                        {service.total_reviews} đánh giá)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      {formatCurrency(service.price)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {service.total_patients} khách hàng
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <LuStar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Chưa có dữ liệu đánh giá dịch vụ
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
