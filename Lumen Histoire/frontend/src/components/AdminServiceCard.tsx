import React from 'react';
import { Link } from 'react-router-dom';
import { LuTrash2, LuFilePenLine, LuStethoscope } from 'react-icons/lu';

interface AdminServiceCardProps {
  id: string;
  title: string;
  imageUrl: string;
  descriptionSnippet: string;
  price: number;
  numberOfSessions: number;
  expertNames: string[];
  expertDetails?: Array<{
    id: number;
    name: string;
    specialty: string;
  }>;
  onDelete: (id: string) => void;
}

const AdminServiceCard: React.FC<AdminServiceCardProps> = ({
  id,
  title,
  imageUrl,
  descriptionSnippet,
  price,
  numberOfSessions,
  expertNames,
  expertDetails,
  onDelete
}) => {
  const handleDelete = () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${title}" không?`)) {
      onDelete(id);
    }
  };

  return (
    <Link to={`/admin/services/${id}`} className="block h-full">
      <div className="bg-white rounded-[16px] border border-gray-300 overflow-hidden hover:shadow-md transition-shadow duration-200 max-w-sm flex flex-col h-full">
        {/* Service Image */}
        <div className="relative h-[150px]">
          <img 
            src={imageUrl || 'https://via.placeholder.com/300x225.png?text=Service+Image'}
            alt={`Image for ${title}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/300x225.png?text=Service+Image';
            }}
          />
        </div>

        {/* Service Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Số buổi */}
          <div>
            <span className="bg-green-100 text-xs font-medium px-3 py-1 rounded-full">
              {numberOfSessions} buổi
            </span>
          </div>


          {/* Tiêu đề dịch vụ */}
          <h3 className="font-bold text-lg mt-2 mb-2 line-clamp-2 leading-tight">
            {title}
          </h3>
          
          {/* Mô tả */}
          <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
            {descriptionSnippet}
          </p>

          {/* Chuyên gia */}
          <div className="mb-4">
            <div className="flex items-start text-sm text-gray-600 mt-3">
              <LuStethoscope className="w-4 h-4 mr-2" />
              {expertNames && expertNames.length > 0 ? (
                <div className="space-y-1">
                  {expertNames.slice(0, 2).map((expertName, index) => (
                    <div key={index} className="text-xs">
                      <span className="font-medium text-gray-700">{expertName}</span>
                    </div>
                  ))}
                  {expertNames.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{expertNames.length - 2} chuyên gia khác
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-sm text-gray-400 italic">Chưa có chuyên gia</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 mt-auto">
            <button
              onClick={handleDelete}
              className="flex-1 flex items-center justify-center bg-gray-200 py-1.5 px-1 rounded-[16px] hover:bg-gray-300 text-sm font-medium"
            >
              <LuTrash2 className="w-4 h-4 mr-2" />
              Xóa
            </button>
            <Link 
              to={`/admin/services/${id}/edit`}
              className="flex-1 flex items-center justify-center bg-red-200 py-1.5 px-1 rounded-[16px] hover:bg-red-300 text-sm font-medium"
            >
              <LuFilePenLine className="w-4 h-4 mr-2" />
              Sửa
            </Link>
          </div>
        </div>
      </div>
    </Link> 
  );
};

export default AdminServiceCard;