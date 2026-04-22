import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { BookOpen, Clock, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
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

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [showPesanModal, setShowPesanModal] = useState(false);
  const [selectedPesan, setSelectedPesan] = useState(null);

  const [showPesanDiterimaModal, setShowPesanDiterimaModal] = useState(false);
  const [selectedPesanDiterima, setSelectedPesanDiterima] = useState(null);

  useEffect(() => { fetchTransaksi(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus]);

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

  const getCoverUrl = (coverPath) => {
    if (!coverPath) return null;
    if (coverPath.startsWith('http')) return coverPath;
    return coverPath.startsWith('storage/') ? `/${coverPath}` : `/storage/${coverPath}`;
  };

  const formatRupiah = (nominal) => {
    if (!nominal || nominal === 0) return null;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(nominal);
  };

  const statusConfig = {
    menunggu:   { label: 'Menunggu',     badge: 'badge-warning', icon: <Clock size={14} /> },
    dipinjam:   { label: 'Dipinjam',     badge: 'badge-info',    icon: <BookOpen size={14} /> },
    kembali:    { label: 'Dikembalikan', badge: 'badge-success', icon: <CheckCircle size={14} /> },
    ditolak:    { label: 'Ditolak',      badge: 'badge-error',   icon: <XCircle size={14} /> },
    dibatalkan: { label: 'Dibatalkan',   badge: 'badge-ghost',   icon: <XCircle size={14} /> },
  };

  const getStatusInfo = (status) => statusConfig[status] || {
    label: status || 'Unknown', badge: 'badge-ghost', icon: <Clock size={14} />,
  };

  const detailStatusConfig = {
    dipinjam:     { label: 'Dipinjam',      badge: 'badge-info' },
    kembali:      { label: 'Dikembalikan',  badge: 'badge-success' },
  };

  const getDetailStatusInfo = (status) => detailStatusConfig[status] || {
    label: status || '-', badge: 'badge-ghost',
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const hasActiveFilter = searchTerm || filterStatus;

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setCurrentPage(1);
  };

  const filteredTransaksi = transaksi.filter((t) => {
    const matchSearch = !searchTerm || t.details?.some(
      (d) =>
        d.buku?.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.buku?.penulis?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchStatus = filterStatus ? t.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredTransaksi.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransaksi = filteredTransaksi.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const openCancelModal = (t) => { setSelectedTransaksi(t); setShowCancelModal(true); };
  const closeCancelModal = () => { setShowCancelModal(false); setSelectedTransaksi(null); };

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

  const openPesanModal = (t) => {
    const judulBuku = t.details?.map(d => d.buku?.judul).filter(Boolean).join(', ') || '-';
    setSelectedPesan({ judul: judulBuku, pesan: t.pesan_ditolak });
    setShowPesanModal(true);
  };
  const closePesanModal = () => { setShowPesanModal(false); setSelectedPesan(null); };

  const openPesanDiterimaModal = (t) => {
    const judulBuku = t.details?.map(d => d.buku?.judul).filter(Boolean).join(', ') || '-';
    setSelectedPesanDiterima({ judul: judulBuku, pesan: t.pesan_diterima });
    setShowPesanDiterimaModal(true);
  };
  const closePesanDiterimaModal = () => { setShowPesanDiterimaModal(false); setSelectedPesanDiterima(null); };

  // Badge total denda di kolom
  const DendaBadge = ({ nominal }) => {
    const formatted = formatRupiah(nominal);
    if (!formatted) return <span className="text-xs text-gray-400">—</span>;
    return (
      <div className="flex flex-col items-center gap-0.5">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
          ⚠️ {formatted}
        </span>
      </div>
    );
  };

  const BukuList = ({ details, tglDeadline, dendaBerjalan }) => {
    if (!details || details.length === 0) return <span className="text-gray-400 text-xs">—</span>;

    const isOverdue = tglDeadline && new Date() > new Date(tglDeadline);
    const bukuMasihDipinjam = details.filter(d => d.status === 'dipinjam');
    const dendaPerBuku = isOverdue && bukuMasihDipinjam.length > 0 && dendaBerjalan
      ? Math.round(dendaBerjalan / bukuMasihDipinjam.length)
      : 0;

    return (
      <div className="flex flex-col gap-3">
        {details.map((d) => {
          const coverUrl = getCoverUrl(d.buku?.cover);
          const detailStatus = getDetailStatusInfo(d.status);
          const denda = d.denda;
          const isDendaBelumLunas = denda?.status_pembayaran === 'belum_lunas';
          const isDendaLunas = denda?.status_pembayaran === 'lunas';
          const showDendaBerjalan = isOverdue && d.status === 'dipinjam' && dendaPerBuku > 0;

          return (
            <div key={d.id} className="flex items-start gap-2">
              {/* Cover */}
              {coverUrl ? (
                <img
                  src={coverUrl} alt={d.buku?.judul}
                  className="w-10 h-14 object-cover rounded flex-shrink-0"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-10 h-14 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                  <BookOpen size={14} className="text-gray-400" />
                </div>
              )}

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">{d.buku?.judul || '-'}</p>
                <p className="text-xs text-gray-500 truncate mb-1">{d.buku?.penulis || '-'}</p>
                <span className={`badge ${detailStatus.badge} badge-xs`}>{detailStatus.label}</span>

                {/* Badge denda berjalan per buku */}
                {showDendaBerjalan && (
                  <div className="mt-1.5 inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full ml-1">
                    ⚠️ {formatRupiah(dendaPerBuku)}
                  </div>
                )}

                {/* Badge denda tercatat belum lunas */}
                {isDendaBelumLunas && (
                  <div className="mt-1.5 inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full ml-1">
                    ⚠️ {formatRupiah(denda.nominal)} · Belum Lunas
                  </div>
                )}

                {/* Badge denda lunas */}
                {isDendaLunas && (
                  <div className="mt-1.5 inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-600 text-xs font-semibold px-2 py-0.5 rounded-full ml-1">
                    <CheckCircle size={10} /> {formatRupiah(denda.nominal)} · Lunas
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Peminjaman Saya</h1>
            <p className="text-sm text-gray-500 mt-2">Lihat dan kelola riwayat peminjaman Anda</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <div className="mt-4">
            <button className="btn btn-ghost border border-gray-300 hover:bg-gray-50" onClick={resetFilters}>
              Reset
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {Pagination({
            currentPage, totalPages, itemsPerPage,
            totalItems: filteredTransaksi.length, searchTerm,
            onPageChange: goToPage,
            onItemsPerPageChange: (value) => { setItemsPerPage(value); setCurrentPage(1); },
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
              {/* Mobile Card View */}
              <div className="block lg:hidden">
                <div className="divide-y divide-gray-100">
                  {paginatedTransaksi.map((t) => {
                    const status = getStatusInfo(t.status);
                    return (
                      <div key={t.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`badge ${status.badge} badge-sm flex items-center gap-0.5`}>
                            {status.icon} {status.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            Deadline: <span className="font-semibold text-gray-700">{formatDate(t.tgl_deadline)}</span>
                          </span>
                        </div>
                        <BukuList
                          details={t.details}
                          tglDeadline={t.tgl_deadline}
                          dendaBerjalan={t.denda_berjalan}
                        />

                        {t.denda_berjalan > 0 && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
                            <span className="font-medium">Total denda berjalan:</span>
                            <span className="font-bold text-red-600">{formatRupiah(t.denda_berjalan)}</span>
                          </div>
                        )}

                        <div className="mt-2 flex gap-2">
                          {t.status === 'menunggu' && (
                            <button
                              className="btn btn-xs bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                              onClick={() => openCancelModal(t)}
                            >
                              <XCircle size={13} /> Batalkan
                            </button>
                          )}
                          {t.status === 'ditolak' && t.pesan_ditolak && (
                            <button
                              className="btn btn-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                              onClick={() => openPesanModal(t)}
                            >
                              <Info size={13} /> Lihat Pesan
                            </button>
                          )}
                          {t.status === 'dipinjam' && t.pesan_diterima && (
                            <button
                              className="btn btn-xs bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                              onClick={() => openPesanDiterimaModal(t)}
                            >
                              <Info size={13} /> Lihat Pesan
                            </button>
                          )}
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
                      <th className="w-12 font-semibold text-gray-700">No</th>
                      <th className="font-semibold text-gray-700">Buku Dipinjam</th>
                      <th className="w-32 text-center font-semibold text-gray-700">Deadline</th>
                      <th className="w-28 text-center font-semibold text-gray-700">Status</th>
                      <th className="w-36 text-center font-semibold text-gray-700">Denda Berjalan</th>
                      <th className="w-36 text-center font-semibold text-gray-700">Pesan Penolakan</th>
                      <th className="w-36 text-center font-semibold text-gray-700">Pesan Penerimaan</th>
                      <th className="w-28 text-center font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTransaksi.map((t, index) => {
                      const status = getStatusInfo(t.status);
                      return (
                        <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                          <td className="align-top pt-4">{startIndex + index + 1}</td>

                          {/* Kolom buku */}
                          <td className="py-3">
                            <BukuList
                              details={t.details}
                              tglDeadline={t.tgl_deadline}
                              dendaBerjalan={t.denda_berjalan}
                            />
                          </td>

                          <td className="text-center text-sm text-gray-600 align-top pt-4">
                            {formatDate(t.tgl_deadline)}
                          </td>

                          <td className="text-center align-top pt-4">
                            <span className={`badge ${status.badge} badge-sm flex items-center gap-1 mx-auto`}>
                              {status.icon} {status.label}
                            </span>
                          </td>

                          {/* Kolom total denda berjalan */}
                          <td className="text-center align-top pt-4">
                            <DendaBadge nominal={t.denda_berjalan} />
                          </td>

                          <td className="text-center align-top pt-4">
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

                          <td className="text-center align-top pt-4">
                            {t.status === 'dipinjam' && t.pesan_diterima ? (
                              <button
                                className="btn btn-ghost btn-xs text-green-600 hover:bg-green-50 flex items-center gap-1 mx-auto"
                                onClick={() => openPesanDiterimaModal(t)}
                              >
                                <Info size={14} /> Lihat Pesan
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>

                          <td className="align-top pt-4">
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

              {Pagination({
                currentPage, totalPages, itemsPerPage,
                totalItems: filteredTransaksi.length, searchTerm,
                onPageChange: goToPage,
                onItemsPerPageChange: (value) => { setItemsPerPage(value); setCurrentPage(1); },
                onSearchChange: setSearchTerm,
              }).BottomControls()}
            </>
          )}
        </div>

        {/* Modal Konfirmasi Cancel */}
        {showCancelModal && selectedTransaksi && (
          <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-sm p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertTriangle size={22} className="text-red-600" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-gray-800">Batalkan Peminjaman?</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                Anda akan membatalkan pengajuan peminjaman buku berikut:
              </p>
              <ul className="list-disc list-inside mb-3 space-y-0.5">
                {selectedTransaksi.details?.map((d) => (
                  <li key={d.id} className="text-sm font-semibold text-gray-800">
                    {d.buku?.judul || '-'}
                  </li>
                ))}
              </ul>
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
                  {cancelLoading ? <span className="loading loading-spinner loading-xs"></span> : 'Ya, Batalkan'}
                </button>
              </div>
            </div>
            <div className="modal-backdrop" onClick={closeCancelModal}></div>
          </div>
        )}

        {/* Modal Pesan Ditolak */}
        {showPesanModal && selectedPesan && (
          <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-md p-4 sm:p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-1">Alasan Penolakan</h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Peminjaman buku "{selectedPesan.judul}"
                  </p>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <p className="text-sm text-gray-700 leading-relaxed">{selectedPesan.pesan}</p>
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

        {/* Modal Pesan Diterima */}
        {showPesanDiterimaModal && selectedPesanDiterima && (
          <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-md p-4 sm:p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-1">Pesan Penerimaan</h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Peminjaman buku "{selectedPesanDiterima.judul}"
                  </p>
                </div>
              </div>
              <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-700 leading-relaxed">{selectedPesanDiterima.pesan}</p>
              </div>
              <div className="modal-action mt-5">
                <button
                  type="button"
                  className="btn btn-sm sm:btn-md bg-green-600 hover:bg-green-700 text-white border-none w-full"
                  onClick={closePesanDiterimaModal}
                >
                  Tutup
                </button>
              </div>
            </div>
            <div className="modal-backdrop" onClick={closePesanDiterimaModal}></div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default PeminjamanSaya;