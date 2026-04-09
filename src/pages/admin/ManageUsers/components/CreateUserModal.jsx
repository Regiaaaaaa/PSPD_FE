import { useState } from 'react';
import toast from 'react-hot-toast';
import { createOperator, createStaff, createSiswa } from '../../../../services/admin/manageuserService';

const CreateUserModal = ({ isOpen, onClose, defaultRole = 'operator' }) => {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(defaultRole);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    nomor_induk_siswa: '',
    tingkat: 'X',
    jurusan: 'RPL',
    kelas: '1',
    nomor_induk_pegawai: '',
    jabatan: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const roleActions = {
    operator: () => createOperator({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    }),
    staff: () => createStaff({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      jabatan: formData.jabatan,
      nomor_induk_pegawai: formData.nomor_induk_pegawai || null,
    }),
    siswa: () => createSiswa({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      nomor_induk_siswa: formData.nomor_induk_siswa,
      tingkat: formData.tingkat,
      jurusan: formData.jurusan,
      kelas: parseInt(formData.kelas),
    })
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await roleActions[selectedRole]();
      toast.success('User berhasil dibuat');
      onClose(true);
    } catch (error) {
      toast.error(error || 'Gagal membuat user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold text-lg mb-4">Tambah User Baru</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <fieldset className="border border-gray-300 rounded-lg p-4">
            <legend className="text-sm font-medium px-2">Role</legend>
            <div className="flex gap-4">
              {['operator', 'staff', 'siswa'].map(role => (
                <label key={role} className="flex items-center gap-2 cursor-pointer">
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <input
                      type="radio"
                      name="role"
                      className="appearance-none w-5 h-5 rounded-full border-2 border-gray-300 bg-white cursor-pointer"
                      value={role}
                      checked={selectedRole === role}
                      onChange={(e) => setSelectedRole(e.target.value)}
                    />
                    {selectedRole === role && (
                      <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full pointer-events-none"></div>
                    )}
                  </div>
                  <span className="text-sm capitalize">{role}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Basic Info */}
          <fieldset className="border border-gray-300 rounded-lg p-4">
            <legend className="text-sm font-medium px-2">Informasi Dasar</legend>
            <div className="space-y-3">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-sm">Nama Lengkap</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="input input-bordered w-full"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-sm">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="input input-bordered w-full"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-sm">Password</span>
                </label>
                <input
                  type="password"
                  name="password"
                  className="input input-bordered w-full"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <label className="label py-0">
                  <span className="label-text-alt">Min. 6 karakter</span>
                </label>
              </div>
            </div>
          </fieldset>

          {/* Siswa Fields */}
          {selectedRole === 'siswa' && (
            <fieldset className="border border-gray-300 rounded-lg p-4">
              <legend className="text-sm font-medium px-2">Data Siswa</legend>
              <div className="space-y-3">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm">NIS</span>
                  </label>
                  <input
                    type="text"
                    name="nomor_induk_siswa"
                    className="input input-bordered w-full"
                    value={formData.nomor_induk_siswa}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    pattern="\d{10}"
                    placeholder="10 digit"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-sm">Tingkat</span>
                    </label>
                    <select
                      name="tingkat"
                      className="select select-bordered w-full"
                      value={formData.tingkat}
                      onChange={handleChange}
                      required
                    >
                      <option value="X">X</option>
                      <option value="XI">XI</option>
                      <option value="XII">XII</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-sm">Jurusan</span>
                    </label>
                    <select
                      name="jurusan"
                      className="select select-bordered w-full"
                      value={formData.jurusan}
                      onChange={handleChange}
                      required
                    >
                      <option value="RPL">RPL</option>
                      <option value="ANIMASI">ANIMASI</option>
                      <option value="TJKT">TJKT</option>
                      <option value="TE">TE</option>
                      <option value="PSPT">PSPT</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-sm">Kelas</span>
                    </label>
                    <select
                      name="kelas"
                      className="select select-bordered w-full"
                      value={formData.kelas}
                      onChange={handleChange}
                      required
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </div>
                </div>
              </div>
            </fieldset>
          )}

          {/* Staff Fields */}
          {selectedRole === 'staff' && (
            <fieldset className="border border-gray-300 rounded-lg p-4">
              <legend className="text-sm font-medium px-2">Data Staff</legend>
              <div className="space-y-3">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm">Jabatan</span>
                  </label>
                  <input
                    type="text"
                    name="jabatan"
                    className="input input-bordered w-full"
                    value={formData.jabatan}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: Guru, Kepala Perpustakaan"
                  />
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm">NIP (Opsional)</span>
                  </label>
                  <input
                    type="text"
                    name="nomor_induk_pegawai"
                    className="input input-bordered w-full"
                    value={formData.nomor_induk_pegawai}
                    onChange={handleChange}
                    maxLength={18}
                    pattern="\d{18}"
                    placeholder="18 digit"
                  />
                </div>
              </div>
            </fieldset>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => onClose(false)}
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn bg-blue-600 hover:bg-blue-700 text-white border-none"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={() => onClose(false)}></div>
    </div>
  );
};

export default CreateUserModal;