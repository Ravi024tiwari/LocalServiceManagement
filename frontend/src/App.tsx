import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Dashboard from "./pages/customer/CustomerDashboard";
import CustomerProfile from "./pages/customer/CustomerProfile";
import NearbyServices from "./pages/customer/NearbyServices";
import ServiceDetailsPage from "./pages/customer/ServiceDetailsPage";
import CustomerBookings from "./pages/customer/Bookings";
import LikedServices from "./pages/customer/LikedServices";
import SupportPage from "./pages/customer/SupportPage";
import ProviderDashboard from "./pages/provider/Dashboard";
import CreateService from "./pages/provider/CreateService";
import MyServices from "./pages/provider/MyServices";
import ProviderBookings from "./pages/provider/ProviderBookings";
import ProviderCustomers from "./pages/provider/ProviderCustomers";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProviders from "./pages/admin/AdminProviders";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminCategories from "./pages/admin/AdminCategories";
import ServiceReviewsPage from "./pages/reviews/ServiceReviewsPage";
import ProviderProfilePage from "./pages/provider/ProviderProfilePage";
import AdminProfilePage from "./pages/admin/AdminProfilePage";

const ProtectedRoute = () => {
  const isAuthenticated = localStorage.getItem("token") !== null;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

const RoleBasedHome = () => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      const userObj = JSON.parse(storedUser);
      const role = (userObj.role || "").toUpperCase();
      if (role === "PROVIDER") {
        return <Navigate to="/provider" replace />;
      }
      if (role === "ADMIN") {
        return <Navigate to="/admin" replace />;
      }
    } catch (e) {
      console.error("Failed to parse stored user role", e);
    }
  }
  return <Dashboard />;
};

const RoleBasedProfile = () => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      const userObj = JSON.parse(storedUser);
      const role = (userObj.role || "").toUpperCase();
      if (role === "PROVIDER") {
        return <ProviderProfilePage />;
      }
      if (role === "ADMIN") {
        return <AdminProfilePage />;
      }
    } catch (e) {
      console.error("Failed to parse stored user role for profile", e);
    }
  }
  return <CustomerProfile />;
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <Routes>
          {/* ============================== */}
          {/* PUBLIC AUTHENTICATION ROUTES   */}
          {/* ============================== */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* ============================== */}
          {/* PROTECTED APPLICATION ROUTES   */}
          {/* ============================== */}
          <Route element={<ProtectedRoute />}>
            {/* Role-based home route -> Customer Dashboard by default, Provider/Admin auto-redirected */}
            <Route path="/" element={<RoleBasedHome />} />
            <Route path="/nearby-services" element={<NearbyServices />} />
            <Route path="/service/:serviceId" element={<ServiceDetailsPage />} />
            <Route path="/bookings" element={<CustomerBookings />} />
            <Route path="/liked-services" element={<LikedServices />} />
            <Route path="/saved" element={<LikedServices />} />
            <Route path="/service/:serviceId/reviews" element={<ServiceReviewsPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/provider" element={<ProviderDashboard />} />
            <Route path="/provider/services" element={<MyServices />} />
            <Route path="/provider/services/new" element={<CreateService />} />
            <Route path="/provider/create-service" element={<CreateService />} />
            <Route path="/provider/edit-service/:id" element={<CreateService />} />
            <Route path="/provider/bookings" element={<ProviderBookings />} />
            <Route path="/provider/customers" element={<ProviderCustomers />} />
            <Route path="/provider/profile" element={<ProviderProfilePage />} />
            <Route path="/provider/settings" element={<ProviderProfilePage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/providers" element={<AdminProviders />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/profile" element={<AdminProfilePage />} />
            <Route path="/admin/settings" element={<AdminProfilePage />} />
            <Route path="/profile" element={<RoleBasedProfile />} />
            <Route path="/settings" element={<RoleBasedProfile />} />
          </Route>
          
          {/* ============================== */}
          {/* FALLBACK ROUTE                 */}
          {/* ============================== */}
          {/* Catch-all route for 404 - Redirects to Home (which will auto-redirect to login if not authenticated) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}