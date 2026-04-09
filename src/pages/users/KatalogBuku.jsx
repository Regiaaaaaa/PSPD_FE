import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Search, BookOpen, Filter, X, ChevronDown, Clock, CheckCircle, AlertCircle, Book, AlertTriangle } from 'lucide-react';
import { getAllBooks } from '../../services/users/katalogService';
import { ajukanPeminjaman, cekDendaAktif } from '../../services/users/transaksiService';
import AppLayout from '../../components/AppLayout';
import Pagination from '../../components/common/Pagination';

const KatalogBuku = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterTahun, setFilterTahun] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ── Denda state ──────────────────────────────────────────────────────
  const [dendaAktif, setDendaAktif] = useState(null);   
  const [dendaLoading, setDendaLoading] = useState(true);
  // ────────────────────────────────────────────────────────────────────

  // Modal Detail
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Modal Peminjaman
  const [showPinjamModal, setShowPinjamModal] = useState(false);
  const [pinjamLoading, setPinjamLoading] = useState(false);
  const [formPinjam, setFormPinjam] = useState({
    jumlah: 1,
    kepentingan: '',
    tgl_deadline: '',
  });

  const [categories, setCategories] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);

  const savedScrollTop = React.useRef(0);


  useEffect(() => {
    const fetchDenda = async () => {
      try {
        const result = await cekDendaAktif();
        setDendaAktif(result.ada_denda ? result.denda : null);
      } catch {
        setDendaAktif(null);
      } finally {
        setDendaLoading(false);
      }
    };
    fetchDenda();
  }, []);
  // ────────────────────────────────────────────────────────────────────

  // Fetch kategori SEKALI di mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllBooks({});
        const uniqueKategori = [];
        const seen = new Set();
        (data.data || []).forEach((b) => {
          if (b.kategori && !seen.has(b.kategori.id)) {
            seen.add(b.kategori.id);
            uniqueKategori.push(b.kategori);
          }
        });
        setCategories(uniqueKategori);
        const years = [...new Set((data.data || []).map((b) => b.tahun_terbit).filter(Boolean))].sort(
          (a, b) => b - a
        );
        setAvailableYears(years);
      } catch (e) {
        // silent
      }
    };
    fetchCategories();
  }, []);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterKategori) params.kategori_id = filterKategori;
      if (filterTahun) params.tahun = filterTahun;
      if (sortBy) params.sort = sortBy;

      const data = await getAllBooks(params);
      setBooks(data.data || []);
    } catch (error) {
      toast.error(error.message || 'Gagal memuat katalog');
    } finally {
      setLoading(false);
    }
  }, [filterKategori, filterTahun, sortBy]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterKategori, filterTahun, sortBy]);

  // ─── Helpers ────────────────────────────────────
  const getCoverUrl = (coverPath) => {
    if (!coverPath) return null;
    if (coverPath.startsWith('http')) return coverPath;
    return coverPath.startsWith('storage/') ? `/${coverPath}` : `/storage/${coverPath}`;
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterKategori('');
    setFilterTahun('');
    setSortBy('');
    setCurrentPage(1);
  };

  const hasActiveFilter = searchTerm || filterKategori || filterTahun || sortBy;

  const formatRupiah = (nominal) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(nominal);

  // ─── Client-side search filtering ───────────────
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        book.judul?.toLowerCase().includes(search) ||
        book.penulis?.toLowerCase().includes(search) ||
        book.penerbit?.toLowerCase().includes(search) ||
        book.isbn?.toLowerCase().includes(search) ||
        book.kategori?.nama_kategori?.toLowerCase().includes(search)
      );
    });
  }, [books, searchTerm]);

  // ─── Pagination ──────────────────────────────────
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBooks = filteredBooks.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // ─── Modal Detail ────────────────────────────────
  const openDetailModal = (book) => {
    setSelectedBook(book);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedBook(null);
  };

  // ─── Modal Peminjaman ────────────────────────────
  const openPinjamModal = (book) => {
    if (dendaAktif) {
      toast.error('Selesaikan denda terlebih dahulu sebelum meminjam buku.');
      return;
    }

    const main = document.querySelector('main.overflow-y-auto');
    if (main) {
      savedScrollTop.current = main.scrollTop;
      main.style.overflow = 'hidden';
      main.style.position = 'relative';
    }

    setSelectedBook(book);
    setFormPinjam({ jumlah: 1, kepentingan: '', tgl_deadline: '' });
    setTimeout(() => setShowPinjamModal(true), 0);
  };

  const closePinjamModal = () => {
    setShowPinjamModal(false);
    setFormPinjam({ jumlah: 1, kepentingan: '', tgl_deadline: '' });

    const main = document.querySelector('main.overflow-y-auto');
    if (main) {
      main.style.overflow = 'auto';
      main.style.position = '';
      requestAnimationFrame(() => {
        main.scrollTop = savedScrollTop.current;
      });
    }
  };

  const handleSubmitPinjam = async () => {
    // Double-check denda sebelum submit
    if (dendaAktif) {
      toast.error('Kamu masih memiliki denda yang belum lunas.');
      closePinjamModal();
      return;
    }

    if (!formPinjam.tgl_deadline) {
      toast.error('Tanggal deadline wajib diisi');
      return;
    }
    if (formPinjam.jumlah < 1 || formPinjam.jumlah > selectedBook.stok_tersedia) {
      toast.error(`Jumlah harus antara 1 – ${selectedBook.stok_tersedia}`);
      return;
    }

    setPinjamLoading(true);
    try {
      await ajukanPeminjaman(selectedBook.id, {
        jumlah: parseInt(formPinjam.jumlah),
        kepentingan: formPinjam.kepentingan || null,
        tgl_deadline: formPinjam.tgl_deadline,
      });
      toast.success('Peminjaman berhasil diajukan!');
      closePinjamModal();
      closeDetailModal();
    } catch (error) {
      toast.error(error.message || 'Gagal mengajukan peminjaman');
    } finally {
      setPinjamLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // ─── Stock Status Component ──────────────────────
  const StockStatus = ({ stok }) => {
    if (stok > 3) {
      return (
        <div className="flex items-center gap-1.5 text-emerald-600">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-semibold">{stok} Tersedia</span>
        </div>
      );
    } else if (stok > 0) {
      return (
        <div className="flex items-center gap-1.5 text-amber-600">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <span className="text-xs font-semibold">{stok} Tersisa</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1.5 text-red-600">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-xs font-semibold">Habis</span>
        </div>
      );
    }
  };

  // ─── Book Card Component ─────────────────────────
  const BookCard = ({ book }) => {
    const coverUrl = getCoverUrl(book.cover);

    return (
      <div
        className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
        onClick={() => openDetailModal(book)}
      >
        <div className="relative overflow-hidden h-52 sm:h-56 lg:h-64">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={book.judul}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.classList.add('bg-gradient-to-br', 'from-gray-200', 'to-gray-300');
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <BookOpen size={40} className="text-blue-400 opacity-50" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>

          <div className="absolute inset-0 p-3 flex flex-col justify-end text-white">
            {book.kategori && (
              <div className="mb-1.5">
                <span className="inline-block px-2 py-0.5 bg-blue-500/90 backdrop-blur-sm rounded-full text-xs font-semibold">
                  {book.kategori.nama_kategori}
                </span>
              </div>
            )}

            <h3 className="text-sm font-bold leading-tight mb-1.5 group-hover:text-blue-300 transition-colors duration-200 line-clamp-2">
              {book.judul}
            </h3>

            <div className="text-xs space-y-1 mb-2 opacity-90">
              {book.penulis && (
                <p className="line-clamp-1">
                  <span className="opacity-70">Penulis:</span> {book.penulis}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/20">
              <div className="flex-1">
                <StockStatus stok={book.stok_tersedia} />
              </div>
              {book.tahun_terbit && (
                <div className="flex items-center gap-1 text-white/80">
                  <Clock size={12} />
                  <span className="text-xs font-medium">{book.tahun_terbit}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── Render ──────────────────────────────────────
  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              Katalog Buku
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
              Temukan dan pinjam buku dari koleksi perpustakaan kami
            </p>
          </div>
        </div>

        {/* ── Banner Denda Aktif ───────────────────────────────────────── */}
        {!dendaLoading && dendaAktif && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-red-700 text-sm">Kamu tidak dapat meminjam buku saat ini</p>
              <p className="text-red-600 text-xs mt-1">
                Kamu masih memiliki denda sebesar{' '}
                <span className="font-bold">{formatRupiah(dendaAktif.nominal)}</span>
                {dendaAktif.judul_buku && (
                  <> dari peminjaman buku <span className="font-semibold">"{dendaAktif.judul_buku}"</span></>
                )}
                . Silakan selesaikan pembayaran denda terlebih dahulu.
              </p>
            </div>
          </div>
        )}
        {/* ──────────────────────────────────────────────────────────────── */}

        {/* Filters Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">Kategori</label>
              <select
                className="select select-bordered w-full bg-white text-sm"
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
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
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">Tahun Terbit</label>
              <select
                className="select select-bordered w-full bg-white text-sm"
                value={filterTahun}
                onChange={(e) => setFilterTahun(e.target.value)}
              >
                <option value="">Semua Tahun</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">Urutan</label>
              <select
                className="select select-bordered w-full bg-white text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="">Default (A–Z)</option>
                <option value="terbaru">Tahun Terbaru</option>
              </select>
            </div>
          </div>

          <div className="mt-3 sm:mt-4">
            <button className="btn btn-ghost border border-gray-300 hover:bg-gray-50" onClick={resetFilters}>
              Reset
            </button>
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20 sm:py-24">
            <div className="text-center">
              <span className="loading loading-spinner loading-lg text-blue-600"></span>
              <p className="mt-4 text-gray-500 text-sm">Memuat katalog...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
              onSearchChange: setSearchTerm,
            }).TopControls()}

            {paginatedBooks.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-16 text-gray-400">
                <Book size={40} className="mb-2 opacity-40" />
                <p className="text-sm">Tidak ada buku yang ditemukan</p>
                {hasActiveFilter && (
                  <button className="btn btn-ghost btn-sm mt-2 text-blue-600" onClick={resetFilters}>
                    Reset Filter
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 p-4">
                  {paginatedBooks.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
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
                  onSearchChange: setSearchTerm,
                }).BottomControls()}
              </>
            )}
          </div>
        )}

        {/* ─── Modal Detail Buku ─────────────────────── */}
        {showDetailModal && selectedBook && (
          <div className="fixed inset-0 z-[1000] overflow-y-auto" onClick={closeDetailModal}>
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeDetailModal} />
              <div
                className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-4 sm:p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-bold text-lg sm:text-xl mb-4 sm:mb-6 flex items-center gap-2">
                  <BookOpen size={22} className="text-blue-600" />
                  Detail Buku
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <div className="col-span-1">
                    {getCoverUrl(selectedBook.cover) ? (
                      <img
                        src={getCoverUrl(selectedBook.cover)}
                        alt={selectedBook.judul}
                        className="w-full rounded-xl shadow-lg"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-56 sm:h-72 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                        <BookOpen size={48} className="text-blue-400" />
                      </div>
                    )}
                  </div>

                  <div className="col-span-1 md:col-span-2 space-y-3 sm:space-y-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{selectedBook.judul}</h2>
                      {selectedBook.kategori && (
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                          {selectedBook.kategori.nama_kategori}
                        </span>
                      )}
                    </div>

                    {selectedBook.isbn && (
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ISBN</label>
                        <p className="text-sm text-gray-800 mt-1 font-mono">{selectedBook.isbn}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Penulis</label>
                        <p className="text-sm text-gray-800 mt-1">{selectedBook.penulis || '-'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Penerbit</label>
                        <p className="text-sm text-gray-800 mt-1">{selectedBook.penerbit || '-'}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tahun Terbit</label>
                      <p className="text-sm text-gray-800 mt-1">{selectedBook.tahun_terbit || '-'}</p>
                    </div>

                    <div className="border-t pt-3 sm:pt-4">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                        Status Ketersediaan
                      </label>
                      <StockStatus stok={selectedBook.stok_tersedia} />
                    </div>

                    {/* Pesan denda di dalam modal detail */}
                    {dendaAktif && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-600">
                          Kamu tidak bisa meminjam buku karena masih memiliki denda{' '}
                          <span className="font-bold">{formatRupiah(dendaAktif.nominal)}</span> yang belum lunas.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 sm:mt-6 flex gap-3">
                  <button type="button" className="btn btn-ghost flex-1" onClick={closeDetailModal}>
                    Tutup
                  </button>
                  <button
                    className={`btn flex-1 ${
                      selectedBook.stok_tersedia > 0 && !dendaAktif
                        ? 'bg-blue-600 hover:bg-blue-700 text-white border-none'
                        : 'btn-disabled'
                    }`}
                    disabled={selectedBook.stok_tersedia === 0 || !!dendaAktif}
                    onClick={() => openPinjamModal(selectedBook)}
                    title={dendaAktif ? 'Selesaikan denda terlebih dahulu' : ''}
                  >
                    {selectedBook.stok_tersedia === 0
                      ? 'Stok Habis'
                      : dendaAktif
                      ? 'Ada Denda Belum Lunas'
                      : 'Ajukan Peminjaman'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Modal Form Peminjaman / Modal Denda ───────── */}
        {showPinjamModal && selectedBook && (
          <div
            className="fixed inset-0 z-[1001] overflow-y-auto"
            style={{ position: 'fixed' }}
            onClick={closePinjamModal}
          >
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closePinjamModal} />
              <div
                className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md p-4 sm:p-6"
                onClick={(e) => e.stopPropagation()}
              >
                {dendaAktif ? (
                  /* ── Tampilan kalau ada denda ── */
                  <>
                    <div className="flex flex-col items-center text-center mb-5">
                      <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-3">
                        <AlertTriangle size={28} className="text-red-500" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">Peminjaman Diblokir</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Selesaikan denda sebelum meminjam buku baru
                      </p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3 mb-5">
                      <p className="text-xs font-semibold text-red-500 uppercase tracking-wide">Detail Denda</p>

                      {dendaAktif.judul_buku && (
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-sm text-gray-500">Buku</span>
                          <span className="text-sm font-semibold text-gray-800 text-right">
                            {dendaAktif.judul_buku}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center gap-2 border-t border-red-200 pt-3">
                        <span className="text-sm text-gray-500">Total Denda</span>
                        <span className="text-lg font-bold text-red-600">
                          {formatRupiah(dendaAktif.nominal)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center gap-2">
                        <span className="text-sm text-gray-500">Status</span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                          Belum Lunas
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 text-center mb-5">
                      Hubungi operator perpustakaan untuk menyelesaikan pembayaran denda.
                    </p>

                    <button
                      type="button"
                      className="btn w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border-none"
                      onClick={closePinjamModal}
                    >
                      Tutup
                    </button>
                  </>
                ) : (
                  /* ── Form peminjaman normal ── */
                  <>
                    <h3 className="font-bold text-lg mb-2">Ajukan Peminjaman</h3>
                    <p className="text-sm text-gray-600 mb-5 sm:mb-6">
                      <span className="font-semibold text-gray-900">{selectedBook.judul}</span>
                      <br />
                      <span className="text-xs">
                        Stok tersedia:{' '}
                        <span className="text-emerald-600 font-bold">{selectedBook.stok_tersedia}</span>
                      </span>
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Jumlah Buku <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={selectedBook.stok_tersedia}
                          className="input input-bordered w-full bg-gray-50 focus:bg-white"
                          value={formPinjam.jumlah}
                          onChange={(e) => setFormPinjam((prev) => ({ ...prev, jumlah: e.target.value }))}
                          autoFocus={false}
                        />
                        <p className="text-xs text-gray-500 mt-1">Maksimal {selectedBook.stok_tersedia} eksemplar</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Kepentingan <span className="text-gray-400 font-normal">(opsional)</span>
                        </label>
                        <textarea
                          rows="3"
                          placeholder="Contoh: Untuk tugas penelitian..."
                          className="textarea textarea-bordered w-full bg-gray-50 focus:bg-white resize-none"
                          value={formPinjam.kepentingan}
                          onChange={(e) => setFormPinjam((prev) => ({ ...prev, kepentingan: e.target.value }))}
                          autoFocus={false}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tanggal Pengembalian <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          min={todayStr}
                          className="input input-bordered w-full bg-gray-50 focus:bg-white"
                          value={formPinjam.tgl_deadline}
                          onChange={(e) => setFormPinjam((prev) => ({ ...prev, tgl_deadline: e.target.value }))}
                          autoFocus={false}
                        />
                      </div>
                    </div>

                    <div className="mt-5 sm:mt-6 flex gap-3">
                      <button
                        type="button"
                        className="btn btn-ghost flex-1"
                        onClick={closePinjamModal}
                        disabled={pinjamLoading}
                      >
                        Batal
                      </button>
                      <button
                        className="btn bg-blue-600 hover:bg-blue-700 text-white border-none flex-1"
                        onClick={handleSubmitPinjam}
                        disabled={pinjamLoading}
                      >
                        {pinjamLoading ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          'Ajukan Peminjaman'
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default KatalogBuku;