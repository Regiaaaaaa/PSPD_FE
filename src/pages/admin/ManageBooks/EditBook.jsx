import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, X } from 'lucide-react';
import { getBookDetail, updateBook } from '../../../services/admin/bookService';
import { getAllCategories } from '../../../services/admin/managecategoryService';
import AppLayout from '../../../components/AppLayout';

const EditBook = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [initialData, setInitialData] = useState({
    stok_total: 0,
    dalam_perbaikan: 0,
    stok_dipinjam: 0,
  });

  const [formData, setFormData] = useState({
    isbn: '',
    kategori_id: [], 
    judul: '',
    penulis: '',
    penerbit: '',
    tahun_terbit: '',
    stok_total: 0,
    dalam_perbaikan: 0,
    cover: null,
  });

  const [stokTersedia, setStokTersedia] = useState(0);
  const [currentCover, setCurrentCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const getCoverUrl = (coverPath) => {
    if (!coverPath) return null;
    if (coverPath.startsWith('http') || coverPath.startsWith('blob:')) return coverPath;
    return coverPath.startsWith('storage/') ? `/${coverPath}` : `/storage/${coverPath}`;
  };

  useEffect(() => {
    fetchBookDetail();
    fetchCategories();
  }, [id]);

  const fetchBookDetail = async () => {
    try {
      setLoading(true);
      const data = await getBookDetail(id);
      const book = data.data;

      const dipinjam = book.stok_total - (book.stok_tersedia || 0) - (book.dalam_perbaikan || 0);

      setInitialData({
        stok_total: book.stok_total,
        dalam_perbaikan: book.dalam_perbaikan || 0,
        stok_dipinjam: dipinjam,
      });

      setFormData({
        isbn: book.isbn || '',
        kategori_id: book.kategori?.map(k => String(k.id)) ?? [],
        judul: book.judul,
        penulis: book.penulis || '',
        penerbit: book.penerbit || '',
        tahun_terbit: book.tahun_terbit || '',
        stok_total: book.stok_total,
        dalam_perbaikan: book.dalam_perbaikan || 0,
        cover: null,
      });

      setStokTersedia(book.stok_tersedia);

      if (book.cover) {
        const coverUrl = getCoverUrl(book.cover);
        setCurrentCover(coverUrl);
        setCoverPreview(coverUrl);
      }
    } catch (error) {
      toast.error(error || 'Gagal memuat detail buku');
      navigate('/admin/books');
    } finally {
      setLoading(false);
    }
  };

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

  const handleRemoveCover = () => {
    setFormData((prev) => ({ ...prev, cover: null }));
    setCoverPreview(currentCover);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
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

    const minStokTotal = initialData.stok_dipinjam + parseInt(formData.dalam_perbaikan || 0);
    if (parseInt(formData.stok_total) < minStokTotal) {
      toast.error(`Stok total minimal ${minStokTotal} (jumlah dipinjam + dalam perbaikan)`);
      return;
    }

    if (formData.stok_total < 0) {
      toast.error('Stok total tidak boleh negatif');
      return;
    }

    if (formData.dalam_perbaikan < 0) {
      toast.error('Jumlah perbaikan tidak boleh negatif');
      return;
    }

    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('_method', 'PUT');
      formDataToSend.append('isbn', formData.isbn);
      formData.kategori_id.forEach(id => {
        formDataToSend.append('kategori_id[]', id);
      });

      formDataToSend.append('judul', formData.judul);
      formDataToSend.append('penulis', formData.penulis || '');
      formDataToSend.append('penerbit', formData.penerbit || '');
      formDataToSend.append('tahun_terbit', formData.tahun_terbit || '');
      formDataToSend.append('stok_total', formData.stok_total);
      formDataToSend.append('dalam_perbaikan', formData.dalam_perbaikan);

      if (formData.cover) {
        formDataToSend.append('cover', formData.cover);
      }

      await updateBook(id, formDataToSend);
      toast.success('Buku berhasil diupdate');
      navigate('/admin/books');
    } catch (error) {
      toast.error(error || 'Gagal update buku');
    } finally {
      setSubmitting(false);
    }
  };

  const minStokTotal = initialData.stok_dipinjam + parseInt(formData.dalam_perbaikan || 0);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-screen">
          <span className="loading loading-spinner loading-md sm:loading-lg"></span>
        </div>
      </AppLayout>
    );
  }

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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Edit Buku</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Ubah informasi buku</p>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <form onSubmit={handleSubmit}>
            {/* Book Information */}
            <fieldset className="border border-gray-300 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <legend className="text-xs sm:text-sm font-medium text-gray-700 px-2">Informasi Buku</legend>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">

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
                    disabled={submitting}
                  />
                </div>

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
                    disabled={submitting}
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
                    disabled={submitting}
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
                    disabled={submitting}
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
                    disabled={submitting}
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
                    disabled={submitting}
                  />
                </div>
              </div>
            </fieldset>

            {/* Stock Management */}
            <fieldset className="border border-gray-300 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <legend className="text-xs sm:text-sm font-medium text-gray-700 px-2">Manajemen Stok</legend>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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
                    min={minStokTotal}
                    className="input input-sm sm:input-md input-bordered bg-white w-full"
                    value={formData.stok_total}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                  />
                  <label className="label">
                    <span className="label-text-alt text-xs text-gray-500">
                      Minimal: {minStokTotal} (jumlah dipinjam + dalam perbaikan / salah satunya)
                    </span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-xs sm:text-sm font-medium">Dalam Perbaikan</span>
                  </label>
                  <input
                    type="number"
                    name="dalam_perbaikan"
                    placeholder="0"
                    min="0"
                    className="input input-sm sm:input-md input-bordered bg-white w-full"
                    value={formData.dalam_perbaikan}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                  <label className="label">
                    <span className="label-text-alt text-xs text-gray-500">
                      Jumlah buku yang sedang diperbaiki
                    </span>
                  </label>
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text text-xs sm:text-sm font-medium">Stok Tersedia (Otomatis)</span>
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <div className="badge badge-success badge-sm sm:badge-lg px-3 sm:px-4 py-2 sm:py-3">
                      {stokTersedia} buku
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500">
                      Dihitung otomatis: Stok Total - Dalam Perbaikan - Dipinjam
                    </span>
                  </div>
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
                  disabled={submitting}
                />
                <label className="label">
                  <span className="label-text-alt text-xs text-gray-500">
                    Format: JPG, JPEG, PNG. Maksimal 2MB
                  </span>
                </label>

                {coverPreview && (
                  <div className="mt-3 sm:mt-4">
                    <p className="text-xs sm:text-sm font-medium mb-2">
                      {formData.cover ? 'Preview Cover Baru:' : 'Cover Saat Ini:'}
                    </p>
                    <div className="relative inline-block">
                      <img
                        src={coverPreview}
                        alt="Preview"
                        className="w-32 h-44 sm:w-40 sm:h-56 object-cover rounded-lg shadow-md"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjIyNCIgZmlsbD0iI2UwZTBlMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Q292ZXIgRXJyb3I8L3RleHQ+PC9zdmc+';
                        }}
                      />
                      {formData.cover && (
                        <button
                          type="button"
                          className="btn btn-xs sm:btn-sm btn-circle btn-error absolute -top-2 -right-2"
                          onClick={handleRemoveCover}
                          disabled={submitting}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
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
                disabled={submitting}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-sm sm:btn-md bg-blue-600 hover:bg-blue-700 text-white border-none order-1 sm:order-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="loading loading-spinner loading-xs sm:loading-sm"></span>
                    Mengupdate...
                  </>
                ) : (
                  'Update Buku'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default EditBook;