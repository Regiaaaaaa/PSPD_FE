import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Eye, BookOpen, Download, Upload, X, FileSpreadsheet } from 'lucide-react';
import { getAllBooks, deleteBook } from '../../../services/admin/bookService';
import { getAllCategories } from '../../../services/admin/managecategoryService';
import AppLayout from '../../../components/AppLayout';
import DeleteModal from '../../../components/common/DeleteModal';
import Pagination from '../../../components/common/Pagination';
import { getToken } from '../../../utils/auth';

const API_URL = '/api/admin';

const ManageBooks = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterKategori, setFilterKategori] = useState('');
  const [filterTahun, setFilterTahun] = useState('');

  // Import state
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await getAllBooks();
      setBooks(data.data || []);
    } catch (error) {
      toast.error(error || 'Gagal memuat data buku');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Gagal memuat kategori:', error);
    }
  };
  const handleDownloadTemplate = async () => {
    setDownloadLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/books/download-template`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Gagal mengunduh template');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_buku.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Template berhasil diunduh');
    } catch (error) {
      toast.error(error.message || 'Gagal mengunduh template');
    } finally {
      setDownloadLoading(false);
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['xlsx', 'xls'].includes(ext)) {
        toast.error('File harus berformat .xlsx atau .xls');
        e.target.value = '';
        return;
      }
      setImportFile(file);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Pilih file terlebih dahulu');
      return;
    }

    setImportLoading(true);
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('file', importFile);

      const res = await fetch(`${API_URL}/books/import`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal mengimport data');

      toast.success(data.message || 'Data buku berhasil diimport!');
      setShowImportModal(false);
      setImportFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchBooks();
    } catch (error) {
      toast.error(error.message || 'Gagal mengimport data buku');
    } finally {
      setImportLoading(false);
    }
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setImportFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const getCoverUrl = (coverPath) => {
    if (!coverPath) return null;
    if (coverPath.startsWith('http')) return coverPath;
    return coverPath.startsWith('storage/') ? `/${coverPath}` : `/storage/${coverPath}`;
  };

  const handleCreate = () => navigate('/admin/books/create');
  const handleEdit = (book) => navigate(`/admin/books/edit/${book.id}`);

  const handleDeleteClick = (book) => {
    setSelectedBook(book);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteBook(selectedBook.id);
      toast.success('Buku berhasil dihapus');
      setShowDeleteModal(false);
      setSelectedBook(null);
      fetchBooks();
    } catch (error) {
      toast.error(error || 'Gagal menghapus buku');
    }
  };

  const handleDetailClick = (book) => {
    setSelectedBook(book);
    setShowDetailModal(true);
  };

  const resetFilters = () => {
    setFilterKategori('');
    setFilterTahun('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const availableYears = [...new Set(books.map(book => book.tahun_terbit).filter(Boolean))].sort((a, b) => b - a);
  const hasActiveFilter = searchTerm || filterKategori || filterTahun;

  const filteredBooks = books.filter((book) => {
    const matchSearch =
      book.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.penulis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.penerbit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchKategori = filterKategori
      ? book.kategori?.some(k => k.id === parseInt(filterKategori))
      : true;

    const matchTahun = filterTahun ? book.tahun_terbit === filterTahun : true;

    return matchSearch && matchKategori && matchTahun;
  });

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const renderKategoriBadges = (kategori, size = 'sm') => {
    if (!kategori || kategori.length === 0) {
      return <span className={`badge badge-ghost badge-${size}`}>-</span>;
    }
    return (
      <div className="flex flex-wrap gap-1">
        {kategori.map(k => (
          <span key={k.id} className={`badge badge-primary badge-${size}`}>
            {k.nama_kategori}
          </span>
        ))}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Kelola Buku</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage koleksi buku perpustakaan</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {/* Import Excel */}
            <button
              className="btn btn-sm sm:btn-md bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 shadow-sm hover:shadow-md transition-all flex-1 sm:flex-none"
              onClick={() => setShowImportModal(true)}
            >
              <Upload size={15} />
              <span className="text-xs sm:text-sm">Import Excel</span>
            </button>

            {/* Tambah Buku */}
            <button
              className="btn btn-sm sm:btn-md bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm hover:shadow-md transition-all flex-1 sm:flex-none"
              onClick={handleCreate}
            >
              + Tambah Buku
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Kategori</label>
              <select
                className="select select-sm sm:select-md select-bordered bg-white w-full text-sm"
                value={filterKategori}
                onChange={(e) => {
                  setFilterKategori(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nama_kategori}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Tahun Terbit</label>
              <select
                className="select select-sm sm:select-md select-bordered bg-white w-full text-sm"
                value={filterTahun}
                onChange={(e) => {
                  setFilterTahun(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Semua Tahun</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn btn-ghost border border-gray-300 hover:bg-gray-50" onClick={resetFilters}>
            Reset
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {Pagination({
            currentPage,
            totalPages,
            itemsPerPage,
            totalItems: filteredBooks.length,
            searchTerm,
            onPageChange: goToPage,
            onItemsPerPageChange: (value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            },
            onSearchChange: (value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }
          }).TopControls()}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <span className="loading loading-spinner loading-md sm:loading-lg"></span>
            </div>
          ) : paginatedBooks.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-16 text-gray-400">
              <BookOpen size={40} className="mb-2 opacity-40" />
              <p className="text-sm">
                {hasActiveFilter ? 'Tidak ada buku yang ditemukan' : 'Belum ada data buku'}
              </p>
              {hasActiveFilter && (
                <button className="btn btn-ghost btn-sm mt-2 text-blue-600" onClick={resetFilters}>
                  Reset Filter
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden">
                <div className="divide-y divide-gray-100">
                  {paginatedBooks.map((book) => {
                    const coverUrl = getCoverUrl(book.cover);
                    return (
                      <div key={book.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0">
                            {coverUrl ? (
                              <img
                                src={coverUrl}
                                alt={book.judul}
                                className="w-16 h-20 sm:w-20 sm:h-28 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => handleDetailClick(book)}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = `<div class="w-16 h-20 sm:w-20 sm:h-28 bg-gray-200 rounded flex items-center justify-center cursor-pointer"><span class="text-xs text-gray-500">Error</span></div>`;
                                }}
                              />
                            ) : (
                              <div
                                className="w-16 h-20 sm:w-20 sm:h-28 bg-gray-200 rounded flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                                onClick={() => handleDetailClick(book)}
                              >
                                <span className="text-xs text-gray-500">No Cover</span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3
                              className="font-semibold text-sm sm:text-base text-gray-900 cursor-pointer hover:text-blue-600 transition-colors truncate"
                              onClick={() => handleDetailClick(book)}
                            >
                              {book.judul}
                            </h3>

                            <div className="mt-1 space-y-1">
                              {book.isbn && (
                                <p className="text-xs sm:text-sm text-gray-500 font-mono">ISBN: {book.isbn}</p>
                              )}
                              <p className="text-xs sm:text-sm text-gray-600 truncate">
                                <span className="font-medium">Penulis:</span> {book.penulis || '-'}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">
                                <span className="font-medium">Penerbit:</span> {book.penerbit || '-'}
                              </p>
                              <div className="flex flex-wrap items-center gap-1 mt-2">
                                {renderKategoriBadges(book.kategori, 'xs')}
                                {book.tahun_terbit && (
                                  <span className="badge badge-ghost badge-xs whitespace-nowrap text-[10px] px-2 py-0.5">
                                    {book.tahun_terbit}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              <span className="badge badge-info badge-xs whitespace-nowrap text-[10px] px-2 py-0.5">
                                Total: {book.stok_total || 0}
                              </span>
                              <span className="badge badge-success badge-xs whitespace-nowrap text-[10px] px-2 py-0.5">
                                Tersedia: {book.stok_tersedia || 0}
                              </span>
                              {book.dalam_perbaikan > 0 && (
                                <span className="badge badge-warning badge-xs whitespace-nowrap text-[10px] px-2 py-0.5">
                                  Perbaikan: {book.dalam_perbaikan}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-1.5 mt-3">
                              <button
                                className="btn btn-xs bg-green-50 text-green-600 hover:bg-green-100 border-green-200 h-7 min-h-7 px-2"
                                onClick={() => handleDetailClick(book)}
                              >
                                <Eye size={12} />
                                <span className="text-[10px] sm:text-xs">Detail</span>
                              </button>
                              <button
                                className="btn btn-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200 h-7 min-h-7 px-2"
                                onClick={() => handleEdit(book)}
                              >
                                <Pencil size={12} />
                                <span className="text-[10px] sm:text-xs">Edit</span>
                              </button>
                              <button
                                className="btn btn-xs bg-red-50 text-red-600 hover:bg-red-100 border-red-200 h-7 min-h-7 px-2"
                                onClick={() => handleDeleteClick(book)}
                              >
                                <Trash2 size={12} />
                                <span className="text-[10px] sm:text-xs">Hapus</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-white border-b-2 border-gray-200">
                      <th className="w-16 font-semibold text-gray-700">No</th>
                      <th className="w-24 font-semibold text-gray-700">Cover</th>
                      <th className="font-semibold text-gray-700">Judul</th>
                      <th className="font-semibold text-gray-700">ISBN</th>
                      <th className="font-semibold text-gray-700">Kategori</th>
                      <th className="font-semibold text-gray-700">Penulis</th>
                      <th className="font-semibold text-gray-700">Penerbit</th>
                      <th className="w-20 text-center font-semibold text-gray-700">Tahun</th>
                      <th className="w-24 text-center font-semibold text-gray-700">Total</th>
                      <th className="w-24 text-center font-semibold text-gray-700">Tersedia</th>
                      <th className="w-24 text-center font-semibold text-gray-700">Perbaikan</th>
                      <th className="w-32 text-center font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBooks.map((book, index) => {
                      const coverUrl = getCoverUrl(book.cover);
                      return (
                        <tr
                          key={book.id}
                          className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-150"
                        >
                          <td>{startIndex + index + 1}</td>
                          <td>
                            {coverUrl ? (
                              <img
                                src={coverUrl}
                                alt={book.judul}
                                className="w-12 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => handleDetailClick(book)}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = `<div class="w-12 h-16 bg-gray-200 rounded flex items-center justify-center cursor-pointer"><span class="text-xs text-gray-500">Error</span></div>`;
                                }}
                              />
                            ) : (
                              <div
                                className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                                onClick={() => handleDetailClick(book)}
                              >
                                <span className="text-xs text-gray-500">No Cover</span>
                              </div>
                            )}
                          </td>
                          <td
                            className="font-medium cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => handleDetailClick(book)}
                          >
                            {book.judul}
                          </td>
                          <td className="font-mono text-sm text-gray-600">{book.isbn || '-'}</td>
                          <td>{renderKategoriBadges(book.kategori, 'sm')}</td>
                          <td>{book.penulis || '-'}</td>
                          <td>{book.penerbit || '-'}</td>
                          <td className="text-center">{book.tahun_terbit || '-'}</td>
                          <td className="text-center">
                            <span className="badge badge-info">{book.stok_total || 0}</span>
                          </td>
                          <td className="text-center">
                            <span className="badge badge-success">{book.stok_tersedia || 0}</span>
                          </td>
                          <td className="text-center">
                            <span className="badge badge-warning">{book.dalam_perbaikan || 0}</span>
                          </td>
                          <td>
                            <div className="flex gap-2 justify-center">
                              <button
                                className="btn btn-ghost btn-xs text-green-600 hover:bg-green-50"
                                onClick={() => handleDetailClick(book)}
                                title="Detail"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                className="btn btn-ghost btn-xs text-blue-600 hover:bg-blue-50"
                                onClick={() => handleEdit(book)}
                                title="Edit"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                className="btn btn-ghost btn-xs text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteClick(book)}
                                title="Hapus"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {Pagination({
                currentPage,
                totalPages,
                itemsPerPage,
                totalItems: filteredBooks.length,
                searchTerm,
                onPageChange: goToPage,
                onItemsPerPageChange: (value) => {
                  setItemsPerPage(value);
                  setCurrentPage(1);
                },
                onSearchChange: (value) => {
                  setSearchTerm(value);
                  setCurrentPage(1);
                }
              }).BottomControls()}
            </>
          )}
        </div>
        {showImportModal && (
          <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-md p-4 sm:p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet size={20} className="text-amber-600" />
                  <h3 className="font-bold text-base sm:text-lg">Import Data Buku</h3>
                </div>
                <button
                  className="btn btn-ghost btn-xs btn-circle"
                  onClick={handleCloseImportModal}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Step info */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-xs sm:text-sm text-amber-800 font-medium mb-1">Petunjuk Import:</p>
                <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
                  <li>Download template Excel terlebih dahulu</li>
                  <li>Isi data buku sesuai format template</li>
                  <li>Upload file yang sudah diisi</li>
                </ol>
              </div>
              <div className="mb-4">
                <button
                  type="button"
                  className="btn btn-xs sm:btn-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 w-full"
                  onClick={handleDownloadTemplate}
                  disabled={downloadLoading}
                >
                  {downloadLoading ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <Download size={13} />
                  )}
                  Download Template Excel
                </button>
              </div>

              <div className="divider text-xs text-gray-400 my-2">Upload File</div>

              {/* File input */}
              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Pilih File Excel (.xlsx / .xls)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="file-input file-input-sm sm:file-input-md file-input-bordered w-full bg-white text-sm"
                />
                {importFile && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <FileSpreadsheet size={14} className="text-green-600 flex-shrink-0" />
                    <span className="text-xs text-gray-600 truncate">{importFile.name}</span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs btn-circle ml-auto flex-shrink-0"
                      onClick={() => {
                        setImportFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="modal-action mt-4 flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm sm:btn-md w-full sm:w-auto order-2 sm:order-1"
                  onClick={handleCloseImportModal}
                  disabled={importLoading}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn btn-sm sm:btn-md bg-amber-500 hover:bg-amber-600 text-white border-none w-full sm:w-auto order-1 sm:order-2"
                  onClick={handleImport}
                  disabled={!importFile || importLoading}
                >
                  {importLoading ? (
                    <>
                      <span className="loading loading-spinner loading-xs" />
                      Mengimport...
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      Import Sekarang
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="modal-backdrop" onClick={handleCloseImportModal}></div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedBook && (
          <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-2xl p-4 sm:p-6">
              <h3 className="font-bold text-sm sm:text-base md:text-lg mb-3 sm:mb-4">Detail Buku</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                <div className="col-span-1 flex justify-center md:block">
                  {getCoverUrl(selectedBook.cover) ? (
                    <img
                      src={getCoverUrl(selectedBook.cover)}
                      alt={selectedBook.judul}
                      className="w-32 h-44 sm:w-40 sm:h-56 md:w-full md:h-auto rounded-lg shadow-md"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<div class="w-32 h-44 sm:w-40 sm:h-56 md:w-full md:h-64 bg-gray-200 rounded-lg flex items-center justify-center"><span class="text-xs sm:text-sm text-gray-500">Cover Error</span></div>`;
                      }}
                    />
                  ) : (
                    <div className="w-32 h-44 sm:w-40 sm:h-56 md:w-full md:h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-xs sm:text-sm text-gray-500">No Cover</span>
                    </div>
                  )}
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2 sm:space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Judul</label>
                    <p className="text-sm sm:text-base md:text-lg font-bold break-words">{selectedBook.judul}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">ISBN</label>
                    <p className="text-xs sm:text-sm font-mono text-gray-700">{selectedBook.isbn || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Kategori</label>
                    <div className="mt-1">{renderKategoriBadges(selectedBook.kategori, 'sm')}</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Penulis</label>
                      <p className="text-xs sm:text-sm break-words">{selectedBook.penulis || '-'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Penerbit</label>
                      <p className="text-xs sm:text-sm break-words">{selectedBook.penerbit || '-'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Tahun Terbit</label>
                    <p className="text-xs sm:text-sm">{selectedBook.tahun_terbit || '-'}</p>
                  </div>
                  <div className="border-t pt-2 sm:pt-3">
                    <label className="text-xs font-semibold text-gray-600 mb-1 sm:mb-2 block">Informasi Stok</label>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-500 block mb-0.5">Total</label>
                        <span className="badge badge-info badge-xs sm:badge-sm w-full justify-center">{selectedBook.stok_total || 0}</span>
                      </div>
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-500 block mb-0.5">Tersedia</label>
                        <span className="badge badge-success badge-xs sm:badge-sm w-full justify-center">{selectedBook.stok_tersedia || 0}</span>
                      </div>
                      <div>
                        <label className="text-[10px] sm:text-xs text-gray-500 block mb-0.5">Perbaikan</label>
                        <span className="badge badge-warning badge-xs sm:badge-sm w-full justify-center">{selectedBook.dalam_perbaikan || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-action mt-4 sm:mt-6 flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  className="btn btn-ghost btn-xs sm:btn-sm md:btn-md w-full sm:w-auto order-2 sm:order-1"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedBook(null);
                  }}
                >
                  Tutup
                </button>
                <button
                  className="btn btn-xs sm:btn-sm md:btn-md bg-blue-600 hover:bg-blue-700 text-white border-none w-full sm:w-auto order-1 sm:order-2"
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEdit(selectedBook);
                  }}
                >
                  Edit Buku
                </button>
              </div>
            </div>
            <div
              className="modal-backdrop"
              onClick={() => {
                setShowDetailModal(false);
                setSelectedBook(null);
              }}
            ></div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <DeleteModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedBook(null);
            }}
            onConfirm={handleDelete}
            itemName={selectedBook?.judul}
            itemType="Buku"
          />
        )}
      </div>
    </AppLayout>
  );
};

export default ManageBooks;