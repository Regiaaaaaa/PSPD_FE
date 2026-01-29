import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from "react-hot-toast";
import LandingPage from './pages/LandingPage'
import Login from './pages/auth/Login'
import PortalRegister from "./pages/auth/PortalRegister";
import RegisterSiswa from "./pages/auth/RegisterSiswa";
import RegisterStaff from "./pages/auth/RegisterStaff";
import AdminDashboard from "./pages/admin/Dashboard";
import OperatorDashboard from "./pages/operator/Dashboard";
import UserDashboard from './pages/users/Dashboard';
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyOtp from "./pages/auth/VerifyOtp";
import ResetPassword from "./pages/auth/ResetPassword";
import AdminProfile from "./pages/admin/AdminProfile";
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Toaster 
        position="top-center" 
        toastOptions={{
          duration: 2500, 
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/portal/register" element={<PortalRegister />} />
        <Route path="/register/siswa" element={<RegisterSiswa />} />
        <Route path="/register/staff" element={<RegisterStaff />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/operator/dashboard" element={<OperatorDashboard />} />
        <Route path="/users/dashboard" element={<UserDashboard />} />

        <Route path="/admin/profile" element={<AdminProfile />} />

        {/* Forgot Password Flow */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  )
}

export default App
