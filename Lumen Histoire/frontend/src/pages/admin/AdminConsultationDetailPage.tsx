import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  LuArrowLeft,
  LuLoader,
  LuCalendar,
  LuClock,
  LuUser,
  LuBanknote,
  LuClipboard,
  LuCheck,
  LuX,
  LuChevronDown,
  LuChevronUp,
} from "react-icons/lu";
import orderService, {
  Order,
  OrderStatus,
  Appointment,
} from "../../api/orderService";
import axiosClient from "../../api/axiosClient";
import { format } from "date-fns";

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "confirmed":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "in_progress":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    case "rescheduled":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "Chờ xác nhận";
    case "confirmed":
      return "Đã xác nhận";
    case "in_progress":
      return "Đang tiến hành";
    case "completed":
      return "Đã hoàn thành";
    case "cancelled":
      return "Đã hủy";
    case "rescheduled":
      return "Đã dời lịch";
    default:
      return "Không xác định";
  }
};

const getPaymentStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "Chờ thanh toán";
    case "paid":
      return "Đã thanh toán";
    case "failed":
      return "Thanh toán thất bại";
    case "refunded":
      return "Đã hoàn tiền";
    default:
      return "Không xác định";
  }
};

interface AppointmentWithStatus extends Appointment {
  updating?: boolean;
}

const AdminConsultationDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [appointments, setAppointments] = useState<AppointmentWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      if (!orderId) {
        setError("ID đơn tư vấn không hợp lệ");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const orderData = await orderService.getById(parseInt(orderId));
        setOrder(orderData);

        // Get appointments cho order này
        if (orderData.appointments && Array.isArray(orderData.appointments)) {
          setAppointments(orderData.appointments);
        } else {
          setAppointments([]);
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(
          err.response?.data?.message || "Không thể tải thông tin đơn tư vấn"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  const handleOrderStatusUpdate = async (status: OrderStatus) => {
    if (!order || !orderId) return;

    try {
      setUpdatingOrder(true);
      await orderService.updateStatus(parseInt(orderId), status);

      // Refresh toàn bộ data
      const orderData = await orderService.getById(parseInt(orderId));
      setOrder(orderData);
      if (orderData.appointments && Array.isArray(orderData.appointments)) {
        setAppointments(orderData.appointments);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Không thể cập nhật trạng thái đơn tư vấn"
      );
    } finally {
      setUpdatingOrder(false);
    }
  };

  const handleAppointmentStatusUpdate = async (
    appointmentId: number,
    status: string
  ) => {
    try {
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, updating: true }
            : appointment
        )
      );

      await axiosClient.put(`/appointments/${appointmentId}/status`, {
        status,
      });

      // Refresh data
      const orderData = await orderService.getById(parseInt(orderId!));
      setOrder(orderData);
      if (orderData.appointments && Array.isArray(orderData.appointments)) {
        setAppointments(orderData.appointments);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Không thể cập nhật trạng thái buổi tư vấn"
      );
      // Reset the updating state
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, updating: false }
            : appointment
        )
      );
    }
  };
  const formatDate = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split("T")[0].split("-");
      const date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        12,
        0,
        0
      );
      return date.toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (err) {
      return dateString;
    }
  };
  // Pagination logic
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = appointments.slice(
    indexOfFirstAppointment,
    indexOfLastAppointment
  );
  const totalPages = Math.ceil(appointments.length / appointmentsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <Link
          to="/admin/consultations"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <LuArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
        </Link>
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-600">
            {error || "Không tìm thấy thông tin đơn tư vấn"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen rounded-[16px]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link to="/admin/consultations" className="hover:text-blue-600">
            Ca tham vấn
          </Link>
          <span>/</span>
          <span className="text-gray-900">Đơn #{order.id}</span>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-[16px] shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Đơn tham vấn #{order.id}
                </h1>
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      order.payment_status
                    )}`}
                  >
                    {getPaymentStatusText(order.payment_status)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              {!["completed", "cancelled"].includes(order.status) && (
                <div className="flex items-center space-x-3">
                  {order.status === "pending" && (
                    <button
                      onClick={() => handleOrderStatusUpdate("confirmed")}
                      disabled={updatingOrder}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                    >
                      {updatingOrder ? (
                        <LuLoader className="animate-spin h-4 w-4 mr-2" />
                      ) : (
                        <LuCheck className="h-4 w-4 mr-2" />
                      )}
                      Xác nhận đơn
                    </button>
                  )}
                  <button
                    onClick={() => handleOrderStatusUpdate("completed")}
                    disabled={updatingOrder}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                  >
                    {updatingOrder ? (
                      <LuLoader className="animate-spin h-4 w-4 mr-2" />
                    ) : (
                      <LuCheck className="h-4 w-4 mr-2" />
                    )}
                    Hoàn thành
                  </button>
                  <button
                    onClick={() => handleOrderStatusUpdate("cancelled")}
                    disabled={updatingOrder}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                  >
                    {updatingOrder ? (
                      <LuLoader className="animate-spin h-4 w-4 mr-2" />
                    ) : (
                      <LuX className="h-4 w-4 mr-2" />
                    )}
                    Hủy đơn
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Info Grid */}
          <div className="border-t border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Client Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Khách hàng
                </h3>
                <div className="flex items-center space-x-2">
                  <LuUser className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900 font-medium">
                    {order.client_name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <LuCalendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 text-sm">
                    {format(
                      new Date(order.order_created_at || ""),
                      "dd/MM/yyyy HH:mm"
                    )}
                  </span>
                </div>
              </div>

              {/* Service Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Dịch vụ
                </h3>
                <div className="flex items-center space-x-2">
                  <LuClipboard className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900 font-medium">
                    {order.service_name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <LuUser className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 text-sm">
                    {order.doctor_name}
                  </span>
                </div>
              </div>

              {/* Progress Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Tiến độ
                </h3>
                <div className="flex items-center space-x-2">
                  <LuClock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900 font-medium">
                    {order.completed_sessions || 0}/{order.number_of_sessions}{" "}
                    buổi
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((order.completed_sessions || 0) /
                          order.number_of_sessions) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Thanh toán
                </h3>
                <div className="flex items-center space-x-2">
                  <LuBanknote className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900 font-medium">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order.amount)}
                  </span>
                </div>
              </div>
            </div>

            {order.notes && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Ghi chú đơn hàng
                </h4>
                <p className="text-blue-800 text-sm">{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Appointments Section */}
        <div className="bg-white rounded-[16px] shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-300">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Lịch hẹn ({appointments.length} buổi)
              </h2>
              {appointments.length > appointmentsPerPage && (
                <div className="text-sm text-gray-500">
                  Trang {currentPage} / {totalPages}
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <LuCalendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chưa có lịch hẹn
                </h3>
                <p className="text-gray-500">
                  {order.status === "pending"
                    ? "Lịch hẹn sẽ được tạo tự động khi xác nhận đơn."
                    : "Chưa có lịch hẹn nào được tạo cho đơn này."}
                </p>
              </div>
            ) : (
              <>
                {/* Appointments Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {currentAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200 overflow-hidden"
                    >
                      {/* Card Header */}
                      <div
                        className={`p-4 border-l-4 ${
                          getStatusColor(appointment.status)
                            .replace("text-", "border-")
                            .split(" ")[2]
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                            Buổi {appointment.session_number}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              appointment.status
                            )}`}
                          >
                            {getStatusText(appointment.status)}
                          </span>
                        </div>

                        {/* Date & Time */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center text-gray-700">
                            <LuCalendar className="h-4 w-4 mr-2" />
                            <span className="font-medium">
                              <span className="text-sm text-gray-700">
                                {formatDate(appointment.scheduled_at)}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <LuClock className="h-4 w-4 mr-2" />
                            <span className="font-medium">
                              {/* {format(new Date(appointment.scheduled_at), 'HH:mm')} */}
                              <span className="text-sm text-gray-700">
                                {format(
                                  new Date(appointment.scheduled_at),
                                  "HH:mm"
                                )}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Availability Info
                        {appointment.availability_id && (
                          <div className="bg-gray-50 p-3 rounded-lg mb-3">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {appointment.start_time && appointment.end_time && (
                                <div>
                                  <span className="text-gray-500">Khung:</span>
                                  <span className="font-medium ml-1">{appointment.start_time} - {appointment.end_time}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )} */}

                        {/* Expandable Content */}
                        {(appointment.notes ||
                          appointment.completion_notes) && (
                          <button
                            onClick={() =>
                              setExpandedCard(
                                expandedCard === appointment.id
                                  ? null
                                  : appointment.id
                              )
                            }
                            className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium w-full"
                          >
                            <span>Xem ghi chú</span>
                            {expandedCard === appointment.id ? (
                              <LuChevronUp className="h-4 w-4 ml-1" />
                            ) : (
                              <LuChevronDown className="h-4 w-4 ml-1" />
                            )}
                          </button>
                        )}

                        {/* Expanded Notes */}
                        {expandedCard === appointment.id && (
                          <div className="mt-3 space-y-2">
                            {appointment.notes && (
                              <div className="bg-yellow-50 border border-yellow-200 p-2 rounded text-xs">
                                <span className="font-medium text-yellow-800">
                                  Ghi chú:
                                </span>
                                <p className="text-yellow-700 mt-1">
                                  {appointment.notes}
                                </p>
                              </div>
                            )}
                            {appointment.completion_notes && (
                              <div className="bg-green-50 border border-green-200 p-2 rounded text-xs">
                                <span className="font-medium text-green-800">
                                  Hoàn thành:
                                </span>
                                <p className="text-green-700 mt-1">
                                  {appointment.completion_notes}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {!["completed", "cancelled"].includes(
                        appointment.status
                      ) && (
                        <div className="p-3 bg-gray-50 border-t border-gray-200">
                          <div className="flex space-x-2">
                            {appointment.status === "pending" && (
                              <button
                                onClick={() =>
                                  handleAppointmentStatusUpdate(
                                    appointment.id,
                                    "confirmed"
                                  )
                                }
                                disabled={appointment.updating}
                                className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs transition-colors"
                              >
                                {appointment.updating ? (
                                  <LuLoader className="animate-spin h-3 w-3" />
                                ) : (
                                  <>
                                    <LuCheck className="h-3 w-3 mr-1" />
                                    Xác nhận
                                  </>
                                )}
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleAppointmentStatusUpdate(
                                  appointment.id,
                                  "completed"
                                )
                              }
                              disabled={appointment.updating}
                              className="flex-1 bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs transition-colors"
                            >
                              {appointment.updating ? (
                                <LuLoader className="animate-spin h-3 w-3" />
                              ) : (
                                <>
                                  <LuCheck className="h-3 w-3 mr-1" />
                                  Hoàn thành
                                </>
                              )}
                            </button>
                            <button
                              onClick={() =>
                                handleAppointmentStatusUpdate(
                                  appointment.id,
                                  "cancelled"
                                )
                              }
                              disabled={appointment.updating}
                              className="flex-1 bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs transition-colors"
                            >
                              {appointment.updating ? (
                                <LuLoader className="animate-spin h-3 w-3" />
                              ) : (
                                <>
                                  <LuX className="h-3 w-3 mr-1" />
                                  Hủy
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Trước
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (number) => (
                          <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`px-3 py-1 rounded-md border ${
                              currentPage === number
                                ? "bg-blue-600 text-white border-blue-600"
                                : "border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {number}
                          </button>
                        )
                      )}
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConsultationDetailPage;
