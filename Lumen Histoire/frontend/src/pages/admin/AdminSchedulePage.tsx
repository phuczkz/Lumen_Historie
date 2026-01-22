import React, { useState, useEffect } from "react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuClock,
  LuUser,
  LuMapPin,
} from "react-icons/lu";
import axiosClient from "../../api/axiosClient";
import { format } from "date-fns";

interface Appointment {
  id: number;
  order_id: number;
  session_number: number;
  scheduled_at: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rescheduled";
  notes?: string;
  completion_notes?: string;
  client_name?: string;
  doctor_name?: string;
  service_name?: string;
  room?: string;
}

interface Service {
  id: number;
  name: string;
  color: string;
}

interface ScheduleEvent {
  id: number;
  time: string;
  duration: number; // in minutes
  title: string;
  client: string;
  doctor: string;
  room: string;
  type: string;
  status: "confirmed" | "consultation" | "pending";
  sessionNumber?: number;
  serviceColor: string;
}

const AdminSchedulePage: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "confirmed" | "pending"
  >("all");

  // Predefined colors for services
  const serviceColors = [
    "bg-blue-50 border-blue-400",
    "bg-green-50 border-green-400",
    "bg-purple-50 border-purple-400",
    "bg-orange-50 border-orange-400",
    "bg-pink-50 border-pink-400",
    "bg-indigo-50 border-indigo-400",
    "bg-yellow-50 border-yellow-400",
    "bg-red-50 border-red-400",
    "bg-cyan-50 border-cyan-400",
    "bg-emerald-50 border-emerald-400",
  ];

  // Generate week dates - Custom implementation
  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const startOfWeek = (date: Date): Date => {
    const result = new Date(date);
    const day = result.getDay(); // Chủ nhật = 0
    result.setDate(result.getDate() - day); // Lùi về Chủ nhật
    return result;
  };

  const addWeeks = (date: Date, weeks: number): Date => {
    return addDays(date, weeks * 7);
  };

  const subWeeks = (date: Date, weeks: number): Date => {
    return addDays(date, -weeks * 7);
  };

  const getWeekDates = (date: Date) => {
    const start = startOfWeek(date);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const weekDates = getWeekDates(currentWeek);

  // Time slots from 8:00 AM to 10:00 PM
  const timeSlots = [
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
  ];

  const fetchServices = async () => {
    try {
      const response = await axiosClient.get<any[]>("/services");
      const servicesData = response.data.map((service: any, index: number) => ({
        id: service.id,
        name: service.name,
        color: serviceColors[index % serviceColors.length],
      }));
      setServices(servicesData);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      // Get all appointments for the current week
      const startDate = format(weekDates[0], "yyyy-MM-dd");
      const endDate = format(weekDates[6], "yyyy-MM-dd");

      const response = await axiosClient.get<Appointment[]>(
        `/appointments/week?start=${startDate}&end=${endDate}`
      );
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (weekDates.length > 0) {
      fetchAppointments();
    }
  }, [currentWeek]);

  // Get service color by service name
  const getServiceColor = (serviceName: string): string => {
    const service = services.find((s) => s.name === serviceName);
    return service ? service.color : "bg-gray-100 border-gray-400";
  };

  // Convert appointments to schedule events
  const getEventsForTimeSlot = (date: Date, time: string): ScheduleEvent[] => {
    const dateStr = format(date, "yyyy-MM-dd");
    const timeHour = parseInt(time.split(":")[0]);

    return appointments
      .filter((apt) => {
        // Tạo Date từ chuỗi gốc rồi cộng thêm 1 ngày
        const aptDateObj = new Date(apt.scheduled_at);
        aptDateObj.setDate(aptDateObj.getDate() + 1); // Chỉ cộng thêm ngày
        const aptDate = format(aptDateObj, "yyyy-MM-dd");
        const aptHour = aptDateObj.getHours();
        return aptDate === dateStr && aptHour === timeHour;
      })
      .map((apt) => ({
        id: apt.id,
        time: format(new Date(apt.scheduled_at), "HH:mm"),
        duration: 60,
        title: apt.service_name || "Tư vấn",
        client: apt.client_name || "Khách hàng",
        doctor: apt.doctor_name || "Bác sĩ",
        room: `Room ${apt.session_number || 1}`,
        type: apt.service_name || "Dịch vụ tư vấn",
        status:
          apt.status === "confirmed"
            ? "confirmed"
            : apt.status === "pending"
            ? "pending"
            : "consultation",
        sessionNumber: apt.session_number,
        serviceColor: getServiceColor(apt.service_name || ""),
      }));
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 border-l-4 border-green-400";
      case "pending":
        return "bg-yellow-50 border-l-4 border-yellow-400";
      case "consultation":
        return "bg-blue-50 border-l-4 border-blue-400";
      default:
        return "bg-gray-100 border-l-4 border-gray-400";
    }
  };

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeek((prev) =>
      direction === "prev" ? subWeeks(prev, 1) : addWeeks(prev, 1)
    );
  };

  const getDayNames = () => {
    const dayNames = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    return weekDates.map((date, index) => ({
      name: dayNames[index],
      date: format(date, "d"),
      fullDate: date,
    }));
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (selectedFilter === "all") return true;
    return apt.status === selectedFilter;
  });

  // Get unique services from appointments for legend
  const getUniqueServicesFromAppointments = () => {
    const uniqueServiceNames = [
      ...new Set(appointments.map((apt) => apt.service_name).filter(Boolean)),
    ];
    return uniqueServiceNames.map((serviceName) => {
      const service = services.find((s) => s.name === serviceName);
      return {
        name: serviceName!,
        color: service ? service.color : "bg-gray-100",
      };
    });
  };

  const uniqueServices = getUniqueServicesFromAppointments();

  return (
    <div className="p-6 bg-white min-h-screen rounded-[16px]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              Lịch làm việc
            </h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateWeek("prev")}
                className="p-2 hover:bg-gray-200 rounded-lg"
              >
                <LuChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-lg font-medium min-w-[150px] text-center">
                {(() => {
                  const monthNames = [
                    "Tháng 1",
                    "Tháng 2",
                    "Tháng 3",
                    "Tháng 4",
                    "Tháng 5",
                    "Tháng 6",
                    "Tháng 7",
                    "Tháng 8",
                    "Tháng 9",
                    "Tháng 10",
                    "Tháng 11",
                    "Tháng 12",
                  ];
                  const month = currentWeek.getMonth();
                  const year = currentWeek.getFullYear();
                  return `${monthNames[month]} ${year}`;
                })()}
              </span>
              <button
                onClick={() => navigateWeek("next")}
                className="p-2 hover:bg-gray-200 rounded-lg"
              >
                <LuChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Service Legend */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Dịch vụ:</span>
            <div className="flex items-center space-x-3 text-sm">
              {uniqueServices.map((service) => (
                <div key={service.name} className="flex items-center space-x-1">
                  <div
                    className={`w-3 h-3 rounded ${service.color.split(" ")[0]}`}
                  ></div>
                  <span className="text-gray-800">{service.name}</span>
                </div>
              ))}
              {uniqueServices.length === 0 && (
                <span className="text-gray-500 italic">
                  Chưa có dịch vụ nào
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="rounded-[16px] shadow-sm overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-[50px_repeat(7,_1fr)] border-b border-gray-300">
            <div className="p-4 bg-gray-50"></div>
            {getDayNames().map(({ name, date, fullDate }) => (
              <div key={date} className="p-2 bg-gray-50 text-center">
                <div className="bg-red-100 rounded-[16px] p-1 mb-2">
                  <div className="font-medium text-gray-900">{name}</div>
                  <div className="text-2xl font-bold text-gray-900">{date}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {timeSlots.map((time) => (
            <div
              key={time}
              className="grid grid-cols-[50px_repeat(7,_1fr)] border-b border-gray-300 min-h-[100px]"
            >
              {/* Time Column */}
              <div className="border-r border-gray-200">
                <div className="text-sm font-semibold">{time}</div>
              </div>

              {/* Day Columns */}
              {weekDates.map((date, dayIndex) => {
                const events = getEventsForTimeSlot(date, time);
                return (
                  <div
                    key={dayIndex}
                    className="p-2 border-r border-gray-100 relative"
                  >
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className={`p-2 rounded mb-1 text-xs cursor-pointer hover:shadow-md transition-shadow border-l-4 ${event.serviceColor}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-xs">
                            {event.room}
                          </span>
                          <span className="flex items-center gap-1 font-medium text-xs text-gray-600">
                            <LuClock className="w-3 h-3" />
                            {event.time}
                          </span>
                        </div>

                        {/* Doctor Info */}
                        <div className="font-medium text-gray-900 mb-1">
                          <span className="text-blue-700"></span> {event.doctor}
                        </div>

                        {/* Patient Info */}
                        <div className="font-medium text-gray-900 mb-1">
                          <span className="text-green-700">KH:</span>{" "}
                          {event.client}
                        </div>

                        {/* Service */}
                        <div className="text-gray-700 mb-1">{event.type}</div>

                        {/* Session Number */}
                        {event.sessionNumber && (
                          <div className="text-xs text-gray-700">
                            Buổi {event.sessionNumber}
                          </div>
                        )}

                        {/* Status indicator */}
                        <div className="mt-1">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              event.status === "confirmed"
                                ? "bg-green-400"
                                : event.status === "pending"
                                ? "bg-yellow-300"
                                : "bg-blue-500"
                            }`}
                          ></span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <LuClock className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <div className="text-2xl font-semibold text-gray-900">
                  {
                    filteredAppointments.filter(
                      (apt) => apt.status === "pending"
                    ).length
                  }
                </div>
                <div className="text-gray-600">Chờ xác nhận</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <LuUser className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <div className="text-2xl font-semibold text-gray-900">
                  {
                    filteredAppointments.filter(
                      (apt) => apt.status === "confirmed"
                    ).length
                  }
                </div>
                <div className="text-gray-600">Đã xác nhận</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <LuMapPin className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <div className="text-2xl font-semibold text-gray-900">
                  {
                    filteredAppointments.filter(
                      (apt) => apt.status === "completed"
                    ).length
                  }
                </div>
                <div className="text-gray-600">Đã hoàn thành</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSchedulePage;
