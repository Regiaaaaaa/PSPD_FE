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
import ManageUsers from './pages/admin/ManageUsers/Index';
import ManageCategory from './pages/admin/ManageCategory/Index';

import ManageBooks from './pages/admin/ManageBooks/Index';
import CreateBook from './pages/admin/ManageBooks/CreateBook';
import EditBook from './pages/admin/ManageBooks/EditBook';

import KatalogBuku from './pages/users/KatalogBuku';
import PeminjamanSaya from './pages/users/PeminjamanSaya';
import DendaSaya from './pages/users/DendaSaya';
import UserProfile from "./pages/users/UserProfile";

import OperatorProfile from "./pages/operator/OperatorProfile";
import Pengembalian from "./pages/operator/Pengembalian";
import MonitoringBuku from "./pages/operator/MonitoringBuku";
import VerifikasiPeminjaman from './pages/operator/VerifikasiPeminjaman';
import ValidasiDenda from './pages/operator/ValidasiDenda';
import LaporanSummary from './pages/operator/laporan/LaporanSummary';
import LaporanTransaksi from './pages/operator/laporan/LaporanTransaksi';
import LaporanDenda from './pages/operator/laporan/LaporanDenda';
import KelolaTransaksi from './pages/operator/KelolaTransaksi';



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


        <Route path="/admin/books" element={<ManageBooks />} />
        <Route path="/admin/books/create" element={<CreateBook />} />
        <Route path="/admin/books/edit/:id" element={<EditBook />} />


        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/categories" element={<ManageCategory />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/operator/dashboard" element={<OperatorDashboard />} />
        <Route path="/users/dashboard" element={<UserDashboard />} />

        <Route path="/users/katalog-buku" element={<KatalogBuku />} />
        <Route path="/users/peminjaman-saya" element={<PeminjamanSaya />} />
        <Route path="/users/penalty" element={<DendaSaya />} />

        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/users/profile" element={<UserProfile />} />
        <Route path="/operator/profile" element={<OperatorProfile />} />
       
        <Route path="/operator/monitoring-buku" element={<MonitoringBuku />} />
         <Route path="/operator/pengembalian" element={<Pengembalian />} />
         <Route path="/operator/verifikasi-peminjaman" element={<VerifikasiPeminjaman/>} />
         <Route path="/operator/validasi-denda" element={<ValidasiDenda/>} />
        <Route path="/operator/laporan" element={<LaporanSummary />} />
        <Route path="/operator/laporan/transaksi" element={<LaporanTransaksi />} />
        <Route path="/operator/laporan/denda" element={<LaporanDenda />} />
        <Route path="/operator/kelola-transaksi" element={<KelolaTransaksi />} />


        {/* Forgot Password Flow */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  )
}

export default App
