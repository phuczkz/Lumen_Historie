import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import Homepage from './pages/homepage';
import ExpertsPage from './pages/experts';
import ExpertDetailPage from './pages/ExpertDetailPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import AdminLoginPage from './pages/LoginPage';
import AdminRegisterPage from './pages/RegisterPage';
import ClientLoginPage from './pages/ClientLoginPage';
import ClientRegisterPage from './pages/ClientRegisterPage';
import ContactPage from './pages/ContactPage';
import AboutUsPage from './pages/AboutUsPage';
import EthicsPage from './pages/EthicsPage';
import FaqPage from './pages/FaqPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminConsultationsPage from './pages/admin/AdminConsultationsPage';
import AdminConsultationDetailPage from './pages/admin/AdminConsultationDetailPage';
import AdminSchedulePage from './pages/admin/AdminSchedulePage';
import AdminExpertsPage from './pages/admin/AdminExpertsPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminServiceDetailPage from './pages/admin/AdminServiceDetailPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminCustomerDetailPage from './pages/admin/AdminCustomerDetailPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminAddExpertPage from './pages/admin/AdminAddExpertPage';
import AdminEditExpertPage from './pages/admin/AdminEditExpertPage';
import AdminExpertDetailPage from './pages/admin/AdminExpertDetailPage';
import AdminAddServicePage from './pages/admin/AdminAddServicePage';
import AdminEditServicePage from './pages/admin/AdminEditServicePage';
import AdminAddCustomerPage from './pages/admin/AdminAddCustomerPage';
import AdminEditCustomerPage from './pages/admin/AdminEditCustomerPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import ClientProfilePage from './pages/client/ClientProfilePage';
import AppointmentsPage from './pages/AppointmentsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Homepage />} />
        <Route path="profile" element={<ClientProfilePage />} />
        <Route path="lich-hen" element={<AppointmentsPage />} />
        <Route path="chuyen-gia" element={<ExpertsPage />} />
        <Route path="chuyen-gia/:expertId" element={<ExpertDetailPage />} />
        <Route path="dich-vu">
          <Route index element={<ServicesPage />} />
          <Route path=":serviceId" element={<ServiceDetailPage />} />
        </Route>
        <Route path="lien-he" element={<ContactPage />} />
        <Route path="gioi-thieu">
          <Route index element={<AboutUsPage />} />
          <Route path="ve-chung-toi" element={<AboutUsPage />} />
          <Route path="nguyen-tac-dao-duc" element={<EthicsPage />} />
          <Route path="cau-hoi-thuong-gap" element={<FaqPage />} />
        </Route>
      </Route>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/register" element={<AdminRegisterPage />} />
      <Route path="/client/login" element={<ClientLoginPage />} />
      <Route path="/client/register" element={<ClientRegisterPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="profile" element={<AdminProfilePage />} />
        <Route path="consultations">
          <Route index element={<AdminConsultationsPage />} />
          <Route path=":orderId" element={<AdminConsultationDetailPage />} />
        </Route>
        <Route path="schedule" element={<AdminSchedulePage />} />
        <Route path="experts">
          <Route index element={<AdminExpertsPage />} />
          <Route path="add" element={<AdminAddExpertPage />} />
          <Route path=":expertId" element={<AdminExpertDetailPage />} />
          <Route path=":expertId/edit" element={<AdminEditExpertPage />} />
        </Route>
        <Route path="services">
          <Route index element={<AdminServicesPage />} />
          <Route path="add" element={<AdminAddServicePage />} />
          <Route path=":serviceId" element={<AdminServiceDetailPage />} />
          <Route path=":serviceId/edit" element={<AdminEditServicePage />} />
        </Route>
        <Route path="customers">
          <Route index element={<AdminCustomersPage />} />
          <Route path="add" element={<AdminAddCustomerPage />} />
          <Route path=":customerId" element={<AdminCustomerDetailPage />} />
          <Route path=":customerId/edit" element={<AdminEditCustomerPage />} />
        </Route>
        <Route path="reviews" element={<AdminReviewsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
