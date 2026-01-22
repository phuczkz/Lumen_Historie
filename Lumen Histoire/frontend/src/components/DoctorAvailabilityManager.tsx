import React, { useState, useEffect } from "react";
import {
  LuCalendarClock,
  LuClock,
  LuLoader,
  LuX,
  LuCheck,
  LuPlus,
  LuTrash2,
} from "react-icons/lu";
import doctorAvailabilityService, {
  DoctorAvailability,
  DoctorAvailabilityCreatePayload,
} from "../api/doctorAvailabilityService";
import { format, parseISO, isValid } from "date-fns";

interface DoctorAvailabilityManagerProps {
  doctorId: number;
}

// Fixed time slots from 7:00 to 22:00 (1-hour slots)
const TIME_SLOTS = [
  { start: "07:00", end: "08:00", display: "7:00 - 8:00" },
  { start: "08:00", end: "09:00", display: "8:00 - 9:00" },
  { start: "09:00", end: "10:00", display: "9:00 - 10:00" },
  { start: "10:00", end: "11:00", display: "10:00 - 11:00" },
  { start: "11:00", end: "12:00", display: "11:00 - 12:00" },
  { start: "12:00", end: "13:00", display: "12:00 - 13:00" },
  { start: "13:00", end: "14:00", display: "13:00 - 14:00" },
  { start: "14:00", end: "15:00", display: "14:00 - 15:00" },
  { start: "15:00", end: "16:00", display: "15:00 - 16:00" },
  { start: "16:00", end: "17:00", display: "16:00 - 17:00" },
  { start: "17:00", end: "18:00", display: "17:00 - 18:00" },
  { start: "18:00", end: "19:00", display: "18:00 - 19:00" },
  { start: "19:00", end: "20:00", display: "19:00 - 20:00" },
  { start: "20:00", end: "21:00", display: "20:00 - 21:00" },
  { start: "21:00", end: "22:00", display: "21:00 - 22:00" },
];

const DAYS_OF_WEEK = [
  { value: "sunday", label: "Chủ Nhật", index: 0 },
  { value: "monday", label: "Thứ Hai", index: 1 },
  { value: "tuesday", label: "Thứ Ba", index: 2 },
  { value: "wednesday", label: "Thứ Tư", index: 3 },
  { value: "thursday", label: "Thứ Năm", index: 4 },
  { value: "friday", label: "Thứ Sáu", index: 5 },
  { value: "saturday", label: "Thứ Bảy", index: 6 },
];

