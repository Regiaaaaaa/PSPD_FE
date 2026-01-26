import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/auth/Login'
import PortalRegister from "./pages/auth/PortalRegister";
import RegisterSiswa from "./pages/auth/RegisterSiswa";
import RegisterStaff from "./pages/auth/RegisterStaff";
import AdminDashboard from "./pages/admin/Dashboard";
import OperatorDashboard from "./pages/operator/Dashboard";
import UserDashboard from './pages/users/Dashboard';

import ScrollToTop from './components/ScrollToTop'; // ⬅️ TAMBAH INI

function App() {
  return (
    <Router>
      <ScrollToTop /> 
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/portal/register" element={<PortalRegister />} />
        <Route path="/register/siswa" element={<RegisterSiswa />} />
        <Route path="/register/staff" element={<RegisterStaff />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/operator/dashboard" element={<OperatorDashboard />} />
        <Route path="/users/dashboard" element={<UserDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
