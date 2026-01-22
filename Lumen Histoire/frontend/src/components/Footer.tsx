import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Company Info */}
        <div className="md:col-span-1">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Lumen Histoire - VÌ TRIỆU NGƯỜI VIỆT NAM HẠNH PHÚC HƠN MỖI NGÀY
          </h4>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Hồ Chí Minh:</strong> Tầng 7, Toà nhà Bộ Năm, số 35 Hoàng
            Diệu, Phường 13, Quận 4, Tp. Hồ Chí Minh
          </p>
          <p className="text-sm text-gray-600 mb-4">
            📞{" "}
            <strong>
              Vui lòng đặt lịch hẹn trước khi tới văn phòng - Hotline:{" "}
              <a
                href="tel:0945613585"
                className="text-green-600 hover:underline"
              >
                0945613585
              </a>
            </strong>
          </p>
          <p className="text-sm font-medium text-gray-700">
            Liên hệ công việc:
          </p>
          <p className="text-sm text-gray-600">
            📧{" "}
            <a href="mailto:contact@mindcare.vn" className="hover:underline">
              contact@lumenhistoire.vn
            </a>{" "}
            (khách hàng cá nhân)
          </p>
          <p className="text-sm text-gray-600">
            📧{" "}
            <a href="mailto:eap@mindcare.vn" className="hover:underline">
              eap@lumenhistoire.vn
            </a>{" "}
            (khách hàng tổ chức)
          </p>
        </div>

        {/* Quick Links - Giới thiệu */}
        <div>
          <h5 className="text-base font-semibold text-gray-800 mb-4">
            GIỚI THIỆU
          </h5>
          <ul className="space-y-2">
            <li>
              <Link
                to="/gioi-thieu"
                className="text-sm text-gray-600 hover:text-green-600 hover:underline"
              >
                Giới thiệu
              </Link>
            </li>
            <li>
              <Link
                to="/chuyen-gia"
                className="text-sm text-gray-600 hover:text-green-600 hover:underline"
              >
                Đội ngũ chuyên gia
              </Link>
            </li>
            <li>
              <Link
                to="/dich-vu"
                className="text-sm text-gray-600 hover:text-green-600 hover:underline"
              >
                Dịch vụ tâm lý tại Lumen Histoire
              </Link>
            </li>
            <li>
              <Link
                to="/bai-viet"
                className="text-sm text-gray-600 hover:text-green-600 hover:underline"
              >
                Bài viết chuyên đề
              </Link>
            </li>
            <li>
              <Link
                to="/lien-he"
                className="text-sm text-gray-600 hover:text-green-600 hover:underline"
              >
                Liên hệ
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Links - Dịch vụ */}
        <div>
          <h5 className="text-base font-semibold text-gray-800 mb-4">
            DỊCH VỤ
          </h5>
          <ul className="space-y-2">
            <li>
              <Link
                to="/dich-vu/14"
                className="text-sm text-gray-600 hover:text-green-600 hover:underline"
              >
                Tham vấn, trị liệu tâm lý
              </Link>
            </li>
            <li>
              <Link
                to="/tu-van-huong-nghiep"
                className="text-sm text-gray-600 hover:text-green-600 hover:underline"
              >
                Tư vấn hướng nghiệp
              </Link>
            </li>
            <li>
              <Link
                to="/dich-vu/8"
                className="text-sm text-gray-600 hover:text-green-600 hover:underline"
              >
                Dịch vụ tâm lý cho doanh nghiệp
              </Link>
            </li>
            <li>
              <Link
                to="/tam-ly-hoc-duong"
                className="text-sm text-gray-600 hover:text-green-600 hover:underline"
              >
                Tâm lý học đường
              </Link>
            </li>
            <li>
              <Link
                to="/dich-vu/15"
                className="text-sm text-gray-600 hover:text-green-600 hover:underline"
              >
                Đánh giá tâm lý
              </Link>
            </li>
            <li>
              <Link
                to="/kiem-tra-suc-khoe-tinh-than"
                className="text-sm text-gray-600 hover:text-green-600 hover:underline"
              >
                Kiểm tra sức khoẻ tinh thần miễn phí
              </Link>
            </li>
          </ul>
        </div>
      </div>
      {/* Optional: Add copyright or social media links here */}
      <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Lumen Histoire. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
