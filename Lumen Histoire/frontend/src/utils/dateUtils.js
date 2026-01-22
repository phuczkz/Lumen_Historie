import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * Chuyển đổi chuỗi ngày ISO thành định dạng YYYY-MM-DD
 * Không tạo đối tượng Date để tránh vấn đề lệch múi giờ
 * @param {string} dateString - Chuỗi ngày định dạng ISO
 * @returns {string} Ngày định dạng YYYY-MM-DD
 */
export const formatISOToYYYYMMDD = (dateString) => {
  if (!dateString) return "";
  return dateString.split("T")[0];
};

/**
 * Format date để hiển thị cho người dùng
 * Sử dụng cho các phần hiển thị ngày tháng trong UI
 * @param {string} dateString - Chuỗi ngày định dạng ISO
 * @param {string} [formatStr='dd/MM/yyyy'] - Định dạng đầu ra
 * @returns {string} Ngày đã được định dạng
 */
export const formatDateForDisplay = (dateString, formatStr = "dd/MM/yyyy") => {
  try {
    // Xử lý đặc biệt để tránh vấn đề lệch ngày khi tạo Date
    if (!dateString) return "";

    // Trích xuất phần ngày để tránh vấn đề múi giờ
    const dateOnly = dateString.split("T")[0];
    const [year, month, day] = dateOnly.split("-").map(Number);

    // Tạo date với giờ cố định là 12:00 để tránh vấn đề lệch ngày
    const date = new Date(year, month - 1, day, 12, 0, 0);

    return format(date, formatStr, { locale: vi });
  } catch (err) {
    console.error("Error formatting date:", err, dateString);
    return dateString;
  }
};

/**
 * Format date và time từ chuỗi ISO
 * @param {string} dateString - Chuỗi ngày định dạng ISO
 * @param {string} [formatStr='HH:mm - dd/MM/yyyy'] - Định dạng đầu ra
 * @returns {string} Ngày và giờ đã được định dạng
 */
export const formatDateTime = (
  dateString,
  formatStr = "HH:mm - dd/MM/yyyy"
) => {
  try {
    if (!dateString) return "";

    // Sử dụng parseISO để xử lý chuỗi ISO
    const date = parseISO(dateString);
    return format(date, formatStr, { locale: vi });
  } catch (err) {
    console.error("Error formatting date and time:", err, dateString);
    return dateString;
  }
};

/**
 * Chuyển đổi đối tượng Date thành chuỗi YYYY-MM-DD
 * Sử dụng cho các API request
 * @param {Date} date - Đối tượng Date cần chuyển đổi
 * @returns {string} Ngày định dạng YYYY-MM-DD
 */
export const formatDateToYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
