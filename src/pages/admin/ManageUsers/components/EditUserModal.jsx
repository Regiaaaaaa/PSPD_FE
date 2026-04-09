import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { updateUser } from '../../../../services/admin/manageuserService';

const EditUserModal = ({ isOpen, onClose, user }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nomor_induk_siswa: '',
    tingkat: 'X',
    jurusan: 'RPL',
    kelas: '1',
    nomor_induk_pegawai: '',
    jabatan: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        nomor_induk_siswa: user.siswa?.nomor_induk_siswa || '',
        tingkat: user.siswa?.tingkat || 'X',
        jurusan: user.siswa?.jurusan || 'RPL',
        kelas: user.siswa?.kelas?.toString() || '1',
        nomor_induk_pegawai: user.staff?.nomor_induk_pegawai || '',
        jabatan: user.staff?.jabatan || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { name: formData.name };

      if (user.role === 'siswa') {
        payload.nomor_induk_siswa = formData.nomor_induk_siswa;
        payload.tingkat = formData.tingkat;
        payload.jurusan = formData.jurusan;
        payload.kelas = parseInt(formData.kelas);
      }

      if (user.role === 'staff') {
        payload.jabatan = formData.jabatan;
        if (formData.nomor_induk_pegawai) {
          payload.nomor_induk_pegawai = formData.nomor_induk_pegawai;
        }
      }

      await updateUser(user.id, payload);
      toast.success('User berhasil diupdate');
      onClose(true);
    } catch (error) {
      toast.error(error || 'Gagal update user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Edit User</h3>
          <span className={`px-2 py-1 text-xs font-medium rounded ${
            user.role === 'operator' ? 'bg-blue-100 text-blue-700' :
            user.role === 'staff' ? 'bg-green-100 text-green-700' : 
            'bg-purple-100 text-purple-700'
          }`}>
            {user.role.toUpperCase()}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="input input-bordered w-full bg-gray-50"
                  value={user.email}
                  disabled
                />
              </div>
            </div>
          </fieldset>

          {/* Siswa Fields */}
          {user.role === 'siswa' && (
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
          {user.role === 'staff' && (
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
                  Mengupdate...
                </>
              ) : (
                'Update'
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={() => onClose(false)}></div>
    </div>
  );
};

export default EditUserModal;