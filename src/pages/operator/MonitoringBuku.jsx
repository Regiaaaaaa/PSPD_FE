import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Eye, BookOpen, PackageCheck, Wrench } from 'lucide-react';
import { getMonitoringBuku } from '../../services/operator/monitoringServices';
import AppLayout from '../../components/AppLayout';
import Pagination from '../../components/common/Pagination';

const MonitoringBuku = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterKategori, setFilterKategori] = useState('');
  const [filterTahun, setFilterTahun] = useState(''); // tambah state filter tahun

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

  // Get unique categories from books
  const availableCategories = [...new Set(
  books.flatMap(book => book.kategori?.map(k => k.nama) ?? [])
)];

  // Get unique years from books
  const availableYears = [...new Set(books.map(book => book.tahun_terbit).filter(Boolean))].sort((a, b) => b - a);

  const filteredBooks = books.filter((book) => {
    const matchSearch =
      book.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.penulis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.penerbit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchKategori = filterKategori
  ? book.kategori?.some(k => k.nama === filterKategori)
  : true;
    const matchTahun = filterTahun ? book.tahun_terbit === filterTahun : true; // tambah filter tahun

    return matchSearch && matchKategori && matchTahun;
  });

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Stats cards
  const totalBuku = books.length;
  const totalStokTersedia = books.reduce((acc, book) => acc + (book.stok_tersedia || 0), 0);
  const totalDalamPerbaikan = books.reduce((acc, book) => acc + (book.dalam_perbaikan || 0), 0);

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
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* tambah filter tahun */}
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
          <button 
            className="btn btn-sm sm:btn-md btn-ghost border border-gray-300 hover:bg-gray-50" 
            onClick={resetFilters}
          >
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
            <p className="text-sm sm:text-base">
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
                          {/* Cover */}
                          <div className="flex-shrink-0">
                            {coverUrl ? (
                              <img
                                src={coverUrl}
                                alt={book.judul}
                                className="w-16 h-20 sm:w-20 sm:h-28 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => handleDetailClick(book)}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = `
                                    <div class="w-16 h-20 sm:w-20 sm:h-28 bg-gray-200 rounded flex items-center justify-center cursor-pointer">
                                      <span class="text-xs text-gray-500">Error</span>
                                    </div>
                                  `;
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

                          {/* Book Info */}
                          <div className="flex-1 min-w-0">
                            <h3 
                              className="font-semibold text-sm sm:text-base text-gray-900 cursor-pointer hover:text-blue-600 transition-colors truncate"
                              onClick={() => handleDetailClick(book)}
                            >
                              {book.judul}
                            </h3>
                            
                            <div className="mt-1 space-y-1">
                              <p className="text-xs sm:text-sm text-gray-600 truncate">
                                <span className="font-medium">Penulis:</span> {book.penulis || '-'}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">
                                <span className="font-medium">ISBN:</span> {book.isbn || '-'}
                              </p>
                              
                              {/* Badges for Category and Year */}
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                {book.kategori?.length > 0
  ? book.kategori.map(k => (
      <span key={k.id} className="badge badge-primary badge-xs whitespace-nowrap text-[10px] px-2 py-0.5">
        {k.nama}
      </span>
    ))
  : <span className="text-xs text-gray-400">-</span>
}
                                {book.tahun_terbit && (
                                  <span className="badge badge-ghost badge-xs whitespace-nowrap text-[10px] px-2 py-0.5">
                                    {book.tahun_terbit}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Stock Info */}
                            <div className="grid grid-cols-3 gap-1.5 mt-2">
                              <div className="bg-blue-50 rounded p-1.5">
                                <p className="text-[10px] text-gray-600">Total</p>
                                <p className="text-sm font-bold text-blue-600">{book.stok_total || 0}</p>
                              </div>
                              <div className="bg-green-50 rounded p-1.5">
                                <p className="text-[10px] text-gray-600">Tersedia</p>
                                <p className="text-sm font-bold text-green-600">{book.stok_tersedia || 0}</p>
                              </div>
                              <div className="bg-yellow-50 rounded p-1.5">
                                <p className="text-[10px] text-gray-600">Perbaikan</p>
                                <p className="text-sm font-bold text-yellow-600">{book.dalam_perbaikan || 0}</p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              <button 
                                className="btn btn-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200 h-7 min-h-7 px-2" 
                                onClick={() => handleDetailClick(book)}
                              >
                                <Eye size={12} />
                                <span className="text-[10px] sm:text-xs">Detail</span>
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
                      <th className="w-20 text-center font-semibold text-gray-700">Tahun</th> {/* tambah kolom tahun */}
                      <th className="w-24 text-center font-semibold text-gray-700">Total</th>
                      <th className="w-24 text-center font-semibold text-gray-700">Tersedia</th>
                      <th className="w-24 text-center font-semibold text-gray-700">Perbaikan</th>
                      <th className="w-24 text-center font-semibold text-gray-700">Aksi</th>
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
                                  e.target.parentElement.innerHTML = `
                                    <div class="w-12 h-16 bg-gray-200 rounded flex items-center justify-center cursor-pointer">
                                      <span class="text-xs text-gray-500">Error</span>
                                    </div>
                                  `;
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
                            className="font-medium cursor-pointer hover:text-blue-600 transition-colors max-w-xs truncate"
                            onClick={() => handleDetailClick(book)}
                          >
                            {book.judul}
                          </td>
                          <td className="max-w-xs truncate">{book.isbn || '-'}</td>
                          <td>
                            <div className="flex flex-wrap gap-1">
  {book.kategori?.length > 0
    ? book.kategori.map(k => (
        <span key={k.id} className="badge badge-primary badge-sm">{k.nama}</span>
      ))
    : '-'
  }
</div>
                          </td>
                          <td className="max-w-xs truncate">{book.penulis || '-'}</td>
                          <td className="max-w-xs truncate">{book.penerbit || '-'}</td>
                          <td className="text-center">{book.tahun_terbit || '-'}</td> {/* tambah cell tahun */}
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

        {/* Detail Modal */}
        {showDetailModal && selectedBook && (
          <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-lg lg:max-w-xl p-5">
              <h3 className="font-bold text-base mb-4">Detail Buku</h3>
              
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Cover Image */}
                <div className="flex justify-center lg:justify-start lg:flex-shrink-0">
                  {getCoverUrl(selectedBook.cover) ? (
                    <img
                      src={getCoverUrl(selectedBook.cover)}
                      alt={selectedBook.judul}
                      className="w-28 h-40 lg:w-32 lg:h-44 object-cover rounded-lg shadow-md"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="w-28 h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span class="text-sm text-gray-500">No Cover</span>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="w-28 h-40 lg:w-32 lg:h-44 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-sm text-gray-500">No Cover</span>
                    </div>
                  )}
                </div>

                {/* Book Info */}
                <div className="flex-1 space-y-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Judul</label>
                    <p className="text-sm font-bold leading-tight">{selectedBook.judul}</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">ISBN</label>
                    <p className="text-sm leading-tight">{selectedBook.isbn || '-'}</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">Kategori</label>
                    <p className="mt-1">
                      <div className="flex flex-wrap gap-1 mt-1">
  {selectedBook.kategori?.length > 0
    ? selectedBook.kategori.map(k => (
        <span key={k.id} className="badge badge-primary badge-sm">{k.nama}</span>
      ))
    : '-'
  }
</div>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Penulis</label>
                      <p className="text-sm leading-tight">{selectedBook.penulis || '-'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Penerbit</label>
                      <p className="text-sm leading-tight">{selectedBook.penerbit || '-'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">Tahun Terbit</label>
                    <p className="text-sm">{selectedBook.tahun_terbit || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Stock Info - Full Width Below */}
              <div className="border-t pt-3 mt-3">
                <label className="text-xs font-semibold text-gray-600 mb-2 block">Informasi Stok</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-600 mb-0.5">Total</p>
                    <p className="text-xl font-bold text-blue-600">{selectedBook.stok_total || 0}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-600 mb-0.5">Tersedia</p>
                    <p className="text-xl font-bold text-green-600">{selectedBook.stok_tersedia || 0}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-600 mb-0.5">Perbaikan</p>
                    <p className="text-xl font-bold text-yellow-600">{selectedBook.dalam_perbaikan || 0}</p>
                  </div>
                </div>
              </div>

              <div className="modal-action mt-4">
                <button
                  className="btn btn-sm btn-block"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedBook(null);
                  }}
                >
                  Tutup
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
      </div>
    </AppLayout>
  );
};

export default MonitoringBuku;