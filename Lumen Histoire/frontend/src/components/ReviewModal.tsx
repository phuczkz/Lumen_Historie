import React, { useState } from 'react';
import { LuStar, LuStarOff, LuX, LuLoader } from 'react-icons/lu';
import reviewService, { ReviewCreatePayload } from '../api/reviewService';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: number;
  clientId: number;
  onSuccess: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  clientId,
  onSuccess
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const reviewData: ReviewCreatePayload = {
        appointment_id: appointmentId,
        client_id: clientId,
        rating: rating as 1 | 2 | 3 | 4 | 5,
        comment: comment || null
      };

      await reviewService.create(reviewData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <LuX className="h-6 w-6" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">
            Đánh giá buổi tư vấn
          </h2>
          <p className="text-gray-600">Chia sẻ trải nghiệm của bạn với chúng tôi</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <label className="block text-gray-700 font-semibold mb-4 text-center">Đánh giá của bạn</label>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="focus:outline-none transform hover:scale-110 transition-transform"
                >
                  {value <= rating ? (
                    <LuStar className="h-10 w-10 text-yellow-400 fill-current drop-shadow-sm" />
                  ) : (
                    <LuStarOff className="h-10 w-10 text-gray-300 hover:text-yellow-300 transition-colors" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">
              {rating === 1 && "Rất không hài lòng"}
              {rating === 2 && "Không hài lòng"}
              {rating === 3 && "Bình thường"}
              {rating === 4 && "Hài lòng"}
              {rating === 5 && "Rất hài lòng"}
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="comment" className="block text-gray-700 font-semibold mb-3">
              Nhận xét của bạn
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Chia sẻ chi tiết về trải nghiệm của bạn..."
            />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 px-4 rounded-[16px] font-medium transition-all transform ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-100 hover:bg-green-200 hover:scale-105 shadow-lg'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <LuLoader className="animate-spin h-5 w-5 mr-2" />
                  Đang gửi...
                </span>
              ) : (
                'Gửi đánh giá'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
