import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import serviceService, { Service } from "../api/serviceService";
import doctorService, { Doctor } from "../api/doctorService";
import doctorAvailabilityService, {
  DoctorAvailability,
} from "../api/doctorAvailabilityService";
import orderService, { PaymentMethod } from "../api/orderService";

import {
  LuArrowLeft,
  LuLoader,
  LuTriangleAlert,
  LuPackageSearch,
  LuDollarSign,
  LuClock,
  LuUsers,
  LuFileText,
  LuCalendar,
  LuCheck,
  LuShield,
  LuPhone,
  LuMail,
  LuHeart,
  LuStar,
  LuMapPin,
  LuAward,
} from "react-icons/lu";

interface User {
  id: number;
  role: string;
}

// Utility functions for date handling
// Thay đổi hàm formatDate để đồng bộ với phía Admin
const formatDate = (date: Date): string => {
  // Định dạng ngày theo múi giờ địa phương, không qua chuyển đổi UTC
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (date: Date): string => {
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Chủ nhật, 1 = Thứ hai, ...
  d.setDate(d.getDate() - day);
  return d;
};
const ServiceDetailPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [availabilities, setAvailabilities] = useState<DoctorAvailability[]>(
    []
  );
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date("2025-07-21"));

  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userJson = localStorage.getItem("userInfo");
    if (userJson) {
      setUser(JSON.parse(userJson));
    }

    if (!serviceId) {
      setError("ID dịch vụ không được cung cấp.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const numericId = parseInt(serviceId, 10);
        if (isNaN(numericId)) {
          setError("ID dịch vụ không hợp lệ.");
          setService(null);
          setLoading(false);
          return;
        }

        // Fetch service details
        const serviceData = await serviceService.getById(numericId);
        setService(serviceData);

        // Fetch doctors for this service
        const doctorIds = serviceData.doctor_ids || [];
        if (doctorIds.length > 0) {
          const doctorPromises = doctorIds.map((id: number) =>
            doctorService.getById(id)
          );
          const doctorData = await Promise.all(doctorPromises);
          setDoctors(doctorData);
          if (doctorData.length > 0) {
            setSelectedDoctor(doctorData[0].id);
          }
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        if (err.response && err.response.status === 404) {
          setError("Dịch vụ không được tìm thấy.");
        } else {
          setError(
            err.response?.data?.message || "Không thể tải thông tin chi tiết."
          );
        }
        setService(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceId]);

  // Fetch doctor availability when doctor changes
  useEffect(() => {
    if (selectedDoctor) {
      fetchDoctorAvailability();
    } else {
      setAvailabilities([]);
      setSelectedSlots([]);
    }
  }, [selectedDoctor, currentWeek]);

  const fetchDoctorAvailability = async () => {
    if (!selectedDoctor) return;

    setAvailabilityLoading(true);
    try {
      const startDate = formatDate(getStartOfWeek(currentWeek));
      const endDate = formatDate(addDays(getStartOfWeek(currentWeek), 13)); // 2 weeks

      const availabilityData = await doctorAvailabilityService.getByDoctorId(
        selectedDoctor,
        {
          startDate,
          endDate,
          status: "available",
          isActive: true,
        }
      );

      console.log(availabilityData);

      setAvailabilities(availabilityData);
      setSelectedSlots([]); // Reset selected slots when availability changes
    } catch (err: any) {
      console.error("Error fetching doctor availability:", err);
      setAvailabilities([]);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleDoctorChange = (doctorId: number) => {
    setSelectedDoctor(doctorId);
    setSelectedSlots([]); // Reset selected slots when doctor changes
  };

  const handleSlotToggle = (availabilityId: number) => {
    if (!service) return;

    setSelectedSlots((prev) => {
      const isSelected = prev.includes(availabilityId);
      if (isSelected) {
        return prev.filter((id) => id !== availabilityId);
      } else {
        // Check if we can add more slots
        if (prev.length >= service.number_of_sessions) {
          alert(
            `Bạn chỉ có thể chọn tối đa ${service.number_of_sessions} buổi tư vấn cho dịch vụ này.`
          );
          return prev;
        }
        return [...prev, availabilityId];
      }
    });
  };

  const getWeekDates = () => {
    const start = getStartOfWeek(currentWeek);
    const dates = [];
    for (let i = 0; i < 14; i++) {
      // Show 2 weeks
      dates.push(addDays(start, i));
    }

    console.log(
      "Generated week dates:",
      dates.map((d) => formatDate(d))
    );
    console.log("Current week:", currentWeek);
    console.log("Start of week:", start);

    return dates;
  };

  const groupAvailabilitiesByDate = () => {
    const grouped: { [key: string]: DoctorAvailability[] } = {};

    availabilities.forEach((availability) => {
      // Xử lý nhất quán với formatDate mới
      const availDate = new Date(availability.available_date);
      // availDate.setUTCHours(17, 0, 0, 0); // Reset giờ về 00:00 UTC
      const dateStr = formatDate(availDate);

      console.log(`Processing availability:`, {
        id: availability.id,
        originalDate: availability.available_date,
        formattedDate: dateStr,
        time: availability.start_time,
      });

      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(availability);
    });

    // Log keys để debug
    console.log("Grouped dates:", Object.keys(grouped));

    return grouped;
  };

  const handleCreateOrder = async () => {
    if (!user || !selectedDoctor || !service || selectedSlots.length === 0) {
      setError("Vui lòng đảm bảo đã chọn bác sĩ và ít nhất một slot thời gian");
      return;
    }

    if (selectedSlots.length !== service.number_of_sessions) {
      setError(`Vui lòng chọn đúng ${service.number_of_sessions} buổi tư vấn.`);
      return;
    }

    setOrderLoading(true);
    try {
      const orderData = {
        client_id: user.id,
        doctor_id: selectedDoctor,
        service_id: service.id,
        number_of_sessions: service.number_of_sessions,
        amount: Number(service.price) * Number(service.number_of_sessions),
        payment_method: "cash" as PaymentMethod,
        payment_status: "pending" as const,
        availability_ids: selectedSlots, // Include selected availability IDs
      };

      await orderService.create(orderData);
      setOrderSuccess(true);

      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate("/lich-hen");
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể tạo đơn hàng.");
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <LuLoader className="animate-spin h-12 w-12 text-green-600" />
        <p className="ml-3 text-lg text-gray-700">
          Đang tải thông tin dịch vụ...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center min-h-screen bg-gray-50">
        <div className="mb-6">
          <Link
            to="/dich-vu"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium group"
          >
            <LuArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Quay lại danh sách dịch vụ
          </Link>
        </div>
        <div className="bg-red-50 p-8 rounded-lg border border-red-200 max-w-md mx-auto shadow-md">
          <LuTriangleAlert className="h-16 w-16 text-red-500 mb-4 mx-auto" />
          <p className="text-xl font-semibold text-red-700">Lỗi</p>
          <p className="text-md text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto p-6 text-center min-h-screen bg-gray-50">
        <div className="mb-6">
          <Link
            to="/dich-vu"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium group"
          >
            <LuArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Quay lại danh sách dịch vụ
          </Link>
        </div>
        <div className="bg-yellow-50 p-8 rounded-lg border border-yellow-200 max-w-md mx-auto shadow-md">
          <LuPackageSearch className="h-16 w-16 text-yellow-500 mb-4 mx-auto" />
          <p className="text-xl font-semibold text-yellow-700">
            Không tìm thấy dịch vụ
          </p>
          <p className="text-md text-yellow-600">
            Không có dữ liệu cho dịch vụ này.
          </p>
        </div>
      </div>
    );
  }

  // Success modal
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LuCheck className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Đặt lịch thành công!
          </h2>
          <p className="text-gray-600 mb-6">
            Đơn hàng của bạn đã được tạo thành công. Chúng tôi sẽ liên hệ với
            bạn để xác nhận lịch hẹn trong thời gian sớm nhất.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/lich-hen")}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Xem lịch hẹn của tôi
            </button>
            <button
              onClick={() => navigate("/dich-vu")}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Quay lại dịch vụ
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Tự động chuyển hướng sau 3 giây...
          </p>
        </div>
      </div>
    );
  }

  // Fallback image if service.image is not available
  const heroImage =
    service.image ||
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1440&q=80";

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Enhanced Hero Section */}
      <section className="relative h-80 md:h-96 lg:h-[28rem] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-700 hover:scale-110"
          style={{ backgroundImage: `url(${heroImage})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <LuShield className="w-5 h-5 text-white mr-2" />
              <span className="text-white font-medium">
                Dịch vụ chuyên nghiệp
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {service.title}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              {service.description}
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-white/90">
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <LuDollarSign className="w-5 h-5 mr-2 text-green-400" />
                <span className="font-semibold">
                  {service.price.toLocaleString("vi-VN")} VNĐ/buổi
                </span>
              </div>
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <LuCalendar className="w-5 h-5 mr-2 text-blue-400" />
                <span className="font-semibold">
                  {service.number_of_sessions} buổi
                </span>
              </div>
              {service.duration && (
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <LuClock className="w-5 h-5 mr-2 text-purple-400" />
                  <span className="font-semibold">{service.duration}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 transform -translate-y-20">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          {/* Back Button */}
          <div className="p-6 border-b border-gray-100">
            <Link
              to="/dich-vu"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium group transition-colors"
            >
              <LuArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
              Quay lại danh sách dịch vụ
            </Link>
          </div>

          <div className="p-8">
            {/* Service Details */}
            <section className="mb-12">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <LuFileText className="w-6 h-6 mr-3 text-green-600" />
                    Chi tiết dịch vụ
                  </h2>

                  {service.content ? (
                    <div
                      className="prose prose-lg max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: service.content }}
                    />
                  ) : (
                    <div className="space-y-6">
                      <p className="text-gray-700 leading-relaxed text-lg">
                        {service.description}
                      </p>

                      {service.objectives && service.objectives.length > 0 && (
                        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                          <h3 className="font-bold text-lg text-green-800 mb-4 flex items-center">
                            <LuAward className="w-5 h-5 mr-2" />
                            Mục tiêu dịch vụ
                          </h3>
                          <ul className="space-y-3">
                            {service.objectives.map((obj, index) => (
                              <li key={index} className="flex items-start">
                                <LuCheck className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                                <span className="text-green-700">{obj}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {service.process_description && (
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                          <h3 className="font-bold text-lg text-blue-800 mb-4">
                            Quy trình thực hiện
                          </h3>
                          <p className="text-blue-700 whitespace-pre-wrap leading-relaxed">
                            {service.process_description}
                          </p>
                        </div>
                      )}

                      {service.benefits && service.benefits.length > 0 && (
                        <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                          <h3 className="font-bold text-lg text-purple-800 mb-4 flex items-center">
                            <LuHeart className="w-5 h-5 mr-2" />
                            Lợi ích mang lại
                          </h3>
                          <ul className="space-y-3">
                            {service.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-start">
                                <LuStar className="w-5 h-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                                <span className="text-purple-700">
                                  {benefit}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Service Info Card */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                    <h3 className="font-bold text-lg text-gray-900 mb-4">
                      Thông tin dịch vụ
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Chi phí/buổi:</span>
                        <span className="font-bold text-green-600 text-lg">
                          {service.price.toLocaleString("vi-VN")} VNĐ
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Số buổi:</span>
                        <span className="font-semibold text-gray-900">
                          {service.number_of_sessions} buổi
                        </span>
                      </div>
                      {service.duration && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Thời lượng:</span>
                          <span className="font-semibold text-gray-900">
                            {service.duration}
                          </span>
                        </div>
                      )}
                      <div className="border-t border-green-200 pt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Tổng chi phí:</span>
                          <span className="font-bold text-green-600 text-xl">
                            {(
                              Number(service.price) *
                              Number(service.number_of_sessions)
                            ).toLocaleString("vi-VN")}{" "}
                            VNĐ
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Contact */}
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-lg text-gray-900 mb-4">
                      Liên hệ hỗ trợ
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <LuPhone className="w-5 h-5 mr-3 text-green-600" />
                        <span>1900 1234</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <LuMail className="w-5 h-5 mr-3 text-blue-600" />
                        <span>support@mindbridge.vn</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <LuMapPin className="w-5 h-5 mr-3 text-red-600" />
                        <span>Hà Nội, Việt Nam</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Available Doctors */}
            {doctors.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                  <LuUsers className="w-6 h-6 mr-3 text-green-600" />
                  Chuyên gia đồng hành
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className={`group relative bg-white border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-xl ${
                        selectedDoctor === doctor.id
                          ? "border-green-500 bg-gradient-to-br from-green-50 to-blue-50 ring-4 ring-green-200 shadow-lg"
                          : "border-gray-200 hover:border-green-300 hover:shadow-lg"
                      }`}
                      onClick={() => handleDoctorChange(doctor.id)}
                    >
                      {selectedDoctor === doctor.id && (
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                          <LuCheck className="w-5 h-5 text-white" />
                        </div>
                      )}

                      <div className="text-center">
                        <div className="relative mb-4">
                          <img
                            src={
                              doctor.profile_picture ||
                              "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
                            }
                            alt={doctor.full_name}
                            className="w-20 h-20 rounded-full mx-auto object-cover ring-4 ring-white shadow-lg"
                          />
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                              Chuyên gia
                            </div>
                          </div>
                        </div>

                        <h4 className="font-bold text-gray-900 text-lg mb-2">
                          {doctor.full_name}
                        </h4>
                        <p className="text-green-600 font-medium mb-3">
                          {doctor.specialty}
                        </p>

                        {doctor.bio && (
                          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                            {doctor.bio}
                          </p>
                        )}

                        {/* Rating */}
                        <div className="flex items-center justify-center mt-4">
                          {[...Array(5)].map((_, i) => (
                            <LuStar
                              key={i}
                              className="w-4 h-4 text-yellow-400 fill-current"
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-600">
                            5.0
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Booking Process */}
            <section className="mb-12">
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8 border border-blue-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center">
                  <LuCalendar className="w-6 h-6 mr-3 text-blue-600" />
                  Quy trình đặt lịch
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                      1
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Chọn chuyên gia
                    </h4>
                    <p className="text-gray-600">
                      Lựa chọn chuyên gia phù hợp với nhu cầu của bạn
                    </p>
                  </div>
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                      2
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Đặt lịch hẹn
                    </h4>
                    <p className="text-gray-600">
                      Chọn thời gian phù hợp trong lịch làm việc
                    </p>
                  </div>
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                      3
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Tham gia tư vấn
                    </h4>
                    <p className="text-gray-600">
                      Tham gia các buổi tư vấn theo lịch đã định
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Booking Form */}
            <section className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <LuCalendar className="w-6 h-6 mr-3 text-green-600" />
                Đặt lịch tư vấn
              </h3>

              {!user ? (
                <div className="text-center bg-gradient-to-r from-yellow-50 to-orange-50 p-8 rounded-2xl border border-yellow-200">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <LuShield className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h4 className="text-xl font-bold text-yellow-800 mb-4">
                    Đăng nhập để đặt lịch
                  </h4>
                  <p className="text-yellow-700 mb-6">
                    Vui lòng đăng nhập để có thể đặt lịch tư vấn với chuyên gia
                  </p>
                  <Link
                    to="/client/login"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-medium shadow-lg hover:shadow-xl"
                  >
                    <LuShield className="w-5 h-5 mr-2" />
                    Đăng nhập ngay
                  </Link>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Doctor Availability Calendar */}
                  {selectedDoctor && (
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <LuCalendar className="w-5 h-5 mr-2 text-green-600" />
                        Chọn lịch hẹn
                        <span className="ml-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          {selectedSlots.length}/{service.number_of_sessions}{" "}
                          buổi
                        </span>
                      </h4>

                      {availabilityLoading ? (
                        <div className="flex justify-center items-center py-12 bg-gray-50 rounded-xl">
                          <div className="text-center">
                            <LuLoader className="animate-spin h-8 w-8 text-green-600 mx-auto mb-4" />
                            <span className="text-gray-600 font-medium">
                              Đang tải lịch làm việc...
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                          {/* Week Navigation */}
                          <div className="flex items-center justify-between mb-6">
                            <button
                              onClick={() =>
                                setCurrentWeek((prev) => addDays(prev, -7))
                              }
                              className="flex items-center px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                              <LuArrowLeft className="w-4 h-4 mr-1" />
                              Tuần trước
                            </button>
                            <span className="font-bold text-gray-900 bg-green-50 px-4 py-2 rounded-lg">
                              {formatDisplayDate(getStartOfWeek(currentWeek))} -{" "}
                              {formatDisplayDate(
                                addDays(getStartOfWeek(currentWeek), 13)
                              )}
                            </span>
                            <button
                              onClick={() =>
                                setCurrentWeek((prev) => addDays(prev, 7))
                              }
                              className="flex items-center px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                              Tuần sau
                              <LuArrowLeft className="w-4 h-4 ml-1 rotate-180" />
                            </button>
                          </div>

                          {/* Availability Grid */}
                          <div className="grid grid-cols-7 gap-3">
                            {getWeekDates().map((date, index) => {
                              const dateStr = formatDate(date);
                              const dayAvailabilities =
                                groupAvailabilitiesByDate()[dateStr] || [];

                              return (
                                <div key={index} className="space-y-2">
                                  <div className="text-center bg-gray-50 rounded-lg p-2">
                                    <div className="text-xs text-gray-500 font-medium">
                                      {date.toLocaleDateString("vi-VN", {
                                        weekday: "short",
                                      })}
                                    </div>
                                    <div className="text-sm font-bold text-gray-900">
                                      {formatDisplayDate(date)}
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    {dayAvailabilities.length > 0 ? (
                                      dayAvailabilities.map((availability) => (
                                        <button
                                          key={availability.id}
                                          onClick={() =>
                                            handleSlotToggle(availability.id)
                                          }
                                          className={`w-full text-xs p-2 rounded-lg transition-all font-medium ${
                                            selectedSlots.includes(
                                              availability.id
                                            )
                                              ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md transform scale-105"
                                              : "bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700 hover:shadow-sm"
                                          }`}
                                        >
                                          {availability.start_time.substring(
                                            0,
                                            5
                                          )}
                                        </button>
                                      ))
                                    ) : (
                                      <div className="text-xs text-gray-400 text-center py-3 bg-gray-50 rounded-lg">
                                        Không có lịch
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {availabilities.length === 0 && (
                            <div className="text-center py-12 bg-gray-50 rounded-xl mt-6">
                              <LuCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600 font-medium mb-2">
                                Không có lịch làm việc khả dụng
                              </p>
                              <p className="text-sm text-gray-500">
                                Vui lòng chọn tuần khác hoặc liên hệ trực tiếp
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                      <LuFileText className="w-5 h-5 mr-2 text-green-600" />
                      Tóm tắt đơn hàng
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Dịch vụ:</span>
                        <span className="font-semibold text-gray-900">
                          {service.title}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Số buổi đã chọn:</span>
                        <span className="font-semibold text-gray-900">
                          {selectedSlots.length}/{service.number_of_sessions}{" "}
                          buổi
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Giá/buổi:</span>
                        <span className="font-semibold text-gray-900">
                          {service.price.toLocaleString("vi-VN")} VNĐ
                        </span>
                      </div>
                      <div className="border-t border-green-300 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900 text-lg">
                            Tổng cộng:
                          </span>
                          <span className="font-bold text-green-600 text-2xl">
                            {(
                              Number(service.price) * selectedSlots.length
                            ).toLocaleString("vi-VN")}{" "}
                            VNĐ
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Book Button */}
                  <button
                    type="button"
                    className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg transition-all transform ${
                      orderLoading ||
                      !selectedDoctor ||
                      selectedSlots.length !== service.number_of_sessions
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl hover:scale-105"
                    }`}
                    disabled={
                      orderLoading ||
                      !selectedDoctor ||
                      selectedSlots.length !== service.number_of_sessions
                    }
                    onClick={handleCreateOrder}
                  >
                    {orderLoading ? (
                      <div className="flex items-center justify-center">
                        <LuLoader className="animate-spin h-6 w-6 mr-3" />
                        Đang xử lý đơn hàng...
                      </div>
                    ) : selectedSlots.length !== service.number_of_sessions ? (
                      <div className="flex items-center justify-center">
                        <LuCalendar className="h-6 w-6 mr-3" />
                        Chọn đủ {service.number_of_sessions} buổi tư vấn
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <LuCheck className="h-6 w-6 mr-3" />
                        Đặt lịch ngay -{" "}
                        {(
                          Number(service.price) *
                          Number(service.number_of_sessions)
                        ).toLocaleString("vi-VN")}{" "}
                        VNĐ
                      </div>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center flex items-center justify-center">
                    <LuShield className="w-4 h-4 mr-1" />
                    Bằng việc đặt lịch, bạn đồng ý với điều khoản sử dụng của
                    chúng tôi
                  </p>
                </div>
              )}
            </section>

            {/* Contact Section */}
            <section className="mt-12 text-center">
              <p className="text-gray-600 mb-4">
                Cần hỗ trợ thêm? Liên hệ với chúng tôi!
              </p>
              <Link
                to="/lien-he"
                className="bg-orange-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors duration-200 text-base inline-block shadow hover:shadow-md"
              >
                Liên hệ ngay
              </Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
