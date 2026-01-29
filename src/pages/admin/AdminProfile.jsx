// pages/admin/AdminProfile.jsx
import { useState } from "react";
import { getUser } from "../../utils/auth";
import { updateProfile, changePassword } from "../../services/authService";
import toast from "react-hot-toast";
import AdminLayout from "../../components/AppLayout";

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
      setPassword({ current_password: "", password: "", password_confirmation: "" });
    } catch {
      toast.error("Gagal ubah password");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-md space-y-6">
        <h1 className="text-lg font-semibold">Profile Admin</h1>

        {/* Profile */}
        <form onSubmit={submitProfile} className="space-y-3 bg-white p-4 border rounded">
          <input
            className="w-full border px-3 py-2 text-sm rounded"
            placeholder="Nama"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full border px-3 py-2 text-sm rounded bg-gray-100"
            value={user?.email}
            disabled
          />

          <button className="w-full bg-blue-600 text-white py-2 text-sm rounded">
            Simpan Profile
          </button>
        </form>

        {/* Password */}
        <form onSubmit={submitPassword} className="space-y-3 bg-white p-4 border rounded">
          <input
            type="password"
            placeholder="Password lama"
            className="w-full border px-3 py-2 text-sm rounded"
            value={password.current_password}
            onChange={(e) =>
              setPassword({ ...password, current_password: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password baru"
            className="w-full border px-3 py-2 text-sm rounded"
            value={password.password}
            onChange={(e) =>
              setPassword({ ...password, password: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Konfirmasi password"
            className="w-full border px-3 py-2 text-sm rounded"
            value={password.password_confirmation}
            onChange={(e) =>
              setPassword({ ...password, password_confirmation: e.target.value })
            }
          />

          <button className="w-full bg-blue-600 text-white py-2 text-sm rounded">
            Ubah Password
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}