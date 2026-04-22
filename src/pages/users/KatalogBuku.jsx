import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  BookOpen, Clock, Book, AlertTriangle,
  ShoppingCart, CheckCircle, Plus, Info, Zap,
} from 'lucide-react';
import { getAllBooks } from '../../services/users/katalogService';
import { ajukanPeminjaman, cekDendaAktif, getMyTransaksi } from '../../services/users/transaksiService';
import AppLayout from '../../components/AppLayout';
import Pagination from '../../components/common/Pagination';
import KeranjangDrawer from './components/KeranjangDrawer';

const DAY_NAMES   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'];

const formatDeadlinePreview = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((d - today) / 86400000);
  return {
    label: `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
    diffDays,
  };
};

const StockStatus = ({ stok }) => {
  if (stok > 3) return (
    <div className="flex items-center gap-1.5 text-emerald-600">
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <span className="text-xs font-semibold">{stok} Tersedia</span>
    </div>
  );
  if (stok > 0) return (
    <div className="flex items-center gap-1.5 text-amber-600">
      <div className="w-2 h-2 rounded-full bg-amber-500" />
      <span className="text-xs font-semibold">{stok} Tersisa</span>
    </div>
  );
  return (
    <div className="flex items-center gap-1.5 text-red-500">
      <div className="w-2 h-2 rounded-full bg-red-400" />
      <span className="text-xs font-semibold">Habis</span>
    </div>
  );
};

const DendaBanner = ({ dendaLoading, isBlocked, dendaInfo, formatRupiah }) => {
  if (dendaLoading || !isBlocked) return null;

  const nominal = dendaInfo?.nominal || 0;

  return (
    <div className="mb-3 flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
      <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-amber-700 leading-relaxed">
        <span className="font-semibold">Tidak bisa meminjam</span>
        {' '}· anda memiliki denda{' '}
        <span className="font-semibold">{formatRupiah(nominal)}</span>
        {' '}yang harus diselesaikan · Selesaikan pembayaran untuk meminjam lagi.
      </p>
    </div>
  );
};

const PinjamanAktifBanner = ({ hasPinjamanAktif, isBlocked, pinjamanMenunggu, pinjamanDipinjam }) => {
  if (!hasPinjamanAktif || isBlocked) return null;

  if (pinjamanMenunggu.length > 0 && pinjamanDipinjam.length === 0) {
    const jumlahBuku = pinjamanMenunggu.reduce((acc, t) => acc + (t.details?.length || 0), 0);
    return (
      <div className="mb-3 flex items-start gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
        <Info size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          <span className="font-semibold">Pengajuan diverifikasi</span>
          {' '}· <span className="font-medium">{jumlahBuku} buku</span> menunggu persetujuan operator.
          Tidak bisa mengajukan peminjaman sementara.
        </p>
      </div>
    );
  }

  if (pinjamanDipinjam.length > 0) {
    const jumlahBukuDipinjam = pinjamanDipinjam.reduce(
      (acc, t) => acc + (t.details?.filter((d) => d.status === 'dipinjam').length || 0), 0
    );
    const deadlineStr = pinjamanDipinjam[0]?.tgl_deadline;
    const istelat     = deadlineStr && new Date() > new Date(deadlineStr);

    return (
      <div className={`mb-3 flex items-start gap-2 px-3 py-2 border rounded-lg ${istelat ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
        <Info size={13} className={`flex-shrink-0 mt-0.5 ${istelat ? 'text-red-500' : 'text-blue-500'}`} />
        <p className={`text-xs leading-relaxed ${istelat ? 'text-red-700' : 'text-blue-700'}`}>
          <span className="font-semibold">{istelat ? 'Buku melewati batas pengembalian' : 'Masih ada buku dipinjam'}</span>
          {' '}· <span className="font-medium">{jumlahBukuDipinjam} buku</span>
          {deadlineStr && (
            <> · deadline{' '}
              <span className="font-medium">
                {new Date(deadlineStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </>
          )}
          {' '}· Kembalikan semua buku untuk meminjam lagi.
          {pinjamanMenunggu.length > 0 && (
            <> +{pinjamanMenunggu.reduce((acc, t) => acc + (t.details?.length || 0), 0)} buku menunggu verifikasi.</>
          )}
        </p>
      </div>
    );
  }

  return null;
};

const BookCard = ({
  book, cart, cannotBorrow, hasPinjamanAktif, isBlocked, isBukuTelat,
  transaksiAktif, addToCart, openDetailModal, getCoverUrl,
}) => {
  const isInCart         = cart.some((c) => c.buku_id === book.id);
  const isSedangMenunggu = transaksiAktif.some(
    (t) => t.status === 'menunggu' && t.details?.some((d) => d.buku_id === book.id)
  );
  const isSedangDipinjam = transaksiAktif.some(
    (t) => t.status === 'dipinjam' && t.details?.some((d) => d.buku_id === book.id)
  );
  const coverUrl = getCoverUrl(book.cover);
  const habis    = book.stok_tersedia < 1;
  const cartFull = cart.length >= 3 && !isInCart;
  const blocked  = cannotBorrow || habis || isSedangDipinjam || isSedangMenunggu || cartFull;

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300">
      <div
        className="relative overflow-hidden h-52 sm:h-56 lg:h-64 cursor-pointer"
        onClick={() => openDetailModal(book)}
      >
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

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

        <div className="absolute inset-0 p-3 flex flex-col justify-end text-white">
          {book.kategori?.length > 0 && (
  <div className="flex flex-wrap gap-1 mb-1.5">
    {book.kategori.map((kat) => (
      <span key={kat.id} className="inline-block px-2 py-0.5 bg-blue-500/90 backdrop-blur-sm rounded-full text-xs font-semibold">
        {kat.nama_kategori}
      </span>
    ))}
  </div>
)}
          <h3 className="text-sm font-bold leading-tight mb-1.5 group-hover:text-blue-300 transition-colors duration-200 line-clamp-2">
            {book.judul}
          </h3>
          {book.penulis && (
            <p className="text-xs opacity-80 line-clamp-1 mb-2">
              <span className="opacity-70">Penulis:</span> {book.penulis}
            </p>
          )}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/20">
            <StockStatus stok={book.stok_tersedia} />
            {book.tahun_terbit && (
              <div className="flex items-center gap-1 text-white/80">
                <Clock size={12} />
                <span className="text-xs font-medium">{book.tahun_terbit}</span>
              </div>
            )}
          </div>
        </div>

        {isInCart && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 shadow-lg">
            <CheckCircle size={14} />
          </div>
        )}
        {isSedangMenunggu && !isInCart && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            <span className="text-white/80 text-xs">Menunggu</span>
          </div>
        )}
        {isSedangDipinjam && !isInCart && !isSedangMenunggu && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-white/80 text-xs">Dipinjam</span>
          </div>
        )}
      </div>

      <div className="p-2">
        <button
          onClick={() => addToCart(book)}
          disabled={blocked}
          className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200
            ${isInCart
              ? 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
              : isSedangMenunggu
                ? 'bg-yellow-50 text-yellow-600 border border-yellow-200 cursor-not-allowed'
                : isSedangDipinjam
                  ? 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
                  : cartFull
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : hasPinjamanAktif
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : blocked
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            }`}
        >
          {isInCart            ? <><CheckCircle size={13} /> Ada di Keranjang</>
           : isSedangMenunggu  ? <span>Menunggu Persetujuan</span>
           : isSedangDipinjam  ? <span>Sedang Dipinjam</span>
           : cartFull          ? <span>Keranjang Penuh (maks. 3)</span>
           : hasPinjamanAktif  ? <span>Ada Pinjaman Aktif</span>
           : isBlocked         ? <span>Tidak Dapat Dipinjam</span>
           : habis             ? <>Stok Habis</>
           :                     <><ShoppingCart size={15} /> Tambah</>}
        </button>
      </div>
    </div>
  );
};


const KatalogBuku = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterTahun, setFilterTahun] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [categories, setCategories] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);

  const [dendaInfo, setDendaInfo] = useState(null);
  const [dendaLoading, setDendaLoading] = useState(true);
  const [transaksiAktif, setTransaksiAktif] = useState([]);
  const [allTransaksi, setAllTransaksi] = useState([]);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Quick borrow states
  const [showQuickBorrow, setShowQuickBorrow] = useState(false);
  const [quickDeadline, setQuickDeadline] = useState('');
  const [quickKepentingan, setQuickKepentingan] = useState('');
  const [quickBorrowLoading, setQuickBorrowLoading] = useState(false);

  const [cart, setCart] = useState([]);
  const [tglDeadline, setTglDeadline] = useState('');
  const [kepentingan, setKepentingan] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];



  const isBlocked        = dendaInfo?.ada_denda === true;
  const isBukuTelat      = dendaInfo?.tipe === 'buku_telat';
  const hasPinjamanAktif = transaksiAktif.length > 0;
  const pinjamanMenunggu = transaksiAktif.filter((t) => t.status === 'menunggu');
  const pinjamanDipinjam = transaksiAktif.filter((t) => t.status === 'dipinjam');
  const cannotBorrow     = isBlocked || hasPinjamanAktif;

  const formatRupiah = (nominal) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(nominal);

  const getCoverUrl = (coverPath) => {
    if (!coverPath) return null;
    if (coverPath.startsWith('http')) return coverPath;
    return coverPath.startsWith('storage/') ? `/${coverPath}` : `/storage/${coverPath}`;
  };

  const fetchTransaksiAktif = useCallback(async () => {
    try {
      const data = await getMyTransaksi();
      const semua = data.data || [];
      const aktif = semua.filter(
        (t) => t.status === 'menunggu' || t.status === 'dipinjam'
      );
      setAllTransaksi(semua);
      setTransaksiAktif(aktif);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    const fetchDenda = async () => {
      try {
        const result = await cekDendaAktif();
        setDendaInfo(result.ada_denda ? result : null);
      } catch {
        setDendaInfo(null);
      } finally {
        setDendaLoading(false);
      }
    };
    fetchDenda();
  }, []);

  useEffect(() => { fetchTransaksiAktif(); }, [fetchTransaksiAktif]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllBooks({});
        const uniqueKategori = [];
        const seen = new Set();
        (data.data || []).forEach((b) => {
        (b.kategori || []).forEach((kat) => {
          if (!seen.has(kat.id)) {
            seen.add(kat.id);
            uniqueKategori.push(kat);
          }
        });
      });
        setCategories(uniqueKategori);
        const years = [
          ...new Set((data.data || []).map((b) => b.tahun_terbit).filter(Boolean)),
        ].sort((a, b) => b - a);
        setAvailableYears(years);
      } catch {
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
      if (filterTahun)    params.tahun = filterTahun;
      if (sortBy)         params.sort = sortBy;
      const data = await getAllBooks(params);
      setBooks(data.data || []);
    } catch (error) {
      toast.error(error.message || 'Gagal memuat katalog');
    } finally {
      setLoading(false);
    }
  }, [filterKategori, filterTahun, sortBy]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);
  useEffect(() => { setCurrentPage(1); }, [filterKategori, filterTahun, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterKategori('');
    setFilterTahun('');
    setSortBy('');
    setCurrentPage(1);
  };

  const hasActiveFilter = searchTerm || filterKategori || filterTahun || sortBy;

  const filteredBooks = useMemo(() => {
  return books.filter((book) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      book.judul?.toLowerCase().includes(s) ||
      book.penulis?.toLowerCase().includes(s) ||
      book.penerbit?.toLowerCase().includes(s) ||
      book.isbn?.toLowerCase().includes(s) ||
      book.kategori?.some((kat) => kat.nama_kategori?.toLowerCase().includes(s))
    );
  });
}, [books, searchTerm]);

  const totalPages     = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex     = (currentPage - 1) * itemsPerPage;
  const paginatedBooks = filteredBooks.slice(startIndex, startIndex + itemsPerPage);
  const goToPage       = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };

  const isInCart         = (bukuId) => cart.some((c) => c.buku_id === bukuId);
  const isSedangMenunggu = (bukuId) =>
    transaksiAktif.some((t) => t.status === 'menunggu' && t.details?.some((d) => d.buku_id === bukuId));
  const isSedangDipinjam = (bukuId) =>
    transaksiAktif.some((t) => t.status === 'dipinjam' && t.details?.some((d) => d.buku_id === bukuId));

  const addToCart = (book) => {
    if (hasPinjamanAktif) {
      toast.error('Selesaikan peminjaman aktif kamu dulu sebelum meminjam lagi.');
      return;
    }
    if (isBlocked) {
      toast.error(
        isBukuTelat
          ? 'Kembalikan buku yang telat dulu sebelum meminjam.'
          : 'Selesaikan denda terlebih dahulu sebelum meminjam buku.'
      );
      return;
    }
    if (book.stok_tersedia < 1)    { toast.error('Stok buku habis!'); return; }
    if (isSedangDipinjam(book.id)) { toast.error('Kamu masih meminjam buku ini.'); return; }
    if (isSedangMenunggu(book.id)) { toast.error('Peminjaman buku ini masih menunggu persetujuan.'); return; }
    if (isInCart(book.id)) {
      toast('Buku sudah ada di keranjang', { icon: '📚' });
      return;
    }
    if (cart.length >= 3) { toast.error('Maksimal 3 buku per pengajuan.'); return; }

    setCart((prev) => [
      ...prev,
      {
        buku_id: book.id,
        judul: book.judul,
        penulis: book.penulis,
        cover: book.cover,
        stok_tersedia: book.stok_tersedia,
      },
    ]);
    toast.success(`"${book.judul}" ditambahkan ke keranjang`);
  };

  const removeFromCart = (bukuId) =>
    setCart((prev) => prev.filter((c) => c.buku_id !== bukuId));

  const handleSubmitKeranjang = async () => {
    if (hasPinjamanAktif) {
      toast.error('Kamu masih memiliki peminjaman aktif yang belum selesai.');
      return;
    }
    if (isBlocked) {
      toast.error(isBukuTelat ? 'Kembalikan buku yang telat dulu.' : 'Kamu masih memiliki denda yang belum lunas.');
      return;
    }
    if (!tglDeadline) {
      toast.error('Tanggal pengembalian belum diisi.');
      return;
    }

    setSubmitLoading(true);
    try {
      await ajukanPeminjaman({
        books: cart.map((c) => c.buku_id),
        tgl_deadline: tglDeadline,
        kepentingan: kepentingan || null,
      });
      toast.success(`${cart.length} buku berhasil diajukan peminjaman!`);
      setCart([]);
      setTglDeadline('');
      setKepentingan('');
      setShowDrawer(false);
      fetchBooks();
      fetchTransaksiAktif();
    } catch (error) {
      toast.error(error.message || 'Gagal mengajukan peminjaman');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleQuickBorrow = async (book) => {
    if (!quickDeadline) { toast.error('Tanggal pengembalian belum diisi.'); return; }
    setQuickBorrowLoading(true);
    try {
      await ajukanPeminjaman({
        books: [book.id],
        tgl_deadline: quickDeadline,
        kepentingan: quickKepentingan || null,
      });
      toast.success(`"${book.judul}" berhasil diajukan!`);
      setShowDetailModal(false);
      setSelectedBook(null);
      setShowQuickBorrow(false);
      setQuickDeadline('');
      setQuickKepentingan('');
      fetchBooks();
      fetchTransaksiAktif();
    } catch (error) {
      toast.error(error.message || 'Gagal mengajukan peminjaman');
    } finally {
      setQuickBorrowLoading(false);
    }
  };

  const openDetailModal = (book) => {
    setSelectedBook(book);
    setShowDetailModal(true);
    setShowQuickBorrow(false);
    setQuickDeadline('');
    setQuickKepentingan('');
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedBook(null);
    setShowQuickBorrow(false);
    setQuickDeadline('');
    setQuickKepentingan('');
  };

  const canQuickBorrow = (book) =>
    book &&
    !cannotBorrow &&
    !isSedangDipinjam(book.id) &&
    !isSedangMenunggu(book.id) &&
    book.stok_tersedia > 0 &&
    cart.length === 0;

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Katalog Buku</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
              Temukan dan pinjam buku dari koleksi perpustakaan kami
            </p>
          </div>
          <button
            onClick={() => setShowDrawer(true)}
            className="relative flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 shadow-sm"
          >
            <ShoppingCart size={16} />
            Keranjang
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        <PinjamanAktifBanner
          hasPinjamanAktif={hasPinjamanAktif}
          isBlocked={isBlocked}
          pinjamanMenunggu={pinjamanMenunggu}
          pinjamanDipinjam={pinjamanDipinjam}
        />
        <DendaBanner
          dendaLoading={dendaLoading}
          isBlocked={isBlocked}
          isBukuTelat={isBukuTelat}
          dendaInfo={dendaInfo}
          allTransaksi={allTransaksi}
          formatRupiah={formatRupiah}
        />

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
              <select
                className="select select-bordered w-full bg-white text-sm"
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nama_kategori}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Tahun Terbit</label>
              <select
                className="select select-bordered w-full bg-white text-sm"
                value={filterTahun}
                onChange={(e) => setFilterTahun(e.target.value)}
              >
                <option value="">Semua Tahun</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Urutan</label>
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
          <div className="mt-3 flex items-center gap-2">
            <button className="btn btn-ghost border border-gray-300 hover:bg-gray-50 btn-sm" onClick={resetFilters}>
              Reset
            </button>
            {hasActiveFilter && <span className="text-xs text-gray-400">Filter aktif</span>}
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <span className="loading loading-spinner loading-lg text-blue-600" />
              <p className="mt-4 text-gray-500 text-sm">Memuat katalog...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {Pagination({
              currentPage, totalPages, itemsPerPage,
              totalItems: filteredBooks.length, searchTerm,
              onPageChange: goToPage,
              onItemsPerPageChange: (value) => { setItemsPerPage(value); setCurrentPage(1); },
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
                    <BookCard
                      key={book.id}
                      book={book}
                      cart={cart}
                      cannotBorrow={cannotBorrow}
                      hasPinjamanAktif={hasPinjamanAktif}
                      isBlocked={isBlocked}
                      isBukuTelat={isBukuTelat}
                      transaksiAktif={transaksiAktif}
                      addToCart={addToCart}
                      openDetailModal={openDetailModal}
                      getCoverUrl={getCoverUrl}
                    />
                  ))}
                </div>
                {Pagination({
                  currentPage, totalPages, itemsPerPage,
                  totalItems: filteredBooks.length, searchTerm,
                  onPageChange: goToPage,
                  onItemsPerPageChange: (value) => { setItemsPerPage(value); setCurrentPage(1); },
                  onSearchChange: setSearchTerm,
                }).BottomControls()}
              </>
            )}
          </div>
        )}
        {showDetailModal && selectedBook && (
          <div className="fixed inset-0 z-[1000] overflow-y-auto" onClick={closeDetailModal}>
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
              <div
                className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-4 sm:p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-bold text-lg sm:text-xl mb-4 sm:mb-6 flex items-center gap-2">
                  <BookOpen size={22} className="text-blue-600" />
                  Detail Buku
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  {/* Cover */}
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

                  {/* Info */}
                  <div className="col-span-1 md:col-span-2 space-y-3 sm:space-y-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{selectedBook.judul}</h2>
                      {selectedBook.kategori?.length > 0 && (
  <div className="flex flex-wrap gap-1">
    {selectedBook.kategori.map((kat) => (
      <span key={kat.id} className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
        {kat.nama_kategori}
      </span>
    ))}
  </div>
)}
                    </div>
                    {selectedBook.isbn && (
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ISBN</label>
                        <p className="text-sm text-gray-800 mt-1 font-mono">{selectedBook.isbn}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
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
                    <div className="border-t pt-3">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                        Status Ketersediaan
                      </label>
                      <StockStatus stok={selectedBook.stok_tersedia} />
                    </div>

                    {/* Status warnings */}
                    {hasPinjamanAktif && (
                      <div className="flex items-start gap-2 py-2 px-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <Info size={12} className="text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700">
                          {pinjamanMenunggu.length > 0 && pinjamanDipinjam.length === 0
                            ? 'Masih ada pengajuan yang menunggu verifikasi operator.'
                            : 'Kamu masih memiliki buku yang sedang dipinjam.'}
                        </p>
                      </div>
                    )}
                    {isSedangMenunggu(selectedBook.id) && (
                      <div className="flex items-center gap-2 py-2 px-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
                        <p className="text-xs text-yellow-700">Peminjaman kamu sedang menunggu persetujuan operator.</p>
                      </div>
                    )}
                    {isSedangDipinjam(selectedBook.id) && (
                      <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                        <p className="text-xs text-gray-500">Kamu masih meminjam buku ini.</p>
                      </div>
                    )}
                    {!isSedangDipinjam(selectedBook.id) && !isSedangMenunggu(selectedBook.id) && cart.length >= 3 && !isInCart(selectedBook.id) && (
                      <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <AlertTriangle size={12} className="text-gray-400 flex-shrink-0" />
                        <p className="text-xs text-gray-500">Keranjang sudah penuh (maks. 3 buku per pengajuan).</p>
                      </div>
                    )}
                    {isBlocked && (
                      <div className="flex items-center gap-2 py-2 px-3 bg-amber-50 border border-amber-100 rounded-lg">
                        <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />
                        <p className="text-xs text-amber-700">
                          {isBukuTelat
                            ? 'Kembalikan buku yang telat dulu sebelum meminjam.'
                            : <>Ada denda <span className="font-semibold">{formatRupiah(dendaInfo?.denda?.nominal)}</span> yang belum lunas.</>}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 space-y-2.5">
                  {showQuickBorrow && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 overflow-hidden">
                      {/* header strip */}
                      <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-100/70 border-b border-emerald-200">
                        <Zap size={12} className="text-emerald-600 flex-shrink-0" />
                        <p className="text-xs font-semibold text-emerald-700 truncate">
                          Pinjam Langsung
                          {selectedBook.judul && (
                            <span className="font-normal text-emerald-600"> · {selectedBook.judul}</span>
                          )}
                        </p>
                      </div>

                      <div className="p-3 space-y-2.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-medium text-gray-500 mb-1">
                              Tgl kembali <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="date"
                              className="input input-bordered input-xs w-full bg-white text-xs"
                              value={quickDeadline}
                              min={todayStr}
                              onChange={(e) => setQuickDeadline(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-gray-500 mb-1">
                              Kepentingan <span className="text-gray-400 font-normal">(opsional)</span>
                            </label>
                            <input
                              type="text"
                              className="input input-bordered input-xs w-full bg-white text-xs"
                              placeholder="Tugas, belajar..."
                              value={quickKepentingan}
                              maxLength={100}
                              onChange={(e) => setQuickKepentingan(e.target.value)}
                            />
                          </div>
                        </div>
                        {quickDeadline && (() => {
                          const preview = formatDeadlinePreview(quickDeadline);
                          return preview ? (
                            <div className="flex items-center justify-between px-2.5 py-1.5 bg-white rounded-lg border border-emerald-100">
                              <span className="text-[11px] text-gray-600">{preview.label}</span>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${preview.diffDays <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {preview.diffDays} hari lagi
                              </span>
                            </div>
                          ) : null;
                        })()}

                        {/* actions */}
                        <div className="flex gap-2">
                          
                          <button
                            className="btn btn-xs flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-none disabled:opacity-50"
                            onClick={() => handleQuickBorrow(selectedBook)}
                            disabled={quickBorrowLoading || !quickDeadline}
                          >
                            {quickBorrowLoading
                              ? <span className="loading loading-spinner loading-xs" />
                              : <><Zap size={11} className="mr-1" />Ajukan</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 sm:gap-3">
                    {canQuickBorrow(selectedBook) && (
                      <button
                        className={`btn flex-1 border-none transition-all duration-200 ${
                          showQuickBorrow
                            ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                        onClick={() => setShowQuickBorrow((v) => !v)}
                      >
                        <Zap size={14} />
                        {showQuickBorrow ? 'Tutup' : 'Pinjam Langsung'}
                      </button>
                    )}

                    {/* Tambah ke Keranjang */}
                    <button
                      className={`btn flex-1 ${
                        selectedBook.stok_tersedia > 0 &&
                        !cannotBorrow &&
                        !isSedangDipinjam(selectedBook.id) &&
                        !isSedangMenunggu(selectedBook.id) &&
                        (cart.length < 3 || isInCart(selectedBook.id))
                          ? isInCart(selectedBook.id)
                            ? 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200'
                            : 'bg-blue-600 hover:bg-blue-700 text-white border-none'
                          : 'btn-disabled'
                      }`}
                      disabled={
                        selectedBook.stok_tersedia === 0 ||
                        cannotBorrow ||
                        isSedangDipinjam(selectedBook.id) ||
                        isSedangMenunggu(selectedBook.id) ||
                        (cart.length >= 3 && !isInCart(selectedBook.id))
                      }
                      onClick={() => { addToCart(selectedBook); closeDetailModal(); }}
                    >
                      {selectedBook.stok_tersedia === 0         ? 'Stok Habis'
                       : isSedangMenunggu(selectedBook.id)      ? 'Menunggu Persetujuan'
                       : isSedangDipinjam(selectedBook.id)      ? 'Sedang Dipinjam'
                       : hasPinjamanAktif                       ? 'Ada Pinjaman Aktif'
                       : isBlocked
                         ? isBukuTelat ? 'Ada Buku Telat' : 'Ada Denda Belum Lunas'
                       : cart.length >= 3 && !isInCart(selectedBook.id) ? 'Keranjang Penuh'
                       : isInCart(selectedBook.id)              ? <><CheckCircle size={13} /> Sudah di Keranjang</>
                       :                                          <><ShoppingCart size={15} /></>}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Keranjang Drawer */}
        <KeranjangDrawer
          showDrawer={showDrawer}
          setShowDrawer={setShowDrawer}
          cart={cart}
          removeFromCart={removeFromCart}
          tglDeadline={tglDeadline}
          setTglDeadline={setTglDeadline}
          kepentingan={kepentingan}
          setKepentingan={setKepentingan}
          submitLoading={submitLoading}
          handleSubmitKeranjang={handleSubmitKeranjang}
          cannotBorrow={cannotBorrow}
          hasPinjamanAktif={hasPinjamanAktif}
          isBlocked={isBlocked}
          isBukuTelat={isBukuTelat}
          dendaInfo={dendaInfo}
          pinjamanMenunggu={pinjamanMenunggu}
          pinjamanDipinjam={pinjamanDipinjam}
          formatRupiah={formatRupiah}
          getCoverUrl={getCoverUrl}
          todayStr={todayStr}
        />
      </div>
    </AppLayout>
  );
};

export default KatalogBuku;