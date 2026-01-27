import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendOtp } from "../../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await sendOtp({ email });
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Lupa Password</h1>
          <p className="text-sm sm:text-base text-base-content/60">Masukkan email untuk menerima kode verifikasi</p>
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
                  <span className="label-text text-sm sm:text-base">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="nama@sekolah.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input input-bordered w-full text-sm sm:text-base"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Mengirim...
                  </>
                ) : (
                  "Kirim Kode OTP"
                )}
              </button>
            </form>

            <div className="divider text-xs sm:text-sm"></div>

            <button
              onClick={() => navigate("/login")}
              className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-md font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm sm:text-base"
            >
              Kembali ke Login
            </button>
          </div>
        </div>

        <p className="text-center text-xs sm:text-sm text-base-content/60 mt-4 px-4">
          Kode OTP berlaku selama 10 menit
        </p>
      </div>
    </div>
  );
}