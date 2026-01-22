import React, { useState, useEffect } from 'react';
import { LuUser, LuLock, LuSave, LuLoader } from 'react-icons/lu';
import authService, { AdminProfile } from '../../api/authService';

const AdminProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await authService.getAdminProfile();
      setProfile(data);
      setUsername(data.username);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate passwords match if changing password
    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setUpdating(true);
      const updateData = {
        username,
        ...(currentPassword && newPassword ? { currentPassword, newPassword } : {})
      };

      await authService.updateAdminProfile(updateData);

      setSuccess('Profile updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      fetchProfile(); // Refresh profile data
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LuLoader className="animate-spin h-8 w-8 text-green-600" />
      </div>
    );
  }

  return (
  <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Thông tin tài khoản Admin</h1>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 border border-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-md bg-green-100 text-green-700 border border-green-300">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Thông tin đăng nhập */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Thông tin đăng nhập</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Tên đăng nhập</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <LuUser className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-base h-11"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Đổi mật khẩu */}
        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Đổi mật khẩu</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Mật khẩu hiện tại</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <LuLock className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-base h-11"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Mật khẩu mới</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <LuLock className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-base h-11"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <LuLock className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-base h-11"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Nút lưu */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updating}
            className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {updating ? (
              <>
                <LuLoader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Đang cập nhật...
              </>
            ) : (
              <>
                <LuSave className="-ml-1 mr-2 h-5 w-5" />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </form>

      {/* Thông tin thêm */}
      {profile && (
        <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-600">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-gray-700">Thành viên từ:</span>{' '}
              {new Date(profile.created_at).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium text-gray-700">Cập nhật lần cuối:</span>{' '}
              {new Date(profile.updated_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);


};

export default AdminProfilePage; 