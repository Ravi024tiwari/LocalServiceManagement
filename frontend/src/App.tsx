import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Dashboard from "./pages/customer/CustomerDashboard";
import CustomerProfile from "./pages/customer/CustomerProfile";
import NearbyServices from "./pages/customer/NearbyServices";
import CustomerBookings from "./pages/customer/Bookings";
import ProviderDashboard from "./pages/provider/Dashboard";
import CreateService from "./pages/provider/CreateService";
import MyServices from "./pages/provider/MyServices";
import ProviderBookings from "./pages/provider/ProviderBookings";

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

const AdminDashboard = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
    <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 max-w-md text-center space-y-4">
      <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto font-bold text-2xl">
        👑
      </div>
      <h1 className="text-2xl font-extrabold text-gray-900">Admin Portal</h1>
      <p className="text-gray-500 text-sm">
        Logged in as Administrator. Platform management & system metrics overview.
      </p>
      <button 
        onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md shadow-red-200 transition-all"
      >
        Log Out
      </button>
    </div>
  </div>
);

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
            <Route path="/bookings" element={<CustomerBookings />} />
            <Route path="/provider" element={<ProviderDashboard />} />
            <Route path="/provider/services" element={<MyServices />} />
            <Route path="/provider/services/new" element={<CreateService />} />
            <Route path="/provider/create-service" element={<CreateService />} />
            <Route path="/provider/edit-service/:id" element={<CreateService />} />
            <Route path="/provider/bookings" element={<ProviderBookings />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/profile" element={<CustomerProfile />} />
            <Route path="/settings" element={<CustomerProfile />} />
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