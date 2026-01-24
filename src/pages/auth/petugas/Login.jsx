import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginPetugas } from "../../../services/authService";
import { saveAuth } from "../../../utils/auth";
import { Shield, Mail, Lock } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await loginPetugas({ email, password });
      saveAuth(res);

      if (res.user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (res.user.role === "operator") {
        navigate("/operator/dashboard");
      } else {
        setError("Role tidak valid");
      }
    } catch (err) {
      setError(err.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <img src="/icon1.png" alt="Logo Taruna Bhakti" className="w-10 h-10 md:w-11 md:h-11" />
            <div>
              <h1 className="text-sm md:text-base font-semibold text-gray-900">PSPD Taruna Bhakti</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Portal Sistem Perpustakaan Digital</p>
            </div>
          </div>
          <a href="/" className="text-xs sm:text-sm text-gray-600 hover:text-gray-900">Beranda</a>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Page Title */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-100 text-slate-700 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Login Petugas
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Masuk ke Akun Petugas</h2>
            <p className="text-sm sm:text-base text-gray-600">Masukkan kredensial Anda untuk melanjutkan</p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="nama@sekolah.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
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
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    placeholder="Masukkan kata sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </div>

            {/* Help Link */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Mengalami kendala? <a href="/help" className="text-blue-600 hover:text-blue-700 font-medium">Hubungi Admin</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <p className="text-xs sm:text-sm text-gray-500 text-center">
            © 2025 SMA Taruna Bhakti. Portal Sistem Perpustakaan Digital (PSPD).
          </p>
        </div>
      </div>
    </div>
  );
}