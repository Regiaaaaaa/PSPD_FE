// pages/admin/AdminProfile.jsx
import { useState } from "react";
import { getUser } from "../../utils/auth";
import { updateProfile, changePassword } from "../../services/authService";
import toast from "react-hot-toast";
import AppLayout from "../../components/AppLayout";

export default function AdminProfile() {
  const user = getUser();

  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const submitProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfile({ name });
      localStorage.setItem("user", JSON.stringify({ ...user, name }));
      toast.success(res.message || "Profile diperbarui");
    } catch {
      toast.error("Gagal update profile");
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();

    if (password.password !== password.password_confirmation) {
      return toast.error("Konfirmasi password tidak cocok");
    }

    try {
      const res = await changePassword(password);
      toast.success(res.message || "Password berhasil diubah");
      setPassword({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
    } catch {
      toast.error("Gagal ubah password");
    }
  };

  return (
    <AppLayout>
      <div className="w-full flex justify-center px-4 py-6">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-gray-800">
              Profile Admin
            </h1>
            <p className="text-sm text-gray-500">
              Kelola informasi akun dan keamanan
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="tabs tabs-lift px-4 pt-3">
              {/* ================= PROFILE ================= */}
              <input
                type="radio"
                name="profile_tabs"
                defaultChecked
                aria-label="Profile"
                className="
                  tab
                  font-medium
                  text-gray-700
                  checked:text-blue-600
                  [--tab-bg:#f1f5f9]
                  [--tab-border-color:transparent]
                "
              />

              <div className="tab-content bg-white p-0 pb-6">
                <form onSubmit={submitProfile}>
                  <fieldset className="fieldset p-4">
                    <legend className="fieldset-legend text-sm font-semibold">
                      Informasi Profile
                    </legend>

                    <div className="space-y-4">
                      <div>
                        <label className="label">
                          <span className="label-text">Nama</span>
                        </label>
                        <input
                          className="input input-bordered w-full"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text">Email</span>
                        </label>
                        <input
                          className="input input-bordered w-full bg-gray-100"
                          value={user?.email}
                          disabled
                        />
                      </div>

                      <button className="btn bg-blue-600 hover:bg-blue-700 text-white border-none w-fit mt-2">
  Simpan Profile
</button>

                    </div>
                  </fieldset>
                </form>
              </div>

              {/* ================= SECURITY ================= */}
              <input
                type="radio"
                name="profile_tabs"
                aria-label="Security"
                className="
                  tab
                  font-medium
                  text-gray-700
                  checked:text-blue-600
                  [--tab-bg:#f1f5f9]
                  [--tab-border-color:transparent]
                "
              />

              <div className="tab-content bg-white p-0 pb-6">

                <form onSubmit={submitPassword}>
                  <fieldset className="fieldset p-4">
                    <legend className="fieldset-legend text-sm font-semibold">
                      Keamanan Akun
                    </legend>

                    <div className="space-y-4">
                      <div>
                        <label className="label">
                          <span className="label-text">Password Lama</span>
                        </label>
                        <input
                          type="password"
                          className="input input-bordered w-full"
                          value={password.current_password}
                          onChange={(e) =>
                            setPassword({
                              ...password,
                              current_password: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text">Password Baru</span>
                        </label>
                        <input
                          type="password"
                          className="input input-bordered w-full"
                          value={password.password}
                          onChange={(e) =>
                            setPassword({
                              ...password,
                              password: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text">
                            Konfirmasi Password
                          </span>
                        </label>
                        <input
                          type="password"
                          className="input input-bordered w-full"
                          value={password.password_confirmation}
                          onChange={(e) =>
                            setPassword({
                              ...password,
                              password_confirmation: e.target.value,
                            })
                          }
                        />
                      </div>

                      <button className="btn bg-blue-600 hover:bg-blue-700 text-white border-none w-fit">
                        Ubah Password
                      </button>
                    </div>
                  </fieldset>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
