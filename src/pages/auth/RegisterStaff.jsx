import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerStaff } from "../../services/authService";
import { User, Mail, Lock, Hash, Briefcase } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function RegisterStaff() {
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nomor_induk_pegawai: "",
    name: "",
    email: "",
    password: "",
    jabatan: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...form };
      if (!payload.nomor_induk_pegawai) {
        delete payload.nomor_induk_pegawai;
      }
      await registerStaff(payload);
      toast.success("Registrasi staff berhasil! Silakan login.", {
        duration: 3000,
        position: "top-center",
      });
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-3">
            <img 
              src="/icon1.png" 
              alt="Logo Taruna Bhakti" 
              className="w-10 h-10 md:w-11 md:h-11" 
            />
            <div>
              <h1 className="text-sm md:text-base font-semibold text-gray-900">
                PPSD Taruna Bhakti
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Portal Perpustakaan Sekolah Digital 
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-10">
        <div className="w-full max-w-2xl">
          {/* Page Title */}
          <div className="text-center mb-5 sm:mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs sm:text-sm font-medium mb-3">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Registrasi Staff
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5">
              Daftar Akun Staff
            </h2>
            <p className="text-sm text-gray-600">
              Lengkapi data di bawah untuk membuat akun
            </p>
          </div>

          {/* Register Form Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 sm:p-6 max-w-2xl mx-auto">
            {showAlert && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start justify-between gap-3">
              <p className="text-xs text-yellow-800">
                ⚠️ Gunakan email yang masih aktif.  
                Jika menggunakan email yang tidak aktif, silakan untuk pengajuan reset password melalu admin Perpustakaan.
              </p>


            <button
              type="button"
              onClick={() => setShowAlert(false)}
              className="text-yellow-700 hover:text-yellow-900 text-sm font-bold leading-none"
            >
                 ✕
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nomor Induk */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nomor Induk Pegawai
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="nomor_induk_pegawai"
                  placeholder="Masukkan 18 digit Nomor Induk Pegawai (opsional)"
                  value={form.nomor_induk_pegawai}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 18);
                    setForm({
                      ...form,
                      nomor_induk_pegawai: val,
                    });
                  }}
                  maxLength={18}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-md bg-white focus:outline-none focus:ring-2 
                    ${
                      form.nomor_induk_pegawai.length > 0 &&
                      form.nomor_induk_pegawai.length < 18
                        ? "border border-red-500 focus:ring-red-500"
                        : "border border-gray-300 focus:ring-blue-500"
                    }`}
                />
              </div>

              {/* pesan error */}
              {form.nomor_induk_pegawai.length > 0 &&
                form.nomor_induk_pegawai.length < 18 && (
                  <p className="text-xs text-red-500 mt-1">
                    Nomor Induk Tidak Valid
                  </p>
                )}
            </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="nama@staff.id"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Nama */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nama lengkap Anda"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kata Sandi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Minimal 6 karakter"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Jabatan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Jabatan <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="jabatan"
                    placeholder="Contoh: Guru Matematika"
                    value={form.jabatan}
                    onChange={handleChange}
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="md:col-span-2 w-full bg-blue-600 text-white py-2.5 rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Memproses..." : "Daftar"}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-5 pt-5 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Sudah punya akun?{" "}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <p className="text-center text-xs md:text-sm text-gray-600">
            © 2025 SMK Taruna Bhakti. Portal Perpustakaan Sekolah Digital (PPSD).
          </p>
        </div>
      </footer>
    </div>
  );
}