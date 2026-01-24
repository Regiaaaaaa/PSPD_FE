import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPetugas from './pages/auth/petugas/Login'
import RegisterSiswa from "./pages/auth/siswa/Register";
import LoginSiswa from "./pages/auth/siswa/Login";
import RegisterStaff from "./pages/auth/staff/Register";
import LoginStaff from "./pages/auth/staff/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import OperatorDashboard from "./pages/operator/Dashboard";
import UserDashboard from './pages/users/Dashboard';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login/petugas" element={<LoginPetugas />} />
        <Route path="/login/siswa" element={<LoginSiswa />} />
        <Route path="/login/staff" element={<LoginStaff />} />
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