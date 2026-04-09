import { useState } from 'react';
import toast from 'react-hot-toast';
import { createCategory } from '../../../../services/admin/managecategoryService';

const CreateCategoryModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    nama_kategori: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createCategory(formData);
      toast.success('Kategori berhasil ditambahkan');
      onClose(true);
    } catch (error) {
      toast.error(error || 'Gagal menambahkan kategori');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Tambah Kategori Baru</h3>
        
        <form onSubmit={handleSubmit}>
          <fieldset className="border border-gray-300 rounded-lg p-4 mb-4">
            <legend className="text-sm font-medium text-gray-700 px-2">Nama Kategori</legend>
            
            <div className="form-control">
              <input
                type="text"
                name="nama_kategori"
                placeholder="Masukkan nama kategori"
                className="input input-bordered bg-white w-full"
                required
                value={formData.nama_kategori}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </fieldset>

          <div className="modal-action">
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
                  <span className="loading loading-spinner loading-sm"></span>
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={() => !loading && onClose(false)}></div>
    </div>
  );
};

export default CreateCategoryModal;