import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, BookOpen, Eye } from 'lucide-react';
import { getPengembalian, terimaPengembalian } from '../../services/operator/pengembalianService';
import AppLayout from '../../components/AppLayout';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';
import DetailPengembalianModal from './components/DetailPengembalianModal';

const STATUS_OPTIONS = [
  { value: 'kembali_normal',       label: 'Kembali Normal' },
  { value: 'kembali_rusak_ringan', label: 'Kembali Rusak Ringan' },
  { value: 'kembali_rusak_sedang', label: 'Kembali Rusak Sedang' },
  { value: 'kembali_rusak_berat',  label: 'Kembali Rusak Berat' },
  { value: 'hilang',               label: 'Hilang' },
];

const formatRupiah = (amount) => {
  const num = parseFloat(amount);
  if (isNaN(num)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(num);
};

const Pengembalian = () => {
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTerima, setLoadingTerima] = useState(null);
  const [loadingTerimaAll, setLoadingTerimaAll] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('kembali_normal');
  const [statusPerDetail, setStatusPerDetail] = useState({});
  const [activeTab, setActiveTab] = useState('siswa');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTingkat, setFilterTingkat] = useState('all');
  const [filterJurusan, setFilterJurusan] = useState('all');
  const [filterKelas, setFilterKelas] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => { fetchPengembalian(); }, []);
  useEffect(() => {
    setCurrentPage(1); setSearchTerm('');
    setFilterTingkat('all'); setFilterJurusan('all'); setFilterKelas('all');
  }, [activeTab]);

  const fetchPengembalian = async () => {
    setLoading(true);
    try {
      const data = await getPengembalian();
      setTransaksi(data.data);
    } catch (error) {
      toast.error(error?.message || 'Gagal memuat data pengembalian');
    } finally {
      setLoading(false);
    }
  };

  const handleDetailClick = (t) => { setSelectedTransaksi(t); setShowDetailModal(true); };

  const handleTerimaClick = (transaksi, detail, status = 'kembali_normal') => {
    setSelectedTransaksi(transaksi);
    setSelectedDetail(detail);
    setSelectedStatus(status);
    setShowDetailModal(false);
    setShowConfirmModal(true);
  };

  const handleTerimaAllClick = (transaksi, activeDetails) => {
    setSelectedTransaksi(transaksi);
    setSelectedDetail(activeDetails);
    const initStatus = {};
    activeDetails.forEach(d => { initStatus[d.id] = 'kembali_normal'; });
    setStatusPerDetail(initStatus);
    setShowDetailModal(false);
    setShowConfirmModal(true);
  };

  const handleTerimaConfirm = async () => {
    setShowConfirmModal(false);
    setLoadingTerima(selectedDetail.id);
    try {
      const res = await terimaPengembalian(selectedDetail.id, selectedStatus);
      toast.success(res.message || 'Pengembalian berhasil diterima');
      fetchPengembalian();
    } catch (error) {
      toast.error(error?.message || 'Gagal menerima pengembalian');
    } finally {
      setLoadingTerima(null);
      setSelectedTransaksi(null);
      setSelectedDetail(null);
      setSelectedStatus('kembali_normal');
    }
  };

  const handleTerimaAllConfirm = async () => {
    if (!Array.isArray(selectedDetail)) return;
    setShowConfirmModal(false);
    setLoadingTerimaAll(true);
    try {
      for (const detail of selectedDetail) {
        const status = detail._selectedStatus || statusPerDetail[detail.id] || 'kembali_normal';
        await terimaPengembalian(detail.id, status);
      }
      toast.success(`${selectedDetail.length} buku berhasil diproses`);
      fetchPengembalian();
    } catch (error) {
      toast.error(error?.message || 'Gagal menerima sebagian pengembalian');
    } finally {
      setLoadingTerimaAll(false);
      setSelectedTransaksi(null);
      setSelectedDetail(null);
      setStatusPerDetail({});
    }
  };

  const handleTerimaDirectly = async (transaksi, detail, status = 'kembali_normal') => {
    setLoadingTerima(detail.id);
    try {
      const res = await terimaPengembalian(detail.id, status);
      toast.success(res.message || 'Pengembalian berhasil diterima');
      fetchPengembalian();
      setShowDetailModal(false);
    } catch (error) {
      toast.error(error?.message || 'Gagal menerima pengembalian');
    } finally {
      setLoadingTerima(null);
    }
  };

  const handleTerimaAllDirectly = async (transaksi, activeDetails) => {
    setLoadingTerimaAll(true);
    try {
      for (const detail of activeDetails) {
        const status = detail._selectedStatus || 'kembali_normal';
        await terimaPengembalian(detail.id, status);
      }
      toast.success(`${activeDetails.length} buku berhasil diproses`);
      fetchPengembalian();
      setShowDetailModal(false);
    } catch (error) {
      toast.error(error?.message || 'Gagal menerima sebagian pengembalian');
    } finally {
      setLoadingTerimaAll(false);
    }
  };

  const isLate = (tgl_deadline) => {
    if (!tgl_deadline) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const deadline = new Date(tgl_deadline); deadline.setHours(0, 0, 0, 0);
    return today > deadline;
  };

  const hitungSelisihHari = (tgl_deadline) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const deadline = new Date(tgl_deadline); deadline.setHours(0, 0, 0, 0);
    return Math.ceil((today - deadline) / (1000 * 60 * 60 * 24));
  };

  const getNamaPeminjam = (user) => {
    if (!user) return '-';
    return user.siswa?.nama_lengkap || user.staff?.nama_lengkap || user.name || '-';
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getActiveDetails = (t) => (t.details || []).filter(d => d.status === 'dipinjam');

  const getBukuDisplay = (t) => {
    const active = getActiveDetails(t);
    if (active.length === 0) return { judul: '-', isbn: '', extra: null };
    if (active.length === 1) return { judul: active[0].buku?.judul || '-', isbn: active[0].buku?.isbn || '', extra: null };
    return { judul: active[0].buku?.judul || '-', isbn: '', extra: `+${active.length - 1} buku lainnya` };
  };

  const handleResetFilter = () => {
    setFilterTingkat('all'); setFilterJurusan('all');
    setFilterKelas('all'); setSearchTerm(''); setCurrentPage(1);
  };

  const hasActiveFilter = searchTerm || filterTingkat !== 'all' || filterJurusan !== 'all' || filterKelas !== 'all';

  const getStatusLabel = (val) => STATUS_OPTIONS.find(s => s.value === val)?.label || val;

  const getEstimasiDendaKerusakan = (detail, status) => {
    const buku = detail?.buku;
    if (!buku || status === 'kembali_normal') return 0;
    if (status === 'hilang') return buku.harga_buku || 0;
    const keyMap = {
      'kembali_rusak_ringan': 'persen_rusak_ringan',
      'kembali_rusak_sedang': 'persen_rusak_sedang',
      'kembali_rusak_berat':  'persen_rusak_berat',
    };
    const persen = buku[keyMap[status]];
    if (!persen || !buku.harga_buku) return null;
    return (buku.harga_buku * persen) / 100;
  };

  const filteredTransaksi = transaksi
    .filter((t) => {
      if (activeTab === 'siswa') return !!t.user?.siswa;
      if (activeTab === 'staff') return !!t.user?.staff;
      return true;
    })
    .filter((t) => {
      const nama = getNamaPeminjam(t.user).toLowerCase();
      const judulMatch = (t.details || []).some(d => d.buku?.judul?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchSearch = nama.includes(searchTerm.toLowerCase()) || judulMatch;
      if (activeTab !== 'siswa') return matchSearch;
      const matchTingkat = filterTingkat === 'all' || t.user?.siswa?.tingkat === filterTingkat;
      const matchJurusan = filterJurusan === 'all' || t.user?.siswa?.jurusan === filterJurusan;
      const matchKelas = filterKelas === 'all' || t.user?.siswa?.kelas?.toString() === filterKelas;
      return matchSearch && matchTingkat && matchJurusan && matchKelas;
    });

  const totalPages = Math.ceil(filteredTransaksi.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransaksi = filteredTransaksi.slice(startIndex, startIndex + itemsPerPage);
  const goToPage = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Pengembalian Buku</h1>
            <p className="text-sm text-gray-500 mt-1">Daftar buku yang sedang dipinjam dan belum dikembalikan</p>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-2 rounded-lg">
            <BookOpen size={16} />
            <span>{filteredTransaksi.length} transaksi dipinjam</span>
          </div>
        </div>

        <div role="tablist" className="tabs tabs-lift tabs-sm mb-6">
          <a role="tab" className={`tab ${activeTab === 'siswa' ? 'tab-active [--tab-bg:#dbeafe] [--tab-color:#1e40af]' : ''}`} onClick={() => setActiveTab('siswa')}>Siswa</a>
          <a role="tab" className={`tab ${activeTab === 'staff' ? 'tab-active [--tab-bg:#dbeafe] [--tab-color:#1e40af]' : ''}`} onClick={() => setActiveTab('staff')}>Staff</a>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tingkat</label>
                <select className="select select-bordered bg-white w-full" value={filterTingkat} onChange={(e) => { setFilterTingkat(e.target.value); setCurrentPage(1); }} disabled={activeTab !== 'siswa'}>
                  <option value="all">Semua Tingkat</option>
                  <option value="X">X</option><option value="XI">XI</option><option value="XII">XII</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jurusan</label>
                <select className="select select-bordered bg-white w-full" value={filterJurusan} onChange={(e) => { setFilterJurusan(e.target.value); setCurrentPage(1); }} disabled={activeTab !== 'siswa'}>
                  <option value="all">Semua Jurusan</option>
                  <option value="RPL">RPL</option><option value="ANIMASI">ANIMASI</option>
                  <option value="TJKT">TJKT</option><option value="TE">TE</option><option value="PSPT">PSPT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
                <select className="select select-bordered bg-white w-full" value={filterKelas} onChange={(e) => { setFilterKelas(e.target.value); setCurrentPage(1); }} disabled={activeTab !== 'siswa'}>
                  <option value="all">Semua Kelas</option>
                  <option value="1">1</option><option value="2">2</option><option value="3">3</option>
                  <option value="4">4</option><option value="5">5</option>
                </select>
              </div>
            </div>
            <div>
              <button className="btn btn-ghost border border-gray-300 hover:bg-gray-50" onClick={handleResetFilter} disabled={activeTab !== 'siswa'}>Reset</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {Pagination({ currentPage, totalPages, itemsPerPage, totalItems: filteredTransaksi.length, searchTerm, onPageChange: goToPage, onItemsPerPageChange: (value) => { setItemsPerPage(value); setCurrentPage(1); }, onSearchChange: setSearchTerm }).TopControls()}

          {loading ? (
            <div className="flex justify-center items-center py-12"><span className="loading loading-spinner loading-lg"></span></div>
          ) : paginatedTransaksi.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-16 text-gray-400 gap-2">
              <BookOpen size={40} className="opacity-40" />
              <p className="text-sm">{hasActiveFilter ? 'Tidak ada data yang ditemukan' : 'Tidak ada data pengembalian'}</p>
              {hasActiveFilter && <button className="btn btn-ghost btn-sm mt-1 text-blue-600" onClick={handleResetFilter}>Reset Filter</button>}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-white border-b-2 border-gray-200">
                      <th className="w-12 font-semibold text-gray-700">No</th>
                      <th className="font-semibold text-gray-700">Peminjam</th>
                      {activeTab === 'siswa' && <th className="font-semibold text-gray-700">Kelas</th>}
                      {activeTab === 'staff' && <th className="font-semibold text-gray-700">Jabatan</th>}
                      <th className="font-semibold text-gray-700">Buku</th>
                      <th className="font-semibold text-gray-700">Deadline</th>
                      <th className="font-semibold text-gray-700">Status</th>
                      <th className="w-24 text-center font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTransaksi.map((t, index) => {
                      const terlambat = isLate(t.tgl_deadline);
                      const selisihHari = terlambat ? hitungSelisihHari(t.tgl_deadline) : 0;
                      const buku = getBukuDisplay(t);
                      const activeDetails = getActiveDetails(t);
                      return (
                        <tr key={t.id} className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-150 ${terlambat ? 'bg-red-50/30' : ''}`}>
                          <td className="text-gray-500">{startIndex + index + 1}</td>
                          <td>
                            <p className="font-medium text-gray-800 text-sm">{getNamaPeminjam(t.user)}</p>
                            <p className="text-xs text-gray-400">{activeTab === 'siswa' ? t.user?.siswa?.nomor_induk_siswa || '-' : t.user?.staff?.nomor_induk_pegawai || '-'}</p>
                          </td>
                          {activeTab === 'siswa' && <td className="text-sm text-gray-600">{t.user?.siswa ? `${t.user.siswa.tingkat} ${t.user.siswa.jurusan} ${t.user.siswa.kelas}` : '-'}</td>}
                          {activeTab === 'staff' && <td className="text-sm text-gray-600">{t.user?.staff?.jabatan || '-'}</td>}
                          <td>
                            <p className="font-medium text-gray-800 text-sm line-clamp-1">{buku.judul}</p>
                            {buku.isbn && <p className="text-xs text-gray-400">{buku.isbn}</p>}
                            {buku.extra && <p className="text-xs text-blue-500">{buku.extra}</p>}
                          </td>
                          <td>
                            <div className={`text-sm ${terlambat ? 'text-red-600 font-medium' : 'text-gray-600'}`}>{formatDate(t.tgl_deadline)}</div>
                          </td>
                          <td>
                            {terlambat ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="badge badge-sm bg-red-100 text-red-700 border-red-200">Terlambat</span>
                                <span className="text-xs text-red-500">{selisihHari} hari</span>
                              </div>
                            ) : (
                              <span className="badge badge-sm bg-yellow-100 text-yellow-700 border-yellow-200">Dipinjam</span>
                            )}
                          </td>
                          <td>
                            <div className="flex gap-1.5 justify-center">
                              <button className="btn btn-ghost btn-xs text-blue-600 hover:bg-blue-50" onClick={() => handleDetailClick(t)} title="Detail">
                                <Eye size={15} />
                              </button>
                              {activeDetails.length === 1 ? (
                                <button
                                  className="btn btn-sm bg-green-600 hover:bg-green-700 text-white border-none gap-1 shadow-sm"
                                  onClick={() => handleTerimaClick(t, activeDetails[0])}
                                  disabled={loadingTerima === activeDetails[0].id}
                                >
                                  {loadingTerima === activeDetails[0].id ? <span className="loading loading-spinner loading-xs"></span> : <CheckCircle size={15} />}
                                  Terima
                                </button>
                              ) : (
                                <button className="btn btn-sm bg-green-600 hover:bg-green-700 text-white border-none gap-1 shadow-sm" onClick={() => handleDetailClick(t)}>
                                  <CheckCircle size={15} /> Terima
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {Pagination({ currentPage, totalPages, itemsPerPage, totalItems: filteredTransaksi.length, searchTerm, onPageChange: goToPage, onItemsPerPageChange: (value) => { setItemsPerPage(value); setCurrentPage(1); }, onSearchChange: setSearchTerm }).BottomControls()}
            </>
          )}
        </div>
      </div>

      {showDetailModal && (
        <DetailPengembalianModal
          isOpen={showDetailModal}
          onClose={() => { setShowDetailModal(false); setSelectedTransaksi(null); }}
          transaksi={selectedTransaksi}
          onTerima={handleTerimaDirectly}
          onTerimaAll={handleTerimaAllDirectly}
          loadingTerima={loadingTerima}
          loadingTerimaAll={loadingTerimaAll}
          isLate={isLate}
          hitungSelisihHari={hitungSelisihHari}
          getNamaPeminjam={getNamaPeminjam}
          formatDate={formatDate}
          activeTab={activeTab}
        />
      )}
      {showConfirmModal && !Array.isArray(selectedDetail) && (
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => { setShowConfirmModal(false); setSelectedTransaksi(null); setSelectedDetail(null); setSelectedStatus('kembali_normal'); }}
          onConfirm={handleTerimaConfirm}
          title="Konfirmasi Pengembalian"
          message={
            selectedDetail && selectedTransaksi ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Proses pengembalian buku:</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{selectedDetail.buku?.judul || '-'}</p>
                  <p className="text-xs text-gray-500">Peminjam: {getNamaPeminjam(selectedTransaksi.user)}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Kondisi Buku</label>
                  <select className="select select-bordered select-sm bg-white w-full" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                    {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                {isLate(selectedTransaksi.tgl_deadline) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-xs text-red-700 space-y-0.5">
                    <p className="font-semibold">⚠️ Terlambat {hitungSelisihHari(selectedTransaksi.tgl_deadline)} hari</p>
                    <p>Denda keterlambatan: {formatRupiah(hitungSelisihHari(selectedTransaksi.tgl_deadline) * 1000)}</p>
                  </div>
                )}
                {selectedStatus !== 'kembali_normal' && (() => {
                  const est = getEstimasiDendaKerusakan(selectedDetail, selectedStatus);
                  if (est === null) return <p className="text-xs text-orange-600">* Denda {getStatusLabel(selectedStatus)} akan dihitung otomatis berdasarkan harga buku</p>;
                  return (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-2.5 text-xs text-orange-700">
                      <p className="font-semibold">Estimasi denda {getStatusLabel(selectedStatus)}: {formatRupiah(est)}</p>
                    </div>
                  );
                })()}
              </div>
            ) : ''
          }
          confirmText="Terima" cancelText="Batal" type="success"
        />
      )}
      {showConfirmModal && Array.isArray(selectedDetail) && (
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => { setShowConfirmModal(false); setSelectedTransaksi(null); setSelectedDetail(null); setStatusPerDetail({}); }}
          onConfirm={handleTerimaAllConfirm}
          title="Konfirmasi Pengembalian Semua"
          message={
            selectedDetail && selectedTransaksi ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Proses pengembalian <span className="font-semibold">{selectedDetail.length} buku</span> dari{' '}
                  <span className="font-semibold">{getNamaPeminjam(selectedTransaksi.user)}</span>
                </p>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {selectedDetail.map((d) => (
                    <div key={d.id} className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-xs font-medium text-gray-800 line-clamp-1 mb-1">{d.buku?.judul || '-'}</p>
                      <select
                        className="select select-bordered select-xs bg-white w-full"
                        value={statusPerDetail[d.id] || 'kembali_normal'}
                        onChange={(e) => setStatusPerDetail(prev => ({ ...prev, [d.id]: e.target.value }))}
                      >
                        {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                {isLate(selectedTransaksi.tgl_deadline) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-xs text-red-700 space-y-0.5">
                    <p className="font-semibold">⚠️ Terlambat {hitungSelisihHari(selectedTransaksi.tgl_deadline)} hari</p>
                    <p>Denda per buku: {formatRupiah(hitungSelisihHari(selectedTransaksi.tgl_deadline) * 1000)}</p>
                    <p className="font-semibold">Total estimasi denda telat: {formatRupiah(hitungSelisihHari(selectedTransaksi.tgl_deadline) * 1000 * selectedDetail.length)}</p>
                  </div>
                )}
              </div>
            ) : ''
          }
          confirmText="Terima Semua" cancelText="Batal" type="success"
        />
      )}
    </AppLayout>
  );
};

export default Pengembalian;