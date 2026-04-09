import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Eye, ClipboardList, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getVerifikasi, approveVerifikasi, rejectVerifikasi } from '../../services/operator/verifikasiService';
import AppLayout from '../../components/AppLayout';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';
import DetailVerifikasiModal from './components/DetailVerifikasiModal';

const VerifikasiPeminjaman = () => {
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('siswa');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter
  const [filterTingkat, setFilterTingkat] = useState('all');
  const [filterJurusan, setFilterJurusan] = useState('all');
  const [filterKelas, setFilterKelas] = useState('all');

  // Modal detail
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);

  // Modal approve
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedApprove, setSelectedApprove] = useState(null);
  const [loadingApprove, setLoadingApprove] = useState(false);

  // Modal reject
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReject, setSelectedReject] = useState(null);
  const [pesanDitolak, setPesanDitolak] = useState('');
  const [loadingReject, setLoadingReject] = useState(false);

  useEffect(() => { fetchVerifikasi(); }, []);

  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm('');
    setFilterTingkat('all');
    setFilterJurusan('all');
    setFilterKelas('all');
  }, [activeTab]);

  const fetchVerifikasi = async () => {
    setLoading(true);
    try {
      const data = await getVerifikasi();
      setTransaksi(data.data || []);
    } catch (error) {
      toast.error(error?.message || 'Gagal memuat data verifikasi');
    } finally {
      setLoading(false);
    }
  };

  // ─── Handlers ───────────────────────────────────────────────
  const handleDetailClick = (item) => {
    setSelectedTransaksi(item);
    setShowDetailModal(true);
  };

  const handleApproveClick = (item) => {
    setSelectedTransaksi(null);
    setShowDetailModal(false);
    setSelectedApprove(item);
    setShowApproveModal(true);
  };

  const handleApproveConfirm = async () => {
    setLoadingApprove(true);
    try {
      await approveVerifikasi(selectedApprove.id);
      toast.success('Peminjaman berhasil disetujui');
      setShowApproveModal(false);
      setSelectedApprove(null);
      fetchVerifikasi();
    } catch (error) {
      toast.error(error?.message || 'Gagal menyetujui peminjaman');
    } finally {
      setLoadingApprove(false);
    }
  };

  const handleRejectClick = (item) => {
    setSelectedTransaksi(null);
    setShowDetailModal(false);
    setSelectedReject(item);
    setPesanDitolak('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!pesanDitolak.trim()) {
      toast.error('Pesan penolakan wajib diisi');
      return;
    }
    setLoadingReject(true);
    try {
      await rejectVerifikasi(selectedReject.id, pesanDitolak);
      toast.success('Peminjaman berhasil ditolak');
      setShowRejectModal(false);
      setSelectedReject(null);
      setPesanDitolak('');
      fetchVerifikasi();
    } catch (error) {
      toast.error(error?.message || 'Gagal menolak peminjaman');
    } finally {
      setLoadingReject(false);
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────
  const getRole = (item) => {
    if (item.user?.siswa) return 'siswa';
    if (item.user?.staff) return 'staff';
    return 'unknown';
  };

  const getNama = (item) => {
    return item.user?.siswa?.nama_lengkap
      || item.user?.staff?.nama_lengkap
      || item.user?.name
      || '-';
  };

  const getSubInfo = (item) => {
    if (item.user?.siswa) {
      const s = item.user.siswa;
      if (s.tingkat && s.jurusan) return `${s.tingkat} ${s.jurusan} ${s.kelas || ''}`.trim();
      return s.kelas || '-';
    }
    if (item.user?.staff) return item.user.staff.jabatan || '-';
    return '-';
  };

  const getSubInfoLabel = (item) => {
    if (item.user?.siswa) return 'Kelas';
    if (item.user?.staff) return 'Jabatan';
    return 'Info';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  const handleResetFilter = () => {
    setFilterTingkat('all');
    setFilterJurusan('all');
    setFilterKelas('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const hasActiveFilter = searchTerm || filterTingkat !== 'all' || filterJurusan !== 'all' || filterKelas !== 'all'

  // ─── Filter ──────────────────────────────────────────────────
  const filteredTransaksi = transaksi
    .filter((item) => {
      if (activeTab === 'siswa') return !!item.user?.siswa;
      if (activeTab === 'staff') return !!item.user?.staff;
      return true;
    })
    .filter((item) => {
      const nama = getNama(item).toLowerCase();
      const judul = item.buku?.judul?.toLowerCase() || '';
      const matchSearch = nama.includes(searchTerm.toLowerCase()) || judul.includes(searchTerm.toLowerCase());
      if (activeTab !== 'siswa') return matchSearch;
      const matchTingkat = filterTingkat === 'all' || item.user?.siswa?.tingkat === filterTingkat;
      const matchJurusan = filterJurusan === 'all' || item.user?.siswa?.jurusan === filterJurusan;
      const matchKelas = filterKelas === 'all' || item.user?.siswa?.kelas?.toString() === filterKelas;
      return matchSearch && matchTingkat && matchJurusan && matchKelas;
    });

  const totalPages = Math.ceil(filteredTransaksi.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredTransaksi.slice(startIndex, startIndex + itemsPerPage);
  const goToPage = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Verifikasi Peminjaman</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola dan verifikasi permintaan peminjaman buku</p>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-2 rounded-lg">
            <Clock size={16} />
            <span>{transaksi.length} menunggu verifikasi</span>
          </div>
        </div>

        {/* Tabs */}
        <div role="tablist" className="tabs tabs-lift tabs-sm mb-6">
          <a
            role="tab"
            className={`tab ${activeTab === 'siswa' ? 'tab-active [--tab-bg:#dbeafe] [--tab-color:#1e40af]' : ''}`}
            onClick={() => setActiveTab('siswa')}
          >
            Siswa
          </a>
          <a
            role="tab"
            className={`tab ${activeTab === 'staff' ? 'tab-active [--tab-bg:#dbeafe] [--tab-color:#1e40af]' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            Staff
          </a>
        </div>

        {/* Filter Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tingkat</label>
                <select
                  className="select select-bordered bg-white w-full"
                  value={filterTingkat}
                  onChange={(e) => { setFilterTingkat(e.target.value); setCurrentPage(1); }}
                  disabled={activeTab !== 'siswa'}
                >
                  <option value="all">Semua Tingkat</option>
                  <option value="X">X</option>
                  <option value="XI">XI</option>
                  <option value="XII">XII</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jurusan</label>
                <select
                  className="select select-bordered bg-white w-full"
                  value={filterJurusan}
                  onChange={(e) => { setFilterJurusan(e.target.value); setCurrentPage(1); }}
                  disabled={activeTab !== 'siswa'}
                >
                  <option value="all">Semua Jurusan</option>
                  <option value="RPL">RPL</option>
                  <option value="ANIMASI">ANIMASI</option>
                  <option value="TJKT">TJKT</option>
                  <option value="TE">TE</option>
                  <option value="PSPT">PSPT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
                <select
                  className="select select-bordered bg-white w-full"
                  value={filterKelas}
                  onChange={(e) => { setFilterKelas(e.target.value); setCurrentPage(1); }}
                  disabled={activeTab !== 'siswa'}
                >
                  <option value="all">Semua Kelas</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
            </div>
            <div>
              <button
                className="btn btn-ghost border border-gray-300 hover:bg-gray-50"
                onClick={handleResetFilter}
                disabled={activeTab !== 'siswa'}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {Pagination({
            currentPage,
            totalPages,
            itemsPerPage,
            totalItems: filteredTransaksi.length,
            searchTerm,
            onPageChange: goToPage,
            onItemsPerPageChange: (value) => { setItemsPerPage(value); setCurrentPage(1); },
            onSearchChange: setSearchTerm,
          }).TopControls()}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : paginatedData.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-16 text-gray-400 gap-2">
            <ClipboardList size={40} className="opacity-40" />
            <p className="text-sm">
              {hasActiveFilter
                ? 'Tidak ada transaksi yang ditemukan'
                : 'Tidak ada transaksi yang menunggu'}
            </p>
            {hasActiveFilter && (
              <button className="btn btn-ghost btn-sm mt-1 text-blue-600" onClick={handleResetFilter}>
                Reset Filter
              </button>
            )}
          </div>
          ) : (
            <>
              {/* ── Table View ── */}
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-white border-b-2 border-gray-200">
                      <th className="w-12 font-semibold text-gray-700">No</th>
                      <th className="font-semibold text-gray-700">Peminjam</th>
                      {activeTab === 'siswa' && <th className="font-semibold text-gray-700">Kelas</th>}
                      {activeTab === 'staff' && <th className="font-semibold text-gray-700">Jabatan</th>}
                      <th className="font-semibold text-gray-700">Buku</th>
                      <th className="w-20 text-center font-semibold text-gray-700">Jumlah</th>
                      <th className="w-32 text-center font-semibold text-gray-700">Tgl Deadline</th>
                      <th className="w-32 text-center font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-150"
                      >
                        <td className="text-gray-500">{startIndex + index + 1}</td>

                        {/* Peminjam */}
                        <td>
                          <p className="font-medium text-gray-800 text-sm">{getNama(item)}</p>
                          <p className="text-xs text-gray-400">
                            {activeTab === 'siswa'
                              ? item.user?.siswa?.nomor_induk_siswa || '-'
                              : item.user?.staff?.nomor_induk_pegawai || '-'}
                          </p>
                        </td>

                        {/* Kolom dinamis kelas/jabatan */}
                        {activeTab === 'siswa' && (
                          <td className="text-sm text-gray-600">{getSubInfo(item)}</td>
                        )}
                        {activeTab === 'staff' && (
                          <td className="text-sm text-gray-600">{item.user?.staff?.jabatan || '-'}</td>
                        )}

                        {/* Buku */}
                        <td>
                          <p className="font-medium text-gray-800 text-sm line-clamp-1">{item.buku?.judul || '-'}</p>
                          <p className="text-xs text-gray-400">{item.buku?.isbn || ''}</p>
                        </td>

                        <td className="text-center">{item.jumlah || 1}</td>
                        <td className="text-center text-sm text-gray-600">{formatDate(item.tgl_deadline)}</td>

                        {/* Aksi */}
                        <td>
                          <div className="flex gap-1.5 justify-center">
                            <button
                              className="btn btn-ghost btn-xs text-blue-600 hover:bg-blue-50"
                              onClick={() => handleDetailClick(item)}
                              title="Detail"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              className="btn btn-ghost btn-xs text-green-600 hover:bg-green-50"
                              onClick={() => handleApproveClick(item)}
                              title="Setujui"
                            >
                              <CheckCircle size={15} />
                            </button>
                            <button
                              className="btn btn-ghost btn-xs text-red-600 hover:bg-red-50"
                              onClick={() => handleRejectClick(item)}
                              title="Tolak"
                            >
                              <XCircle size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {Pagination({
                currentPage,
                totalPages,
                itemsPerPage,
                totalItems: filteredTransaksi.length,
                searchTerm,
                onPageChange: goToPage,
                onItemsPerPageChange: (value) => { setItemsPerPage(value); setCurrentPage(1); },
                onSearchChange: setSearchTerm,
              }).BottomControls()}
            </>
          )}
        </div>
      </div>

      {/* ══ Detail Modal ══ */}
      {showDetailModal && (
        <DetailVerifikasiModal
          isOpen={showDetailModal}
          onClose={() => { setShowDetailModal(false); setSelectedTransaksi(null); }}
          transaksi={selectedTransaksi}
          onApprove={handleApproveClick}
          onReject={handleRejectClick}
          getNama={getNama}
          getRole={getRole}
          getSubInfo={getSubInfo}
          getSubInfoLabel={getSubInfoLabel}
          formatDate={formatDate}
          activeTab={activeTab}
        />
      )}

      {/* ══ Modal Approve ══ */}
      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => { setShowApproveModal(false); setSelectedApprove(null); }}
        onConfirm={handleApproveConfirm}
        title="Setujui Peminjaman"
        type="success"
        confirmText={loadingApprove ? 'Memproses...' : 'Ya, Setujui'}
        cancelText="Batal"
        message={
          selectedApprove && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Apakah kamu yakin ingin menyetujui peminjaman berikut?</p>
              <div className="bg-green-50 rounded-lg p-3 space-y-1">
                <p className="text-sm"><span className="font-semibold">Peminjam:</span> {getNama(selectedApprove)}</p>
                <p className="text-sm"><span className="font-semibold">{getSubInfoLabel(selectedApprove)}:</span> {getSubInfo(selectedApprove)}</p>
                <p className="text-sm"><span className="font-semibold">Buku:</span> {selectedApprove.buku?.judul || '-'}</p>
                <p className="text-sm"><span className="font-semibold">Jumlah:</span> {selectedApprove.jumlah || 1} buku</p>
                <p className="text-sm">
                  <span className="font-semibold">Stok Tersedia:</span>{' '}
                  <span className={selectedApprove.buku?.stok_tersedia > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                    {selectedApprove.buku?.stok_tersedia ?? '-'}
                  </span>
                </p>
              </div>
            </div>
          )
        }
      />

      {/* ══ Modal Reject ══ */}
      {showRejectModal && selectedReject && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md">
            <h3 className="font-bold text-base mb-4">Tolak Peminjaman</h3>
            <div className="bg-red-50 rounded-lg p-3 mb-4 space-y-1">
              <p className="text-sm"><span className="font-semibold">Peminjam:</span> {getNama(selectedReject)}</p>
              <p className="text-sm"><span className="font-semibold">{getSubInfoLabel(selectedReject)}:</span> {getSubInfo(selectedReject)}</p>
              <p className="text-sm"><span className="font-semibold">Buku:</span> {selectedReject.buku?.judul || '-'}</p>
              <p className="text-sm"><span className="font-semibold">Jumlah:</span> {selectedReject.jumlah || 1} buku</p>
            </div>
            <div className="form-control w-full mb-2">
              <label className="label pb-1">
                <span className="label-text text-sm font-medium">
                  Alasan Penolakan <span className="text-red-500">*</span>
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full text-sm"
                rows={3}
                placeholder="Tuliskan alasan penolakan..."
                value={pesanDitolak}
                onChange={(e) => setPesanDitolak(e.target.value)}
                maxLength={255}
              />
              <label className="label pt-1">
                <span className="label-text-alt text-gray-400">{pesanDitolak.length}/255 karakter</span>
              </label>
            </div>
            <div className="modal-action mt-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setShowRejectModal(false); setSelectedReject(null); setPesanDitolak(''); }}
                disabled={loadingReject}
              >
                Batal
              </button>
              <button
                className="btn btn-error btn-sm"
                onClick={handleRejectConfirm}
                disabled={loadingReject || !pesanDitolak.trim()}
              >
                {loadingReject
                  ? <span className="loading loading-spinner loading-xs"></span>
                  : <XCircle size={14} />}
                {loadingReject ? 'Memproses...' : 'Tolak Peminjaman'}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => { setShowRejectModal(false); setSelectedReject(null); setPesanDitolak(''); }}
          />
        </div>
      )}
    </AppLayout>
  );
};

export default VerifikasiPeminjaman;