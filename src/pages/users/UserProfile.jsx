import { useState } from "react";
import { getUser } from "../../utils/auth";
import { updateProfile, changePassword } from "../../services/users/profileService";
import toast from "react-hot-toast";
import AppLayout from "../../components/AppLayout";

export default function UserProfile() {
  const user = getUser();
  const isSiswa = user?.role === "siswa";
  const isStaff = user?.role === "staff";

  // State untuk profile
  const [profile, setProfile] = useState({
    name: user?.name || "",
    // Siswa fields
    kelas: user?.siswa?.kelas || "",
    tingkat: user?.siswa?.tingkat || "",
    jurusan: user?.siswa?.jurusan || "",
    nomor_induk_siswa: user?.siswa?.nomor_induk_siswa || "",
    // Staff fields
    jabatan: user?.staff?.jabatan || "",
    nomor_induk_pegawai: user?.staff?.nomor_induk_pegawai || "",
  });

  const [password, setPassword] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const submitProfile = async (e) => {
    e.preventDefault();
    
    try {
      const payload = { name: profile.name };

      if (isSiswa) {
        if (profile.kelas) payload.kelas = profile.kelas;
        if (profile.tingkat) payload.tingkat = profile.tingkat;
        if (profile.jurusan) payload.jurusan = profile.jurusan;
        if (profile.nomor_induk_siswa) payload.nomor_induk_siswa = profile.nomor_induk_siswa;
      }

      if (isStaff) {
        if (profile.jabatan) payload.jabatan = profile.jabatan;
        if (profile.nomor_induk_pegawai) payload.nomor_induk_pegawai = profile.nomor_induk_pegawai;
      }

      const res = await updateProfile(payload);
      
      // Update localStorage
      const updatedUser = { ...user, ...res.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      toast.success(res.message || "Profile diperbarui");
    } catch {
      toast.error("Gagal ubah profile");
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
              Profile {isSiswa ? "Siswa" : "Staff"}
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
                          value={profile.name}
                          onChange={(e) =>
                            setProfile({ ...profile, name: e.target.value })
                          }
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

                      {/* Field khusus Siswa */}
                      {isSiswa && (
                        <>
                          <div>
                            <label className="label">
                              <span className="label-text">Nomor Induk Siswa</span>
                            </label>
                            <input
                              type="text"
                              className="input input-bordered w-full"
                              value={profile.nomor_induk_siswa}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  nomor_induk_siswa: e.target.value,
                                })
                              }
                              maxLength={10}
                              placeholder="10 digit"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="label">
                                <span className="label-text">Tingkat</span>
                              </label>
                              <select
                                className="select select-bordered w-full"
                                value={profile.tingkat}
                                onChange={(e) =>
                                  setProfile({
                                    ...profile,
                                    tingkat: e.target.value,
                                  })
                                }
                              >
                                <option value="">Pilih Tingkat</option>
                                <option value="X">X</option>
                                <option value="XI">XI</option>
                                <option value="XII">XII</option>
                              </select>
                            </div>

                            <div>
                              <label className="label">
                                <span className="label-text">Jurusan</span>
                              </label>
                              <select
                                className="select select-bordered w-full"
                                value={profile.jurusan}
                                onChange={(e) =>
                                  setProfile({
                                    ...profile,
                                    jurusan: e.target.value,
                                  })
                                }
                              >
                                <option value="">Pilih Jurusan</option>
                                <option value="RPL">RPL</option>
                                <option value="ANIMASI">ANIMASI</option>
                                <option value="TJKT">TJKT</option>
                                <option value="TE">TE</option>
                                <option value="PSPT">PSPT</option>
                              </select>
                            </div>

                            <div>
                              <label className="label">
                                <span className="label-text">Kelas</span>
                              </label>
                              <select
                                className="select select-bordered w-full"
                                value={profile.kelas}
                                onChange={(e) =>
                                  setProfile({
                                    ...profile,
                                    kelas: e.target.value,
                                  })
                                }
                              >
                                <option value="">Pilih Kelas</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                              </select>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Field khusus Staff */}
                      {isStaff && (
                        <>
                          <div>
                            <label className="label">
                              <span className="label-text">Nomor Induk Pegawai</span>
                            </label>
                            <input
                              type="text"
                              className="input input-bordered w-full"
                              value={profile.nomor_induk_pegawai}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  nomor_induk_pegawai: e.target.value,
                                })
                              }
                              maxLength={18}
                              placeholder="18 digit"
                            />
                          </div>

                          <div>
                            <label className="label">
                              <span className="label-text">Jabatan</span>
                            </label>
                            <input
                              type="text"
                              className="input input-bordered w-full"
                              value={profile.jabatan}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  jabatan: e.target.value,
                                })
                              }
                              placeholder="Contoh: Guru Matematika"
                            />
                          </div>
                        </>
                      )}

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