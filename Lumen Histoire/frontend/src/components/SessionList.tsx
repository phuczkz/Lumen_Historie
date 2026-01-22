import React, { useState, useEffect } from 'react';
import { LuCalendar, LuClock, LuUser, LuLoader, LuTriangleAlert } from 'react-icons/lu';
import sessionService, { Session, SessionStatus } from '../api/sessionService';
import { format } from 'date-fns';

interface SessionListProps {
  doctorId?: number;
  clientId?: number;
}

const getStatusColor = (status: SessionStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: SessionStatus) => {
  switch (status) {
    case 'pending':
      return 'Chờ xác nhận';
    case 'confirmed':
      return 'Đã xác nhận';
    case 'completed':
      return 'Đã hoàn thành';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return 'Không xác định';
  }
};

const SessionList: React.FC<SessionListProps> = ({ doctorId, clientId }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        // Tạm thời sử dụng order_id = 1 để test
        // Trong thực tế, bạn cần implement API để lấy sessions theo doctorId hoặc clientId
        const data = await sessionService.getByOrderId(doctorId);
        setSessions(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải danh sách phiên tư vấn');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [doctorId, clientId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LuLoader className="animate-spin h-8 w-8 text-green-600" />
        <span className="ml-2 text-gray-600">Đang tải danh sách phiên tư vấn...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg flex items-center text-red-700">
        <LuTriangleAlert className="h-5 w-5 mr-2" />
        {error}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <LuCalendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có phiên tư vấn nào</h3>
        <p className="mt-1 text-sm text-gray-500">Các phiên tư vấn sẽ xuất hiện ở đây khi được tạo.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="divide-y divide-gray-200">
        {sessions.map((session) => (
          <div key={session.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <LuCalendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-900">
                    {format(new Date(session.scheduled_at), 'dd/MM/yyyy')}
                  </span>
                  <LuClock className="h-5 w-5 text-gray-400 ml-4 mr-2" />
                  <span className="text-sm text-gray-500">
                    {format(new Date(session.scheduled_at), 'HH:mm')}
                  </span>
                </div>
                
                <div className="flex items-center mb-2">
                  <LuUser className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500">
                    ID Khách hàng: {session.client_id} | ID Chuyên gia: {session.doctor_id}
                  </span>
                </div>

                {session.notes && (
                  <p className="text-sm text-gray-600 mt-2">{session.notes}</p>
                )}
              </div>
              
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                {getStatusText(session.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionList; 