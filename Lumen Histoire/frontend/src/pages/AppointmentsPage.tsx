import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuCalendar,
  LuClock,
  LuLoader,
  LuTriangle,
  LuCheck,
  LuX,
  LuStar,
  LuUser,
  LuStethoscope,
  LuMapPin,
  LuPhone,
  LuFilter,
  LuSearch,
} from "react-icons/lu";
import appointmentService, { Appointment } from "../api/appointmentService";
import ReviewModal from "../components/ReviewModal";

const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState<number | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | Appointment["status"]
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userJson = localStorage.getItem("userInfo");
    if (!userJson) {
      navigate("/client/login");
      return;
    }

    const fetchAppointments = async () => {
      try {
        const data = await appointmentService.getMyAppointments();
        setAppointments(data);
        setFilteredAppointments(data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Không thể tải danh sách lịch hẹn."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate]);

  // Filter appointments based on status and search query
  useEffect(() => {
    let filtered = appointments;

    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (apt) =>
          apt.service?.title
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          apt.doctor?.full_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAppointments(filtered);
  }, [appointments, statusFilter, searchQuery]);

  const handleCancel = async (appointmentId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn này?")) {
      return;
    }

    setCancelLoading(appointmentId);
    try {
      await appointmentService.cancelAppointment(appointmentId);
      setAppointments(
        appointments.map((apt) =>
          apt.id === appointmentId
            ? { ...apt, status: "cancelled" as const }
            : apt
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể hủy lịch hẹn.");
    } finally {
      setCancelLoading(null);
    }
  };

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "pending":
        return "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200";
      case "confirmed":
        return "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200";
      case "rescheduled":
        return "bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200";
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: Appointment["status"]) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "completed":
        return "Đã hoàn thành";
      case "cancelled":
        return "Đã hủy";
      case "rescheduled":
        return "Đã dời lịch";
      default:
        return status;
    }
  };

  const getProgressPercentage = (appointment: Appointment) => {
    if (!appointment.progress) return 0;
    return Math.round(
      (appointment.progress.completed_sessions /
        appointment.progress.total_sessions) *
        100
    );
  };

  const formatDate = (dateString: string) => {
    try {
      let date = new Date(dateString);
      // Nếu là UTC (có Z), cộng thêm 7 tiếng
      if (dateString.endsWith("Z")) {
        date = new Date(date.getTime() + 0 * 60 * 60 * 1000);
      }
      return date.toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (err) {
      console.error("Error formatting date:", err);
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusOptions = [
    { value: "all", label: "Tất cả", count: appointments.length },
    {
      value: "pending",
      label: "Chờ xác nhận",
      count: appointments.filter((a) => a.status === "pending").length,
    },
    {
      value: "confirmed",
      label: "Đã xác nhận",
      count: appointments.filter((a) => a.status === "confirmed").length,
    },
    {
      value: "completed",
      label: "Đã hoàn thành",
      count: appointments.filter((a) => a.status === "completed").length,
    },
    {
      value: "cancelled",
      label: "Đã hủy",
      count: appointments.filter((a) => a.status === "cancelled").length,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">
            Đang tải lịch hẹn...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Lịch hẹn của tôi</h1>
            <p className="text-gray-600 text-lg">
              Quản lý và theo dõi các buổi tư vấn của bạn
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 border border-red-200 rounded-[16px] flex items-center text-red-700 shadow-sm">
              <LuTriangle className="h-5 w-5 mr-3 text-red-500" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Filter and Search Section */}
          <div className="bg-white rounded-[16px] shadow-md border border-gray-100 p-6 mb-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Status Filter */}
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value as any)}
                    className={`px-4 py-2 rounded-full text-sm font-medium duration-200 ${
                      statusFilter === option.value
                        ? "bg-green-200 shadow-md transform scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option.label} ({option.count})
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm dịch vụ, bác sĩ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-[16px] focus:border-green-500 outline-none w-64"
                />
              </div>
            </div>
          </div>

          {/* Appointments Grid */}
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 max-w-md mx-auto">
                <LuCalendar className="h-20 w-20 mx-auto text-gray-300 mb-6" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {appointments.length === 0
                    ? "Chưa có lịch hẹn nào"
                    : "Không tìm thấy lịch hẹn"}
                </h3>
                <p className="text-gray-600">
                  {appointments.length === 0
                    ? "Hãy đặt lịch tư vấn để bắt đầu hành trình chăm sóc sức khỏe tinh thần của bạn."
                    : "Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mx-auto max-w-7xl px-4">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white rounded-[16px] shadow-md hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="bg-mint p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold leading-tight">
                        {appointment.service?.title || "Dịch vụ không xác định"}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status === "confirmed" && (
                          <LuCheck className="inline h-3 w-3 mr-1" />
                        )}
                        {appointment.status === "cancelled" && (
                          <LuX className="inline h-3 w-3 mr-1" />
                        )}
                        {getStatusText(appointment.status)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {appointment.progress && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Tiến độ điều trị</span>
                          <span>
                            {appointment.progress.completed_sessions}/
                            {appointment.progress.total_sessions} buổi
                          </span>
                        </div>
                        <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                          <div
                            className="bg-white h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${getProgressPercentage(appointment)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    {/* Date & Time */}
                    <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
                      <LuCalendar className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {formatDate(appointment.scheduled_at)}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <LuClock className="h-4 w-4 mr-1" />
                          {formatTime(appointment.scheduled_at)}
                        </p>
                      </div>
                    </div>

                    {/* Doctor Info */}
                    <div className="flex items-center mb-4 p-3 bg-blue-50 rounded-lg">
                      <LuStethoscope className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {appointment.doctor?.full_name || "Chưa phân công"}
                        </p>
                        {appointment.doctor?.specialty && (
                          <p className="text-sm text-gray-600">
                            {appointment.doctor.specialty}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Session Number */}
                    <div className="flex items-center mb-4">
                      <LuMapPin className="h-5 w-5 text-green-500 mr-3" />
                      <span className="font-medium text-gray-700">
                        Buổi số {appointment.session_number || 1}
                      </span>
                    </div>

                    {/* Notes */}
                    {appointment.notes && (
                      <div className="mb-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Ghi chú: </span>
                          {appointment.notes}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                      {(appointment.status === "pending" ||
                        appointment.status === "confirmed") && (
                        <button
                          onClick={() => handleCancel(appointment.id)}
                          disabled={cancelLoading === appointment.id}
                          className="flex-1 bg-red-300 py-2 px-4 rounded-[16px] font-medium hover:bg-red-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                        >
                          {cancelLoading === appointment.id ? (
                            <span className="flex items-center justify-center">
                              <LuLoader className="animate-spin h-4 w-4 mr-2" />
                              Đang hủy...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center">
                              <LuX className="h-4 w-4 mr-2" />
                              Hủy lịch hẹn
                            </span>
                          )}
                        </button>
                      )}

                      {appointment.status === "completed" && (
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setReviewModalOpen(true);
                          }}
                          className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105"
                        >
                          <span className="flex items-center justify-center">
                            <LuStar className="h-4 w-4 mr-2" />
                            Đánh giá
                          </span>
                        </button>
                      )}

                      {/* Contact Button */}
                      {appointment.status === "confirmed" && (
                        <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-4 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105">
                          <LuPhone className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedAppointment(null);
        }}
        appointmentId={selectedAppointment?.id ?? 0}
        clientId={selectedAppointment?.client_id ?? 0}
        onSuccess={() => {
          // Refresh appointments after successful review
          const fetchAppointments = async () => {
            try {
              const data = await appointmentService.getMyAppointments();
              setAppointments(data);
              setFilteredAppointments(data);
            } catch (err: any) {
              setError(
                err.response?.data?.message ||
                  "Không thể tải danh sách lịch hẹn."
              );
            }
          };
          fetchAppointments();
        }}
      />
    </>
  );
};

export default AppointmentsPage;
