import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyOtp } from "../../services/authService";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const email = params.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await verifyOtp({ email, otp });
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
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
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Verifikasi OTP</h1>
          <p className="text-sm sm:text-base text-base-content/60">Masukkan kode yang dikirim ke email Anda</p>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-6 sm:p-8">
            <div className="alert bg-blue-50 mb-6">
              <div className="w-full">
                <div className="text-xs sm:text-sm text-base-content/60">Kode OTP dikirim ke:</div>
                <div className="font-semibold break-all text-sm sm:text-base">{email}</div>
              </div>
            </div>

            {error && (
              <div role="alert" className="alert alert-error mb-4 text-sm">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text text-sm sm:text-base">Kode OTP</span>
                  <span className="label-text-alt text-xs sm:text-sm">6 digit</span>
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  maxLength={6}
                  className="input input-bordered input-lg w-full text-center text-xl sm:text-2xl font-mono tracking-widest"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-blue-600 text-white py-2.5 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Memverifikasi...
                  </>
                ) : (
                  "Verifikasi Kode"
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="text-center mt-4 px-4">
          <p className="text-xs sm:text-sm text-base-content/60 mb-2">Kode berlaku selama 10 menit</p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm transition-colors"
          >
            ← Kembali
          </button>
        </div>
      </div>
    </div>
  );
}