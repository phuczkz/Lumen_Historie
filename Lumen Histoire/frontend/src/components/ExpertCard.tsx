import React from "react";
import { LuPhone, LuStar } from "react-icons/lu";
import { DoctorService } from "../api/doctorService";
import { Link } from "react-router-dom";

interface ExpertCardProps {
  id: string;
  name: string;
  imageUrl: string;
  phone: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  services?: DoctorService[];
}

// Helper for rendering stars
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center justify-center">
      {[...Array(fullStars)].map((_, i) => (
        <LuStar
          key={`full-${i}`}
          fill="currentColor"
          className="w-3 h-3 text-yellow-400"
        />
      ))}
      {[...Array(emptyStars)].map((_, i) => (
        <LuStar key={`empty-${i}`} className="w-3 h-3 text-gray-300" />
      ))}
    </div>
  );
};

const ExpertCard: React.FC<ExpertCardProps> = ({
  id,
  name,
  imageUrl,
  phone,
  specialty,
  rating,
  reviewCount,
  services,
}) => {
  return (
    <Link to={`/admin/experts/${id}`} title="Xem chi tiết chuyên gia">
      <div className="bg-white rounded-[16px] shadow-sm border border-gray-300 overflow-hidden hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
        {/* Avatar and basic info */}
        <div className="p-4 text-center flex-1 flex flex-col">
          <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={imageUrl}
              alt={`Portrait of ${name}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  "https://via.placeholder.com/64x64.png?text=Avatar";
              }}
            />
          </div>

          <h3 className="font-bold text-lg mb-1 flex-shrink-0">{name}</h3>

          <div className="flex items-center justify-center gap-8 text-sm mb-2 text-gray-600">
            <span className="font-semibold">DB-{id.padStart(3, "0")}</span>

            {/* Phone */}
            <div className="flex items-center">
              <LuPhone className="w-3 h-3 mr-2" />
              <span>{phone || "Chưa cập nhật"}</span>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-1 mb-3 flex-1 flex flex-col justify-start min-h-[2.5rem]">
            {services && services.length > 0 ? (
              services.slice(0, 2).map((service, index) => (
                <div key={service.id} className="text-xs">
                  {service.name}
                </div>
              ))
            ) : (
              <>
                <div className="text-xs">Tham vấn, trị liệu tâm lý</div>
                <div className="text-xs">Đánh giá tâm lý</div>
              </>
            )}
            {services && services.length > 2 && (
              <div className="text-xs">+{services.length - 2} dịch vụ khác</div>
            )}
          </div>

          {/* Rating */}
          <div className="mb-2 flex-shrink-0">
            <StarRating rating={rating} />
            <div className="text-sm mt-1">
              <span className="font-medium">{rating}</span>
              <span className="mx-1">•</span>
              <span>({reviewCount} đánh giá)</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ExpertCard;
