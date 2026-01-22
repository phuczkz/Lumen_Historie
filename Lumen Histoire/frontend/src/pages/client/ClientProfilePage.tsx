import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuUser,
  LuLock,
  LuSave,
  LuLoader,
  LuMail,
  LuImage,
  LuPhone,
} from "react-icons/lu";
import authService, { ClientProfile } from "../../api/authService";
import uploadFileApi from "../../api/uploadFileApi";

const ClientProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await authService.getClientProfile();
      setProfile(data);
      setFullName(data.full_name);
      setAvatarUrl(data.avatar_url);
      setPhone(data.phone || "");
      setGender(data.gender || "");
      setDob(data.birth_date || "");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error fetching profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      const uploadedUrl = await uploadFileApi.uploadFile(event);
      setAvatarUrl(uploadedUrl);
      setSuccess("Avatar uploaded successfully");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error uploading avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      setUpdating(true);
      const updateData = {
        full_name: fullName,
        avatar_url: avatarUrl || undefined,
        phone,
        gender,
        birth_date: dob,
        ...(currentPassword && newPassword
          ? { currentPassword, newPassword }
          : {}),
      };

      await authService.updateClientProfile(updateData);

      setSuccess("Profile updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Lấy lại profile mới nhất
      const updatedProfile = await authService.getClientProfile();
      setProfile(updatedProfile);
      setFullName(updatedProfile.full_name);
      setAvatarUrl(updatedProfile.avatar_url);
      setPhone(updatedProfile.phone || "");
      setGender(updatedProfile.gender || "");
      setDob(
        updatedProfile.birth_date ? updatedProfile.birth_date.slice(0, 10) : ""
      );

      // Cập nhật avatar_url và full_name vào localStorage (và userInfo nếu có)
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const updatedUserInfo = {
        ...userInfo,
        full_name: updatedProfile.full_name,
        avatar_url: updatedProfile.avatar_url,
      };
      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
      window.dispatchEvent(new Event("userInfoUpdated"));
    } catch (err: any) {
      setError(err.response?.data?.message || "Error updating profile");
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
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Nút quay lại trang chủ nằm trên cùng, chiếm toàn bộ chiều ngang */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-8"
          style={{ background: "none", border: "none", padding: 0 }}
        >
          <svg
            className="h-5 w-5 mr-2"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Quay lại trang chủ
        </button>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar & Upload */}
          <div className="flex flex-col items-center md:w-1/3">
            <img
              className="h-32 w-32 object-cover rounded-full border border-gray-200"
              src={
                avatarUrl ||
                "https://via.placeholder.com/128x128.png?text=Avatar"
              }
              alt="Profile avatar"
            />
            <label className="mt-4 w-full flex flex-col items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="hidden"
              />
              <button
                type="button"
                className="bg-green-200 hover:bg-green-300 text-green-800 font-medium py-2 px-6 rounded-[16px] shadow mt-2"
                onClick={() =>
                  document
                    .querySelector<HTMLInputElement>("#avatar-upload")
                    ?.click()
                }
                disabled={uploading}
              >
                {uploading ? (
                  <LuLoader className="animate-spin inline-block mr-2 h-5 w-5" />
                ) : (
                  <LuImage className="inline-block mr-2 h-4 w-4" />
                )}
                Upload
              </button>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          {/* Personal Info & Change Password */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              My Profile
            </h1>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-8 pl-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm rounded-[16px]"
                      required
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profile?.email || ""}
                        className="h-8 pl-2 block w-full rounded-md border border-gray-300 bg-gray-50 shadow-sm text-gray-500 sm:text-sm rounded-[16px]"
                        disabled
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-8 pl-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm rounded-[16px]"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="h-8 pl-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm rounded-[16px]"
                      >
                        <option value="">Chọn Giới tính</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="h-8 pl-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm rounded-[16px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Change Password
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="h-8 pl-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm rounded-[16px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-8 pl-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm rounded-[16px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-8 pl-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm  rounded-[16px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updating || uploading}
                  className="inline-flex items-center px-4 py-2 bg-green-200 text-green-800 font-medium rounded-[16px] shadow-sm text-sm hover:bg-green-300 transition-colors disabled:opacity-50"
                >
                  {updating ? (
                    <>
                      <LuLoader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <LuSave className="-ml-1 mr-2 h-5 w-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>

            {profile && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Member Since
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Last Updated
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(profile.updated_at).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Account Status
                    </dt>
                    <dd className="mt-1 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          profile.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {profile.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfilePage;
