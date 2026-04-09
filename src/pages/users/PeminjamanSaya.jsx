import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { BookOpen, Clock, CheckCircle, XCircle, AlertTriangle, Search, X, MessageSquare, Info } from 'lucide-react';
import { getMyTransaksi, cancelTransaksi } from '../../services/users/transaksiService';
import AppLayout from '../../components/AppLayout';
import Pagination from '../../components/common/Pagination';

const PeminjamanSaya = () => {
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Cancel confirm modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Modal pesan ditolak
  const [showPesanModal, setShowPesanModal] = useState(false);
  const [selectedPesan, setSelectedPesan] = useState(null);

  useEffect(() => {
    fetchTransaksi();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const fetchTransaksi = async () => {
    setLoading(true);
    try {
      const data = await getMyTransaksi();
      setTransaksi(data.data || []);
    } catch (error) {
      toast.error(error.message || 'Gagal memuat transaksi');
    } finally {
      setLoading(false);
    }
  };

  // ─── Helpers ────────────────────────────────────
  const getCoverUrl = (coverPath) => {
    if (!coverPath) return null;
    if (coverPath.startsWith('http')) return coverPath;
    return coverPath.startsWith('storage/') ? `/${coverPath}` : `/storage/${coverPath}`;
  };

  // Status sesuai enum migration: menunggu, dipinjam, kembali, ditolak, dibatalkan
  const statusConfig = {
    menunggu: {
      label: 'Menunggu',
      badge: 'badge-warning',
      icon: <Clock size={14} />,
    },
    dipinjam: {
      label: 'Dipinjam',
      badge: 'badge-info',
      icon: <BookOpen size={14} />,
    },
    kembali: {
      label: 'Dikembalikan',
      badge: 'badge-success',
      icon: <CheckCircle size={14} />,
    },
    ditolak: {
      label: 'Ditolak',
      badge: 'badge-error',
      icon: <XCircle size={14} />,
    },
    dibatalkan: {
      label: 'Dibatalkan',
      badge: 'badge-ghost',
      icon: <XCircle size={14} />,
    },
  };

  const getStatusInfo = (status) => statusConfig[status] || {
    label: status || 'Unknown',
    badge: 'badge-ghost',
    icon: <Clock size={14} />,
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
  };

  const hasActiveFilter = searchTerm || filterStatus;

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setCurrentPage(1);
  };

  // ─── Filter client-side ─────────────────────────
  const filteredTransaksi = transaksi.filter((t) => {
    const matchSearch =
      t.buku?.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.buku?.penulis?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus ? t.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  // ─── Pagination ─────────────────────────────────
  const totalPages = Math.ceil(filteredTransaksi.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransaksi = filteredTransaksi.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // ─── Cancel Logic ───────────────────────────────
  const openCancelModal = (t) => {
    setSelectedTransaksi(t);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedTransaksi(null);
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await cancelTransaksi(selectedTransaksi.id);
      toast.success('Peminjaman berhasil dibatalkan');
      closeCancelModal();
      setTransaksi((prev) =>
        prev.map((t) => (t.id === selectedTransaksi.id ? { ...t, status: 'dibatalkan' } : t))
      );
    } catch (error) {
      toast.error(error.message || 'Gagal membatalkan peminjaman');
    } finally {
      setCancelLoading(false);
    }
  };

  // ─── Pesan Modal Logic ──────────────────────────
  const openPesanModal = (t) => {
    setSelectedPesan({
      judul: t.buku?.judul,
      pesan: t.pesan_ditolak,
    });
    setShowPesanModal(true);
  };

  const closePesanModal = () => {
    setShowPesanModal(false);
    setSelectedPesan(null);
  };

  // ─── Render ─────────────────────────────────────
  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              Peminjaman Saya
            </h1>
            <p className="text-sm text-gray-60 mt-2">
              Lihat dan kelola riwayat peminjaman Anda
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Filter Status — sesuai enum */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                className="select select-bordered w-full bg-white text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="menunggu">Menunggu</option>
                <option value="dipinjam">Dipinjam</option>
                <option value="kembali">Dikembalikan</option>
                <option value="ditolak">Ditolak</option>
                <option value="dibatalkan">Dibatalkan</option>
              </select>
            </div>
          </div>

          {/* Reset Button - Always Show */}
          <div className="mt-4">
            <button
              className="btn btn-ghost border border-gray-300 hover:bg-gray-50"
              onClick={resetFilters}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Table / Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Entries per page & Search - Using Pagination Component */}
          {Pagination({
            currentPage,
            totalPages,
            itemsPerPage,
            totalItems: filteredTransaksi.length,
            searchTerm,
            onPageChange: goToPage,
            onItemsPerPageChange: (value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            },
            onSearchChange: setSearchTerm,
          }).TopControls()}

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <span className="loading loading-spinner loading-md sm:loading-lg"></span>
            </div>
          ) : paginatedTransaksi.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-16 text-gray-400">
              <BookOpen size={40} className="mb-2 opacity-40" />
              <p className="text-sm">Tidak ada transaksi yang ditemukan</p>
              {hasActiveFilter && (
                <button className="btn btn-ghost btn-sm mt-2 text-blue-600" onClick={resetFilters}>
                  Reset Filter
                </button>
              )}
            </div>
          ) : (
            <>
              {/* ── Mobile Card View ── */}
              <div className="block lg:hidden">
                <div className="divide-y divide-gray-100">
                  {paginatedTransaksi.map((t) => {
                    const coverUrl = getCoverUrl(t.buku?.cover);
                    const status = getStatusInfo(t.status);
                    return (
                      <div key={t.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex gap-3">
                          {/* Cover */}
                          <div className="flex-shrink-0">
                            {coverUrl ? (
                              <img
                                src={coverUrl}
                                alt={t.buku?.judul}
                                className="w-14 h-20 sm:w-16 sm:h-22 object-cover rounded"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-14 h-20 sm:w-16 sm:h-22 bg-gray-200 rounded flex items-center justify-center">
                                <BookOpen size={16} className="text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold text-sm text-gray-800 leading-tight truncate">
                                {t.buku?.judul || '-'}
                              </h3>
                              <span className={`badge ${status.badge} badge-xs flex-shrink-0 flex items-center gap-0.5`}>
                                {status.icon} {status.label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{t.buku?.penulis || '-'}</p>

                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
                              <span>Jumlah: <span className="font-semibold text-gray-700">{t.jumlah}</span></span>
                              <span>Deadline: <span className="font-semibold text-gray-700">{formatDate(t.tgl_deadline)}</span></span>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-2 flex gap-2">
                              {/* Batalkan — cuma kalau menunggu */}
                              {t.status === 'menunggu' && (
                                <button
                                  className="btn btn-xs bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                                  onClick={() => openCancelModal(t)}
                                >
                                  <XCircle size={13} /> Batalkan
                                </button>
                              )}

                              {/* Lihat Keterangan — kalau ditolak dan ada pesan */}
                              {t.status === 'ditolak' && t.pesan_ditolak && (
                                <button
                                  className="btn btn-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                                  onClick={() => openPesanModal(t)}
                                >
                                  <Info size={13} /> Lihat Pesan
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Desktop Table View ── */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-white border-b-2 border-gray-200">
                      <th className="w-12 font-semibold text-gray-700">No</th>
                      <th className="w-20 font-semibold text-gray-700">Cover</th>
                      <th className="font-semibold text-gray-700">Judul Buku</th>
                      <th className="font-semibold text-gray-700">Penulis</th>
                      <th className="w-20 text-center font-semibold text-gray-700">Jumlah</th>
                      <th className="w-32 text-center font-semibold text-gray-700">Deadline</th>
                      <th className="w-28 text-center font-semibold text-gray-700">Status</th>
                      <th className="w-32 text-center font-semibold text-gray-700">Pesan Penolakan</th>
                      <th className="w-28 text-center font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTransaksi.map((t, index) => {
                      const coverUrl = getCoverUrl(t.buku?.cover);
                      const status = getStatusInfo(t.status);

                      return (
                        <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                          <td>{startIndex + index + 1}</td>
                          <td>
                            {coverUrl ? (
                              <img
                                src={coverUrl}
                                alt={t.buku?.judul}
                                className="w-12 h-16 object-cover rounded"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                                <BookOpen size={16} className="text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="font-medium text-gray-800">{t.buku?.judul || '-'}</td>
                          <td className="text-gray-600">{t.buku?.penulis || '-'}</td>
                          <td className="text-center font-semibold">{t.jumlah}</td>
                          <td className="text-center text-sm text-gray-600">{formatDate(t.tgl_deadline)}</td>
                          <td className="text-center">
                            <span className={`badge ${status.badge} badge-sm flex items-center gap-1 mx-auto`}>
                              {status.icon} {status.label}
                            </span>
                          </td>
                          <td className="text-center">
                            {t.status === 'ditolak' && t.pesan_ditolak ? (
                              <button
                                className="btn btn-ghost btn-xs text-blue-600 hover:bg-blue-50 flex items-center gap-1 mx-auto"
                                onClick={() => openPesanModal(t)}
                              >
                                <Info size={14} /> Lihat Pesan
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td>
                            <div className="flex justify-center">
                              {t.status === 'menunggu' ? (
                                <button
                                  className="btn btn-ghost btn-xs text-red-600 hover:bg-red-50 flex items-center gap-1"
                                  onClick={() => openCancelModal(t)}
                                >
                                  <XCircle size={14} /> Batalkan
                                </button>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bottom */}
              {Pagination({
                currentPage,
                totalPages,
                itemsPerPage,
                totalItems: filteredTransaksi.length,
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

        {/* ─── Modal Konfirmasi Cancel ──────────────── */}
        {showCancelModal && selectedTransaksi && (
          <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-sm p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertTriangle size={22} className="text-red-600" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-gray-800">Batalkan Peminjaman?</h3>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                Anda akan membatalkan pengajuan peminjaman buku:
              </p>
              <p className="text-sm font-semibold text-gray-800 mb-4">
                "{selectedTransaksi.buku?.judul}"
              </p>
              <p className="text-xs text-gray-400">Tindakan ini tidak dapat diulang kembali.</p>

              <div className="modal-action mt-5 flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  className="btn btn-ghost btn-xs sm:btn-sm md:btn-md w-full sm:w-auto order-2 sm:order-1"
                  onClick={closeCancelModal}
                  disabled={cancelLoading}
                >
                  Kembali
                </button>
                <button
                  className="btn btn-xs sm:btn-sm md:btn-md bg-red-600 hover:bg-red-700 text-white border-none w-full sm:w-auto order-1 sm:order-2"
                  onClick={handleCancel}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    'Ya, Batalkan'
                  )}
                </button>
              </div>
            </div>
            <div className="modal-backdrop" onClick={closeCancelModal}></div>
          </div>
        )}

        {/* ─── Modal Pesan Ditolak ───────────────────── */}
        {showPesanModal && selectedPesan && (
          <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-md p-4 sm:p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-1">
                    Alasan Penolakan
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Peminjaman buku "{selectedPesan.judul}"
                  </p>
                </div>
              </div>

              <div className="p-3 sm:p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selectedPesan.pesan}
                </p>
              </div>

              <div className="modal-action mt-5">
                <button
                  type="button"
                  className="btn btn-sm sm:btn-md bg-blue-600 hover:bg-blue-700 text-white border-none w-full"
                  onClick={closePesanModal}
                >
                  Tutup
                </button>
              </div>
            </div>
            <div className="modal-backdrop" onClick={closePesanModal}></div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default PeminjamanSaya;