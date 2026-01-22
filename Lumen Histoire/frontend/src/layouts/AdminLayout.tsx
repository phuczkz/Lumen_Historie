import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

// Helper function to generate title from path (can be customized)
const getTitleFromPath = (pathname: string): string => {
  const pathSegments = pathname.split('/').filter(segment => segment);
  if (pathSegments.length < 2) return 'Trang chủ Admin'; // Default for /admin

  const lastSegment = pathSegments[pathSegments.length - 1];
  // Basic capitalization and replacement
  let title = lastSegment.replace(/-/g, ' ');
  title = title.charAt(0).toUpperCase() + title.slice(1);

  // Add more specific titles if needed
  switch (pathname) {
    case '/admin': return 'Trang chủ Admin';
    case '/admin/services': return 'Quản lý Gói dịch vụ';
    case '/admin/experts': return 'Quản lý Chuyên gia';
    case '/admin/consultations': return 'Quản lý Ca tham vấn';
    case '/admin/customers': return 'Quản lý Khách hàng';
    case '/admin/reviews': return 'Quản lý Đánh giá';
    case '/admin/profile': return 'Hồ sơ Admin';
    case '/admin/settings': return 'Cài đặt Admin';
    // Add cases for deeper routes, e.g., /admin/experts/add
    default: return title; // Fallback to capitalized segment
  }
};

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('Trang chủ Admin');

  useEffect(() => {
    setPageTitle(getTitleFromPath(location.pathname));
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title={pageTitle} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          {/* Page content goes here */}
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 