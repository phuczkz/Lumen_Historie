import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
// Assuming react-icons is available or using placeholders
import {
  LuHouse,
  LuPackage,
  LuUsers,
  LuMessagesSquare,
  LuStar,
  LuLogOut,
  LuCalendar,
  LuStethoscope,
  LuSquareChartGantt,
} from "react-icons/lu"; // Example icons from Lucide

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Reuse the logout logic from Header.tsx if possible, or implement here
    try {
      localStorage.removeItem("userInfo");
      console.log("Admin logged out and localStorage cleared.");
      navigate("/", { replace: true }); // Redirect to login page
    } catch (error) {
      console.error("Failed to clear user info from localStorage:", error);
    }
  };

  const baseLinkClass =
    "flex items-center px-4 py-3 text-gray-700 hover:bg-green-100 hover:text-b rounded-lg transition-colors duration-150";
  const activeLinkClass = "bg-green-200 text-black font-semibold";

  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `${baseLinkClass} ${isActive ? activeLinkClass : ""}`;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo/Brand */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <img
          src="../logo.png"
          alt="Lumen Histoire Logo"
          className="h-10 mr-1"
        />
        <span className="text-xl font-bold text-gray-800">Lumen Histoire</span>
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-4 py-6 space-y-2 overflow-y-auto">
        <NavLink to="/admin" end className={getNavLinkClass}>
          <LuHouse className="mr-3 h-5 w-5" />
          Trang chủ
        </NavLink>
        <NavLink to="/admin/services" className={getNavLinkClass}>
          <LuSquareChartGantt className="mr-3 h-5 w-5" />
          Gói dịch vụ
        </NavLink>
        <NavLink to="/admin/experts" className={getNavLinkClass}>
          <LuStethoscope className="mr-3 h-5 w-5" />
          Chuyên gia
        </NavLink>
        <NavLink to="/admin/consultations" className={getNavLinkClass}>
          <LuMessagesSquare className="mr-3 h-5 w-5" />
          Ca tham vấn
        </NavLink>
        <NavLink to="/admin/schedule" className={getNavLinkClass}>
          <LuCalendar className="mr-3 h-5 w-5" />
          Lịch làm việc
        </NavLink>
        <NavLink to="/admin/customers" className={getNavLinkClass}>
          <LuUsers className="mr-3 h-5 w-5" />
          Khách hàng
        </NavLink>
        <NavLink to="/admin/reviews" className={getNavLinkClass}>
          <LuStar className="mr-3 h-5 w-5" />
          Đánh giá
        </NavLink>
      </nav>

      {/* Logout Button */}
      <div className="px-4 py-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={`${baseLinkClass} w-full text-red-600 hover:bg-red-100 hover:text-red-800`}
        >
          <LuLogOut className="mr-3 h-5 w-5" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
