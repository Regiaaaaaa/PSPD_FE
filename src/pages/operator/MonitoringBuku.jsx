import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Eye, BookOpen, PackageCheck, Wrench } from 'lucide-react';
import { getMonitoringBuku } from '../../services/operator/monitoringServices';
import AppLayout from '../../components/AppLayout';
import Pagination from '../../components/common/Pagination';

const formatRupiah = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);

const MonitoringBuku = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterKategori, setFilterKategori] = useState('');
  const [filterTahun, setFilterTahun] = useState('');

  useEffect(() => {
    fetchMonitoringBuku();
  }, []);

  const fetchMonitoringBuku = async () => {
    setLoading(true);
    try {
      const data = await getMonitoringBuku();
      setBooks(data.data || []);
    } catch (error) {
      toast.error(error.message || 'Gagal memuat data monitoring buku');
    } finally {
      setLoading(false);
    }
  };

  const getCoverUrl = (coverPath) => {
    if (!coverPath) return null;
    if (coverPath.startsWith('http')) return coverPath;
    return coverPath.startsWith('storage/') ? `/${coverPath}` : `/storage/${coverPath}`;
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

  const hasActiveFilter = searchTerm || filterKategori || filterTahun;

  const availableCategories = [...new Set(
    books.flatMap(book => book.kategori?.map(k => k.nama) ?? [])
  )];

  const availableYears = [...new Set(books.map(book => book.tahun_terbit).filter(Boolean))].sort((a, b) => b - a);

  const filteredBooks = books.filter((book) => {
    const matchSearch =
      book.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.penulis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.penerbit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchKategori = filterKategori ? book.kategori?.some(k => k.nama === filterKategori) : true;
    const matchTahun = filterTahun ? book.tahun_terbit === filterTahun : true;
    return matchSearch && matchKategori && matchTahun;
  });

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBooks = filteredBooks.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const totalBuku = books.length;
  const totalStokTersedia = books.reduce((acc, book) => acc + (book.stok_tersedia || 0), 0);
  const totalDalamPerbaikan = books.reduce((acc, book) => acc + (book.dalam_perbaikan || 0), 0);

  const renderKategoriBadges = (kategori, size = 'sm') => {
    if (!kategori || kategori.length === 0) return <span className="text-gray-400 text-xs">-</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {kategori.map(k => (
          <span key={k.id} className={`badge badge-primary badge-${size}`}>{k.nama}</span>
        ))}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Monitoring Buku</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Pantau ketersediaan dan status buku perpustakaan</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm opacity-90">Total Buku</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">{totalBuku}</p>
              </div>
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm opacity-90">Stok Tersedia</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">{totalStokTersedia}</p>
              </div>
              <PackageCheck className="w-8 h-8 sm:w-10 sm:h-10 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm opacity-90">Dalam Perbaikan</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">{totalDalamPerbaikan}</p>
              </div>
              <Wrench className="w-8 h-8 sm:w-10 sm:h-10 opacity-80" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Kategori</label>
              <select
                className="select select-sm sm:select-md select-bordered bg-white w-full text-sm"
                value={filterKategori}
                onChange={(e) => { setFilterKategori(e.target.value); setCurrentPage(1); }}
              >
                <option value="">Semua Kategori</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Tahun Terbit</label>
              <select
                className="select select-sm sm:select-md select-bordered bg-white w-full text-sm"
                value={filterTahun}
                onChange={(e) => { setFilterTahun(e.target.value); setCurrentPage(1); }}
              >
                <option value="">Semua Tahun</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn btn-ghost border border-gray-300 hover:bg-gray-50 btn-sm" onClick={resetFilters}>
            Reset
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {Pagination({
            currentPage, totalPages, itemsPerPage, totalItems: filteredBooks.length, searchTerm,
            onPageChange: goToPage,
            onItemsPerPageChange: (v) => { setItemsPerPage(v); setCurrentPage(1); },
            onSearchChange: (v) => { setSearchTerm(v); setCurrentPage(1); }
          }).TopControls()}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <span className="loading loading-spinner loading-md sm:loading-lg"></span>
            </div>
          ) : paginatedBooks.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-16 text-gray-400">
              <BookOpen size={40} className="mb-2 opacity-40" />
              <p className="text-sm">{hasActiveFilter ? 'Tidak ada buku yang ditemukan' : 'Belum ada data buku'}</p>
              {hasActiveFilter && (
                <button className="btn btn-ghost btn-sm mt-2 text-blue-600" onClick={resetFilters}>Reset Filter</button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden divide-y divide-gray-100">
                {paginatedBooks.map((book) => {
                  const coverUrl = getCoverUrl(book.cover);
                  return (
                    <div key={book.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          {coverUrl ? (
                            <img
                              src={coverUrl} alt={book.judul}
                              className="w-16 h-20 object-cover rounded cursor-pointer hover:opacity-80"
                              onClick={() => handleDetailClick(book)}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div
                              className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center cursor-pointer hover:bg-gray-300"
                              onClick={() => handleDetailClick(book)}
                            >
                              <span className="text-xs text-gray-500">No Cover</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-semibold text-sm text-gray-900 cursor-pointer hover:text-blue-600 truncate"
                            onClick={() => handleDetailClick(book)}
                          >
                            {book.judul}
                          </h3>
                          <div className="mt-1 space-y-0.5">
                            {book.isbn && <p className="text-xs text-gray-500 font-mono">ISBN: {book.isbn}</p>}
                            <p className="text-xs text-gray-600 truncate"><span className="font-medium">Penulis:</span> {book.penulis || '-'}</p>
                            <p className="text-xs text-gray-600 truncate"><span className="font-medium">Penerbit:</span> {book.penerbit || '-'}</p>
                            {book.harga_buku > 0 && (
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Harga:</span> {formatRupiah(book.harga_buku)}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-1 mt-1">
                              {renderKategoriBadges(book.kategori, 'xs')}
                              {book.tahun_terbit && (
                                <span className="badge badge-ghost badge-xs">{book.tahun_terbit}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className="badge badge-info badge-xs">Total: {book.stok_total || 0}</span>
                            <span className="badge badge-success badge-xs">Tersedia: {book.stok_tersedia || 0}</span>
                            {book.dalam_perbaikan > 0 && (
                              <span className="badge badge-warning badge-xs">Perbaikan: {book.dalam_perbaikan}</span>
                            )}
                          </div>
                          <div className="flex gap-1.5 mt-3">
                            <button
                              className="btn btn-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200 h-7 min-h-7 px-2"
                              onClick={() => handleDetailClick(book)}
                            >
                              <Eye size={12} /><span className="text-[10px]">Detail</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-white border-b-2 border-gray-200">
                      <th className="w-12 font-semibold text-gray-700">No</th>
                      <th className="w-20 font-semibold text-gray-700">Cover</th>
                      <th className="font-semibold text-gray-700">Judul</th>
                      <th className="font-semibold text-gray-700">ISBN</th>
                      <th className="font-semibold text-gray-700">Kategori</th>
                      <th className="font-semibold text-gray-700">Penulis</th>
                      <th className="font-semibold text-gray-700">Penerbit</th>
                      <th className="text-center font-semibold text-gray-700">Tahun</th>
                      <th className="text-right font-semibold text-gray-700 whitespace-nowrap">Harga</th>
                      <th className="text-center font-semibold text-gray-700">Total</th>
                      <th className="text-center font-semibold text-gray-700">Tersedia</th>
                      <th className="text-center font-semibold text-gray-700">Perbaikan</th>
                      <th className="text-center font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBooks.map((book, index) => {
                      const coverUrl = getCoverUrl(book.cover);
                      return (
                        <tr key={book.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                          <td className="text-gray-500 text-sm">{startIndex + index + 1}</td>
                          <td>
                            {coverUrl ? (
                              <img
                                src={coverUrl} alt={book.judul}
                                className="w-12 h-16 object-cover rounded cursor-pointer hover:opacity-80"
                                onClick={() => handleDetailClick(book)}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div
                                className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center cursor-pointer hover:bg-gray-300"
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
                          <td className="text-sm">{book.penulis || '-'}</td>
                          <td className="text-sm">{book.penerbit || '-'}</td>
                          <td className="text-center text-sm">{book.tahun_terbit || '-'}</td>
                          <td className="text-right text-sm font-medium text-gray-700 whitespace-nowrap">
                            {book.harga_buku > 0
                              ? formatRupiah(book.harga_buku)
                              : <span className="text-gray-400">-</span>
                            }
                          </td>
                          <td className="text-center"><span className="badge badge-info">{book.stok_total || 0}</span></td>
                          <td className="text-center"><span className="badge badge-success">{book.stok_tersedia || 0}</span></td>
                          <td className="text-center"><span className="badge badge-warning">{book.dalam_perbaikan || 0}</span></td>
                          <td>
                            <div className="flex gap-2 justify-center">
                              <button
                                className="btn btn-ghost btn-xs text-blue-600 hover:bg-blue-50"
                                onClick={() => handleDetailClick(book)}
                                title="Detail"
                              >
                                <Eye size={16} />
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
                currentPage, totalPages, itemsPerPage, totalItems: filteredBooks.length, searchTerm,
                onPageChange: goToPage,
                onItemsPerPageChange: (v) => { setItemsPerPage(v); setCurrentPage(1); },
                onSearchChange: (v) => { setSearchTerm(v); setCurrentPage(1); }
              }).BottomControls()}
            </>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedBook && (
          <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-2xl p-4 sm:p-6">
              <h3 className="font-bold text-sm sm:text-base md:text-lg mb-3 sm:mb-4">Detail Buku</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
                {/* Cover */}
                <div className="col-span-1 flex justify-center md:block">
                  {getCoverUrl(selectedBook.cover) ? (
                    <img
                      src={getCoverUrl(selectedBook.cover)} alt={selectedBook.judul}
                      className="w-32 h-44 sm:w-40 sm:h-56 md:w-full md:h-auto rounded-lg shadow-md object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-32 h-44 sm:w-40 sm:h-56 md:w-full md:h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-xs sm:text-sm text-gray-500">No Cover</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="col-span-1 md:col-span-2 space-y-2 sm:space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Judul</label>
                    <p className="text-sm sm:text-base font-bold break-words">{selectedBook.judul}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">ISBN</label>
                    <p className="text-xs sm:text-sm font-mono text-gray-700">{selectedBook.isbn || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Kategori</label>
                    <div className="mt-1">{renderKategoriBadges(selectedBook.kategori, 'sm')}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Penulis</label>
                      <p className="text-xs sm:text-sm break-words">{selectedBook.penulis || '-'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Penerbit</label>
                      <p className="text-xs sm:text-sm break-words">{selectedBook.penerbit || '-'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Tahun Terbit</label>
                      <p className="text-xs sm:text-sm">{selectedBook.tahun_terbit || '-'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Harga Buku</label>
                      <p className="text-xs sm:text-sm font-medium text-gray-800">
                        {selectedBook.harga_buku > 0 ? formatRupiah(selectedBook.harga_buku) : '-'}
                      </p>
                    </div>
                  </div>

                  {/* Stock Info */}
                  <div className="border-t pt-2 sm:pt-3">
                    <label className="text-xs font-semibold text-gray-600 mb-2 block">Informasi Stok</label>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                      <div className="bg-blue-50 rounded-lg p-2 text-center">
                        <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Total</p>
                        <p className="text-lg sm:text-xl font-bold text-blue-600">{selectedBook.stok_total || 0}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2 text-center">
                        <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Tersedia</p>
                        <p className="text-lg sm:text-xl font-bold text-green-600">{selectedBook.stok_tersedia || 0}</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-2 text-center">
                        <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Perbaikan</p>
                        <p className="text-lg sm:text-xl font-bold text-yellow-600">{selectedBook.dalam_perbaikan || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-action mt-4 sm:mt-6">
                <button
                  className="btn btn-sm sm:btn-md btn-block"
                  onClick={() => { setShowDetailModal(false); setSelectedBook(null); }}
                >
                  Tutup
                </button>
              </div>
            </div>
            <div className="modal-backdrop" onClick={() => { setShowDetailModal(false); setSelectedBook(null); }}></div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default MonitoringBuku;