const DoctorAvailabilityManager: React.FC<DoctorAvailabilityManagerProps> = ({
  doctorId,
}) => {
  const [availabilities, setAvailabilities] = useState<DoctorAvailability[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date("2025-07-21"));
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [weekCount, setWeekCount] = useState(1);

  // Helper functions for date calculations
  const getStartOfWeek = (date: Date) => {
    // Luôn tạo mới đối tượng Date theo local time
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = d.getDay(); // 0 = Chủ Nhật
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const addDaysToDate = (date: Date, days: number) => {
    const result = new Date(date.getTime());
    result.setDate(result.getDate() + days);
    return result;
  };

  const getWeekDates = () => {
    const start = getStartOfWeek(currentWeek);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDaysToDate(start, i));
    }
    return dates;
  };

  // Thay thế hàm formatDate hiện tại bằng phiên bản mới này
  const formatDate = (date: Date) => {
    // Định dạng ngày theo múi giờ địa phương, không qua chuyển đổi UTC
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  useEffect(() => {
    fetchAvailabilities();
  }, [doctorId, currentWeek]);

  const fetchAvailabilities = async () => {
    try {
      setLoading(true);
      const startDate = getStartOfWeek(currentWeek);
      const endDate = addDaysToDate(startDate, weekCount * 7);

      console.log(
        `Fetching data from ${formatDate(startDate)} to ${formatDate(endDate)}`
      );

      const data = await doctorAvailabilityService.getByDoctorId(doctorId, {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      });
      console.log("Fetched availabilities:", data);
      setAvailabilities(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi khi tải lịch làm việc");
    } finally {
      setLoading(false);
    }
  };

  const getSlotAvailability = (date: string, startTime: string) => {
    console.log(`\n=== SEARCHING FOR SLOT ===`);
    console.log(`Looking for: date=${date}, time=${startTime}`);

    const found = availabilities.find((availability) => {
      // Cách xử lý nhất quán với formatDate mới
      const availDate = new Date(availability.available_date);
      const availableDate = formatDate(availDate);

      // Normalize time format - remove seconds if present
      const normalizedStartTime = availability.start_time.substring(0, 5); // "07:00:00" -> "07:00"
      const normalizedSlotTime = startTime.substring(0, 5); // Ensure consistent format

      const dateMatch = availableDate === date;
      const timeMatch = normalizedStartTime === normalizedSlotTime;

      // Debug code for specific date
      if (date === "2025-05-25" && startTime === "07:00") {
        console.log(`DETAILED CHECK for 2025-05-25 07:00:`);
        console.log(
          `  availableDate: "${availableDate}" === "${date}" = ${dateMatch}`
        );
        console.log(
          `  normalizedStartTime: "${normalizedStartTime}" === "${normalizedSlotTime}" = ${timeMatch}`
        );
        console.log(`  Both match: ${dateMatch && timeMatch}`);
      }

      return dateMatch && timeMatch;
    });

    return found;
  };

  const handleSlotToggle = (timeSlot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(timeSlot)
        ? prev.filter((slot) => slot !== timeSlot)
        : [...prev, timeSlot]
    );
  };

  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const generateDatesForWeeks = (
    startDate: Date,
    weeks: number,
    selectedDays: string[]
  ) => {
    const dates = [];
    const dayMap = Object.fromEntries(
      DAYS_OF_WEEK.map((d) => [d.value, d.index])
    );
    const baseWeekStart = getStartOfWeek(startDate);

    for (let week = 0; week < weeks; week++) {
      const weekStart = addDaysToDate(baseWeekStart, week * 7);
      for (const dayName of selectedDays) {
        const dayIndex = dayMap[dayName];
        const date = addDaysToDate(weekStart, dayIndex);
        dates.push(formatDate(date));
      }
    }
    return dates;
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (bulkMode) {
      if (selectedDays.length === 0 || selectedSlots.length === 0) {
        setError("Vui lòng chọn ít nhất một ngày và một khung giờ");
        return;
      }

      try {
        // Sử dụng ngày đầu tuần thực sự của giao diện
        const weekStart = getStartOfWeek(currentWeek);
        const dates = generateDatesForWeeks(
          weekStart, // <-- truyền vào ngày đầu tuần
          weekCount,
          selectedDays
        );
        const promises = [];

        for (const date of dates) {
          for (const timeSlot of selectedSlots) {
            const slot = TIME_SLOTS.find((s) => s.start === timeSlot);
            if (slot) {
              const newAvailability: DoctorAvailabilityCreatePayload = {
                doctor_id: doctorId,
                available_date: date,
                start_time: slot.start,
                end_time: slot.end,
                status: "available",
                is_active: true,
              };
              promises.push(doctorAvailabilityService.create(newAvailability));
            }
          }
        }

        await Promise.all(promises);
        setSuccess(`Đã thêm ${promises.length} lịch làm việc thành công`);
        fetchAvailabilities();
        handleCloseModal();
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Lỗi khi thêm lịch làm việc hàng loạt"
        );
      }
    } else {
      if (!selectedDate || selectedSlots.length === 0) {
        setError("Vui lòng chọn ngày và ít nhất một khung giờ");
        return;
      }

      try {
        const promises = selectedSlots.map((timeSlot) => {
          const slot = TIME_SLOTS.find((s) => s.start === timeSlot);
          if (slot) {
            const newAvailability: DoctorAvailabilityCreatePayload = {
              doctor_id: doctorId,
              available_date: selectedDate,
              start_time: slot.start,
              end_time: slot.end,
              status: "available",
              is_active: true,
            };
            return doctorAvailabilityService.create(newAvailability);
          }
          return Promise.resolve();
        });

        await Promise.all(promises);
        setSuccess(`Đã thêm ${selectedSlots.length} lịch làm việc thành công`);
        fetchAvailabilities();
        handleCloseModal();
      } catch (err: any) {
        setError(err.response?.data?.message || "Lỗi khi thêm lịch làm việc");
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa lịch làm việc này?")) {
      return;
    }

    try {
      await doctorAvailabilityService.delete(id);
      setSuccess("Xóa lịch làm việc thành công");
      fetchAvailabilities();
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi khi xóa lịch làm việc");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate("");
    setSelectedSlots([]);
    setSelectedDays([]);
    setBulkMode(false);
    setWeekCount(1);
  };

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeek((prev) =>
      addDaysToDate(prev, direction === "next" ? 7 : -7)
    );
  };

  if (loading && availabilities.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <LuLoader className="animate-spin h-8 w-8 text-green-600" />
      </div>
    );
  }

  const weekDates = getWeekDates();
  const weekStart = getStartOfWeek(currentWeek);
  const weekEnd = addDaysToDate(weekStart, 6);

  console.log(
    "Current week dates:",
    weekDates.map((d) => formatDate(d))
  );
  console.log(
    "Available appointments:",
    availabilities.map((a) => ({
      date: new Date(a.available_date).toISOString().split("T")[0],
      time: a.start_time,
    }))
  );

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <LuCalendarClock className="mr-3 h-6 w-6" />
            Quản Lý Lịch Làm Việc
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 font-semibold bg-green-100 rounded-[16px] hover:bg-green-200 transition-all duration-200"
          >
            <LuPlus className="mr-2 h-5 w-5" />
            Thêm Lịch Làm Việc
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-[16px]">
          {error}
        </div>
      )}

      {success && (
        <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-[16px]">
          {success}
        </div>
      )}

      {/* Week Navigation */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigateWeek("prev")}
            className="px-4 py-2 hover:text-semibold hover:bg-green-200 rounded-[16px] transition-colors"
          >
            ← Tuần trước
          </button>
          <h3 className="text-lg font-semibold">
            Tuần {formatDisplayDate(weekStart)} - {formatDisplayDate(weekEnd)}
          </h3>
          <button
            onClick={() => navigateWeek("next")}
            className="px-4 py-2 hover:text-semibold hover:bg-green-200 rounded-[16px] transition-colors"
          >
            Tuần sau →
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-8 gap-2 min-w-full">
            {/* Header */}
            <div className="font-semibold p-3 text-center">Giờ</div>
            {weekDates.map((date) => {
              const dayOfWeek = date.getDay(); // Lấy thứ từ ngày (0 = Chủ Nhật, 1 = Thứ Hai, ...)
              const dayLabel =
                DAYS_OF_WEEK.find((d) => d.index === dayOfWeek)?.label || "";
              return (
                <div key={formatDate(date)} className="font-medium text-center">
                  <div className="text-sm">{dayLabel}</div>
                  <div className="text-lg">{formatDisplayDate(date)}</div>
                </div>
              );
            })}

            {/* Time slots */}
            {TIME_SLOTS.map((slot) => (
              <React.Fragment key={slot.start}>
                <div className="p-2 text-sm font-medium bg-gray-50 rounded-lg flex items-center justify-center">
                  <LuClock className="mr-2 h-4 w-4" />
                  {slot.display}
                </div>
                {weekDates.map((date) => {
                  const dateStr = formatDate(date);
                  const availability = getSlotAvailability(dateStr, slot.start);
                  const isAvailable = availability?.status === "available";
                  const isBooked =
                    availability && availability.status !== "available";

                  // Debug logging for the 7:00 slot on 2025-05-25 only
                  if (slot.start === "07:00" && dateStr === "2025-05-25") {
                    console.log(`DEBUG SLOT 2025-05-25 07:00:`, {
                      availability,
                      isAvailable,
                      isBooked,
                      status: availability?.status,
                    });
                  }

                  const cssClasses = `p-2 h-10 rounded-lg border-2 transition-all duration-200 flex items-center justify-center relative group ${
                    isAvailable
                      ? "bg-green-50 border-green-300 font-bold text-green-700"
                      : isBooked
                      ? "bg-red-50 border-red-200 text-red-700"
                      : "border-gray-300 "
                  }`;

                  // Debug CSS classes for the specific slot
                  if (slot.start === "07:00" && dateStr === "2025-05-25") {
                    console.log(
                      `CSS Classes for 2025-05-25 07:00:`,
                      cssClasses
                    );
                  }

                  return (
                    <div
                      key={`${dateStr}-${slot.start}`}
                      className={cssClasses}
                    >
                      {isAvailable && (
                        <>
                          <LuCheck className="h-4 w-4" />
                          <button
                            onClick={() =>
                              availability && handleDelete(availability.id)
                            }
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                          >
                            <LuTrash2 className="h-3 w-3" />
                          </button>
                        </>
                      )}
                      {isBooked && (
                        <span className="text-xs font-medium">Đã đặt</span>
                      )}
                      {!availability && <span className="text-xs">_</span>}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  Thêm Lịch Làm Việc
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <LuX className="h-6 w-6" />
                </button>
              </div>

              {/* Mode Toggle */}
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={() => setBulkMode(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    !bulkMode
                      ? "bg-green-200 font-medium"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Thêm theo ngày
                </button>
                <button
                  onClick={() => setBulkMode(true)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    bulkMode
                      ? "bg-green-200 font-medium"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Thêm hàng loạt
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {!bulkMode ? (
                // Single day mode
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn ngày
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={formatDate(new Date())}
                    className="w-full rounded-lg border border-gray-400 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2"
                  />
                </div>
              ) : (
                // Bulk mode
                <div className="space-y-4">
                  <div>
                    <label className="block text-md font-medium mb-1">
                      Chọn các ngày trong tuần
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <button
                          key={day.value}
                          onClick={() => handleDayToggle(day.value)}
                          className={`p-2 rounded-lg border transition-colors ${
                            selectedDays.includes(day.value)
                              ? "bg-green-100 border-green-500"
                              : "bg-white border-gray-400 hover:bg-gray-100"
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-md font-medium mt-6 mb-1">
                      Số tuần (bắt đầu từ tuần hiện tại)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={weekCount}
                      onChange={(e) =>
                        setWeekCount(parseInt(e.target.value) || 1)
                      }
                      className="w-full rounded-lg border border-gray-400 shadow-sm focus:border-green-300 px-3 py-2"
                    />
                  </div>
                </div>
              )}

              {/* Time slots selection */}
              <div>
                <label className="block text-md font-medium mb-1">
                  Chọn khung giờ
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot.start}
                      onClick={() => handleSlotToggle(slot.start)}
                      className={`p-3 rounded-lg border transition-all duration-200 text-sm font-medium ${
                        selectedSlots.includes(slot.start)
                          ? "bg-green-100 border-green-500"
                          : "bg-white border-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      <LuClock className="inline mr-2 h-4 w-4" />
                      {slot.display}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 rounded-[16px] text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    (!bulkMode &&
                      (!selectedDate || selectedSlots.length === 0)) ||
                    (bulkMode &&
                      (selectedDays.length === 0 || selectedSlots.length === 0))
                  }
                  className="px-6 py-2 bg-green-200 rounded-[16px] hover:bg-green-200 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  Thêm Lịch Làm Việc
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAvailabilityManager;
