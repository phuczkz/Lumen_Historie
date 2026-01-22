import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LuSearch,
  LuChevronDown,
  LuSlidersHorizontal,
  LuStar,
  LuCircleUserRound,
} from "react-icons/lu";
import reviewService from "../../api/reviewService";
import type { Review } from "../../api/reviewService";
import doctorService, { Doctor } from "../../api/doctorService";
import medicalServiceService, {
  MedicalService,
} from "../../api/medicalServiceService";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Star Rating Component (can be extracted if used elsewhere)
const StarRatingDisplay: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <LuStar
          key={i}
          className={`w-4 h-4 ${
            i < rating ? "text-yellow-500" : "text-gray-300"
          }`}
          fill={i < rating ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
};

const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("newest");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [expertFilter, setExpertFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [experts, setExperts] = useState<Doctor[]>([]);
  const [services, setServices] = useState<MedicalService[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getAll(
        currentPage,
        limit,
        searchTerm
      );
      setReviews(response.reviews);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      // TODO: Add error handling/notification
    } finally {
      setLoading(false);
    }
  };

  const fetchExperts = async () => {
    try {
      const response = await doctorService.getAll();
      setExperts(response.doctors || response);
    } catch (error) {
      console.error("Error fetching experts:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await medicalServiceService.getAll();
      setServices(response.services || response);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [currentPage, limit, searchTerm]);

  useEffect(() => {
    fetchExperts();
    fetchServices();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing limit
  };

  const formatDate = (dateString: string) => {
    return format(
      new Date(dateString),
      "EEEE, 'ngày' d 'tháng' M yyyy, HH:mm",
      { locale: vi }
    );
  };

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter((review) => {
      // Rating filter
      if (ratingFilter !== "all") {
        return review.rating === parseInt(ratingFilter);
      }
      return true;
    })
    .filter((review) => {
      // Expert filter
      if (expertFilter && expertFilter !== "all") {
        return review.expert_name === expertFilter;
      }
      return true;
    })
    .filter((review) => {
      // Service filter
      if (serviceFilter && serviceFilter !== "all") {
        return review.service_name === serviceFilter;
      }
      return true;
    });

  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.date_time).getTime() - new Date(a.date_time).getTime()
        );
      case "oldest":
        return (
          new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
        );
      case "highest":
        return b.rating - a.rating;
      case "lowest":
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        {/* Search + Clear Filters (ngang hàng) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <LuSearch className="h-5 w-5 text-gray-400" />
            </span>
            <input
              type="search"
              placeholder="Tìm kiếm ca tư vấn, khách hàng..."
              className="pl-10 pr-4 py-3 w-full rounded-[16px] border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={() => {
              setRatingFilter("all");
              setExpertFilter("all");
              setServiceFilter("all");
              setSortBy("newest");
              setSearchTerm("");
            }}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-[16px] transition-all duration-200 flex items-center gap-2"
          >
            <LuSlidersHorizontal className="h-4 w-4" />
            Xóa bộ lọc
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Rating Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Đánh giá
            </label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            >
              <option value="all">Tất cả đánh giá</option>
              <option value="5">⭐⭐⭐⭐⭐ 5 sao</option>
              <option value="4">⭐⭐⭐⭐ 4 sao</option>
              <option value="3">⭐⭐⭐ 3 sao</option>
              <option value="2">⭐⭐ 2 sao</option>
              <option value="1">⭐ 1 sao</option>
            </select>
          </div>

          {/* Expert Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Chuyên gia
            </label>
            <select
              value={expertFilter}
              onChange={(e) => setExpertFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-[16px] bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            >
              <option value="all">👨‍⚕️ Tất cả chuyên gia</option>
              {experts.map((expert) => (
                <option key={expert.id} value={expert.full_name}>
                  {expert.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Service Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Gói dịch vụ
            </label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-[16px] bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            >
              <option value="all">📦 Tất cả dịch vụ</option>
              {services.map((service) => (
                <option key={service.id} value={service.name}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Sắp xếp
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-[16px] bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            >
              <option value="newest">🕒 Mới nhất</option>
              <option value="oldest">📅 Cũ nhất</option>
              <option value="highest">⭐ Đánh giá cao nhất</option>
              <option value="lowest">📉 Đánh giá thấp nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 divide-y divide-gray-100">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Đang tải...</div>
        ) : sortedReviews.length > 0 ? (
          sortedReviews.map((review) => (
            <div
              key={review.id}
              className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50"
            >
              {/* Left Side: Customer Info */}
              <div className="flex items-center gap-3 flex-grow min-w-0">
                <div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                  <LuCircleUserRound className="h-6 w-6 text-gray-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {review.customer_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {formatDate(review.date_time)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {review.comment}
                  </p>
                </div>
              </div>

              {/* Right Side: Service, Expert, Rating */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 text-xs text-gray-600 w-full sm:w-auto flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                <div className="min-w-[120px]">
                  <p className="text-gray-400 mb-0.5">Gói dịch vụ</p>
                  <p className="font-medium text-gray-700 truncate">
                    {review.service_name}
                  </p>
                </div>
                <div className="min-w-[120px]">
                  <p className="text-gray-400 mb-0.5">Chuyên gia</p>
                  <p className="font-medium text-gray-700 truncate">
                    {review.expert_name}
                  </p>
                </div>
                <div>
                  <StarRatingDisplay rating={review.rating} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="p-6 text-center text-gray-500">
            Không có đánh giá nào.
          </p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex justify-between items-center mt-6 px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center text-sm text-gray-500">
            <select
              value={limit}
              onChange={handleLimitChange}
              className="border border-gray-300 rounded-md p-1 mr-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            >
              <option value="7">7</option>
              <option value="15">15</option>
              <option value="30">30</option>
            </select>
            <span>
              Hiển thị {(currentPage - 1) * limit + 1}-
              {Math.min(currentPage * limit, total)} trên {total} đánh giá
            </span>
          </div>

          <nav
            className="inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &lt;
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  aria-current={currentPage === pageNum ? "page" : undefined}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === pageNum
                      ? "z-10 border-green-500 bg-green-50 text-green-600"
                      : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && (
              <>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  ...
                </span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  {totalPages}
                </button>
              </>
            )}
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &gt;
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;
