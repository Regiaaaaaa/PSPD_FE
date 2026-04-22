import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { createBook } from '../../../services/admin/bookService';
import { getAllCategories } from '../../../services/admin/managecategoryService';
import AppLayout from '../../../components/AppLayout';

const CreateBook = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    isbn: '',
    kategori_id: [], 
    judul: '',
    penulis: '',
    penerbit: '',
    tahun_terbit: '',
    stok_total: 0,
    cover: null,
  });
  const [coverPreview, setCoverPreview] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data.data || []);
    } catch (error) {
      toast.error('Gagal memuat kategori');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleKategoriChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(o => o.value);
    setFormData((prev) => ({ ...prev, kategori_id: selected }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 2 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      toast.error('Format file harus JPG, JPEG, atau PNG');
      e.target.value = '';
      return;
    }

    if (file.size > maxSize) {
      toast.error('Ukuran file maksimal 2MB');
      e.target.value = '';
      return;
    }

    setFormData((prev) => ({ ...prev, cover: file }));
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.isbn.trim()) {
      toast.error('ISBN harus diisi');
      return;
    }

    if (formData.isbn.length < 10 || formData.isbn.length > 13) {
      toast.error('ISBN harus 10-13 digit angka');
      return;
    }

    if (!/^\d+$/.test(formData.isbn)) {
      toast.error('ISBN hanya boleh berisi angka');
      return;
    }

    if (!formData.kategori_id.length) {
      toast.error('Minimal pilih 1 kategori');
      return;
    }

    if (!formData.judul.trim()) {
      toast.error('Judul buku harus diisi');
      return;
    }

    if (formData.tahun_terbit && formData.tahun_terbit.length !== 4) {
      toast.error('Tahun terbit harus 4 digit');
      return;
    }

    if (formData.stok_total < 0) {
      toast.error('Stok total tidak boleh negatif');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('isbn', formData.isbn);
      formData.kategori_id.forEach(id => {
        formDataToSend.append('kategori_id[]', id);
      });

      formDataToSend.append('judul', formData.judul);
      formDataToSend.append('penulis', formData.penulis || '');
      formDataToSend.append('penerbit', formData.penerbit || '');
      formDataToSend.append('tahun_terbit', formData.tahun_terbit || '');
      formDataToSend.append('stok_total', formData.stok_total);

      if (formData.cover) {
        formDataToSend.append('cover', formData.cover);
      }

      await createBook(formDataToSend);
      toast.success('Buku berhasil ditambahkan');
      navigate('/admin/books');
    } catch (error) {
      toast.error(error || 'Gagal menambahkan buku');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 max-w-4xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <button
            className="btn btn-ghost btn-xs sm:btn-sm mb-3 sm:mb-4 gap-2"
            onClick={() => navigate('/admin/books')}
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Kembali</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Tambah Buku Baru</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Tambahkan buku baru ke perpustakaan</p>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <form onSubmit={handleSubmit}>
            {/* Book Information */}
            <fieldset className="border border-gray-300 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <legend className="text-xs sm:text-sm font-medium text-gray-700 px-2">Informasi Buku</legend>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">

                {/* Judul */}
                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text text-xs sm:text-sm font-medium">
                      Judul Buku <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="judul"
                    placeholder="Masukkan judul buku"
                    className="input input-sm sm:input-md input-bordered bg-white w-full"
                    value={formData.judul}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>

                {/* ISBN */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-xs sm:text-sm font-medium">
                      ISBN <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="isbn"
                    placeholder="Masukkan ISBN (10-13 digit)"
                    maxLength="13"
                    className="input input-sm sm:input-md input-bordered bg-white w-full"
                    value={formData.isbn}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                  <label className="label">
                    <span className="label-text-alt text-xs text-gray-500">
                      Hanya angka, 10-13 digit (ISBN-10 atau ISBN-13)
                    </span>
                  </label>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-xs sm:text-sm font-medium">
                      Kategori <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    multiple
                    name="kategori_id"
                    className="select select-sm sm:select-md select-bordered bg-white w-full h-32"
                    value={formData.kategori_id}
                    onChange={handleKategoriChange}
                    disabled={loading}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={String(cat.id)}>
                        {cat.nama_kategori}
                      </option>
                    ))}
                  </select>
                  <label className="label">
                  </label>
                  {formData.kategori_id.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.kategori_id.map(id => {
                        const cat = categories.find(c => String(c.id) === id);
                        return cat ? (
                          <span key={id} className="badge badge-primary badge-xs">{cat.nama_kategori}</span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-xs sm:text-sm font-medium">Penulis</span>
                  </label>
                  <input
                    type="text"
                    name="penulis"
                    placeholder="Masukkan nama penulis"
                    className="input input-sm sm:input-md input-bordered bg-white w-full"
                    value={formData.penulis}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-xs sm:text-sm font-medium">Penerbit</span>
                  </label>
                  <input
                    type="text"
                    name="penerbit"
                    placeholder="Masukkan penerbit"
                    className="input input-sm sm:input-md input-bordered bg-white w-full"
                    value={formData.penerbit}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-xs sm:text-sm font-medium">Tahun Terbit</span>
                  </label>
                  <input
                    type="text"
                    name="tahun_terbit"
                    placeholder="2024"
                    maxLength="4"
                    className="input input-sm sm:input-md input-bordered bg-white w-full"
                    value={formData.tahun_terbit}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-xs sm:text-sm font-medium">
                      Stok Total <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    name="stok_total"
                    placeholder="0"
                    min="0"
                    className="input input-sm sm:input-md input-bordered bg-white w-full"
                    value={formData.stok_total}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                  <label className="label">
                    <span className="label-text-alt text-xs text-gray-500">
                      Jumlah total buku yang dimiliki perpustakaan
                    </span>
                  </label>
                </div>
              </div>
            </fieldset>

            {/* Book Cover */}
            <fieldset className="border border-gray-300 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <legend className="text-xs sm:text-sm font-medium text-gray-700 px-2">Cover Buku</legend>

              <div className="form-control">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  className="file-input file-input-sm sm:file-input-md file-input-bordered bg-white w-full text-xs sm:text-sm"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                <label className="label">
                  <span className="label-text-alt text-xs text-gray-500">
                    Format: JPG, JPEG, PNG. Maksimal 2MB
                  </span>
                </label>

                {coverPreview && (
                  <div className="mt-3 sm:mt-4">
                    <p className="text-xs sm:text-sm font-medium mb-2">Preview:</p>
                    <img
                      src={coverPreview}
                      alt="Preview"
                      className="w-32 h-44 sm:w-40 sm:h-56 object-cover rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>
            </fieldset>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                type="button"
                className="btn btn-sm sm:btn-md btn-ghost order-2 sm:order-1"
                onClick={() => navigate('/admin/books')}
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-sm sm:btn-md bg-blue-600 hover:bg-blue-700 text-white border-none order-1 sm:order-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-xs sm:loading-sm"></span>
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Buku'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreateBook;