import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../services/authService";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";


export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const email = params.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setError("Konfirmasi password tidak sama");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword({
        email,
        password,
        password_confirmation: confirm,
      });

      toast.success("Password berhasil dibuat! Silakan login", {
        duration: 3000,
        position: "top-center",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Gagal reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Reset Password</h1>
            <p className="text-sm sm:text-base text-base-content/60">Buat password baru untuk akun Anda</p>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-6 sm:p-8">
              {error && (
                <div role="alert" className="alert alert-error mb-4 text-sm">
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text text-sm sm:text-base">Password Baru</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimal 8 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="input input-bordered w-full pr-12 text-sm sm:text-base"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content cursor-pointer"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>

                  </div>
                </div>

                <div className="form-control mb-6">
                  <label className="label">
                    <span className="label-text text-sm sm:text-base">Konfirmasi Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Masukkan ulang password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      className="input input-bordered w-full pr-12 text-sm sm:text-base"
                    />
                    <button
  type="button"
  onClick={() => setShowConfirm(!showConfirm)}
  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content cursor-pointer"
>
  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
</button>

                  </div>
                </div>

                <div className="bg-base-200 p-3 sm:p-4 rounded-lg mb-6">
                  <p className="text-xs sm:text-sm font-semibold mb-2">Syarat Password:</p>
                  <ul className="text-xs sm:text-sm space-y-1 text-base-content/70">
                    <li className={password.length >= 8 ? "text-success" : ""}>
                      {password.length >= 8 ? "✓" : "○"} Minimal 8 karakter
                    </li>
                    <li className={/[A-Z]/.test(password) ? "text-success" : ""}>
                      {/[A-Z]/.test(password) ? "✓" : "○"} Mengandung huruf besar
                    </li>
                    <li className={/[0-9]/.test(password) ? "text-success" : ""}>
                      {/[0-9]/.test(password) ? "✓" : "○"} Mengandung angka
                    </li>
                    <li className={password === confirm && password.length > 0 ? "text-success" : ""}>
                      {password === confirm && password.length > 0 ? "✓" : "○"} Password cocok
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={loading || password !== confirm || password.length < 8}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Menyimpan...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="text-center mt-4 px-4">
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm transition-colors"
            >
              ← Kembali ke Login
            </button>
          </div>
        </div>
      </div>
    </>
  );
}