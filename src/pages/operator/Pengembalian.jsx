import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, BookOpen, Eye } from 'lucide-react';
import { getPengembalian, terimaPengembalian } from '../../services/operator/pengembalianService';
import AppLayout from '../../components/AppLayout';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';
import DetailPengembalianModal from './components/DetailPengembalianModal';

const Pengembalian = () => {
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTerima, setLoadingTerima] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [activeTab, setActiveTab] = useState('siswa');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTingkat, setFilterTingkat] = useState('all');
  const [filterJurusan, setFilterJurusan] = useState('all');
  const [filterKelas, setFilterKelas] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => { fetchPengembalian(); }, []);

  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm('');
    setFilterTingkat('all');
    setFilterJurusan('all');
    setFilterKelas('all');
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

  const handleDetailClick = (t) => {
    setSelectedTransaksi(t);
    setShowDetailModal(true);
  };

  const handleTerimaClick = (t) => {
    setSelectedTransaksi(t);
    setShowDetailModal(false);
    setShowConfirmModal(true);
  };

  const handleTerimaConfirm = async () => {
    setShowConfirmModal(false);
    setLoadingTerima(selectedTransaksi.id);
    try {
      const res = await terimaPengembalian(selectedTransaksi.id);
      toast.success(res.message || 'Pengembalian berhasil diterima');
      fetchPengembalian();
    } catch (error) {
      toast.error(error?.message || 'Gagal menerima pengembalian');
    } finally {
      setLoadingTerima(null);
      setSelectedTransaksi(null);
    }
  };

  const isLate = (tgl_deadline) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(tgl_deadline);
    deadline.setHours(0, 0, 0, 0);
    return today > deadline;
  };

  const hitungSelisihHari = (tgl_deadline) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(tgl_deadline);
    deadline.setHours(0, 0, 0, 0);
    return Math.ceil((today - deadline) / (1000 * 60 * 60 * 24));
  };

  const getNamaPeminjam = (user) => {
    if (!user) return '-';
    return user.siswa?.nama || user.staff?.nama || user.name || '-';
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const filteredTransaksi = transaksi
    .filter((t) => {
      if (activeTab === 'siswa') return !!t.user?.siswa;
      if (activeTab === 'staff') return !!t.user?.staff;
      return true;
    })
    .filter((t) => {
      const nama = getNamaPeminjam(t.user).toLowerCase();
      const judul = t.buku?.judul?.toLowerCase() || '';
      const matchSearch = nama.includes(searchTerm.toLowerCase()) || judul.includes(searchTerm.toLowerCase());
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

  const handleResetFilter = () => {
    setFilterTingkat('all'); setFilterJurusan('all');
    setFilterKelas('all'); setSearchTerm(''); setCurrentPage(1);
  };

  const hasActiveFilter = searchTerm || filterTingkat !== 'all' || filterJurusan !== 'all' || filterKelas !== 'all';

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Pengembalian Buku</h1>
            <p className="text-sm text-gray-500 mt-1">Daftar buku yang sedang dipinjam dan belum dikembalikan</p>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-2 rounded-lg">
            <BookOpen size={16} />
            <span>{filteredTransaksi.length} buku dipinjam</span>
          </div>
        </div>

        {/* Tabs */}
        <div role="tablist" className="tabs tabs-lift tabs-sm mb-6">
          <a role="tab" className={`tab ${activeTab === 'siswa' ? 'tab-active [--tab-bg:#dbeafe] [--tab-color:#1e40af]' : ''}`} onClick={() => setActiveTab('siswa')}>Siswa</a>
          <a role="tab" className={`tab ${activeTab === 'staff' ? 'tab-active [--tab-bg:#dbeafe] [--tab-color:#1e40af]' : ''}`} onClick={() => setActiveTab('staff')}>Staff</a>
        </div>

        {/* Filter Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tingkat</label>
                <select className="select select-bordered bg-white w-full" value={filterTingkat} onChange={(e) => { setFilterTingkat(e.target.value); setCurrentPage(1); }} disabled={activeTab !== 'siswa'}>
                  <option value="all">Semua Tingkat</option>
                  <option value="X">X</option>
                  <option value="XI">XI</option>
                  <option value="XII">XII</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jurusan</label>
                <select className="select select-bordered bg-white w-full" value={filterJurusan} onChange={(e) => { setFilterJurusan(e.target.value); setCurrentPage(1); }} disabled={activeTab !== 'siswa'}>
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
                <select className="select select-bordered bg-white w-full" value={filterKelas} onChange={(e) => { setFilterKelas(e.target.value); setCurrentPage(1); }} disabled={activeTab !== 'siswa'}>
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
              <button className="btn btn-ghost border border-gray-300 hover:bg-gray-50" onClick={handleResetFilter} disabled={activeTab !== 'siswa'}>Reset</button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {Pagination({ currentPage, totalPages, itemsPerPage, totalItems: filteredTransaksi.length, searchTerm, onPageChange: goToPage, onItemsPerPageChange: (value) => { setItemsPerPage(value); setCurrentPage(1); }, onSearchChange: setSearchTerm }).TopControls()}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : paginatedTransaksi.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-16 text-gray-400 gap-2">
            <BookOpen size={40} className="opacity-40" />
            <p className="text-sm">
              {hasActiveFilter ? 'Tidak ada data yang ditemukan' : 'Tidak ada data pengembalian'}
            </p>
            {hasActiveFilter && (
              <button className="btn btn-ghost btn-sm mt-1 text-blue-600" onClick={handleResetFilter}>
                Reset Filter
              </button>
            )}
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
                      <th className="w-36 text-center font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTransaksi.map((t, index) => {
                      const terlambat = isLate(t.tgl_deadline);
                      const selisihHari = terlambat ? hitungSelisihHari(t.tgl_deadline) : 0;
                      return (
                        <tr key={t.id} className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-150 ${terlambat ? 'bg-red-50/30' : ''}`}>
                          <td className="text-gray-500">{startIndex + index + 1}</td>

                          {/* Peminjam */}
                          <td>
                            <p className="font-medium text-gray-800 text-sm">{getNamaPeminjam(t.user)}</p>
                            <p className="text-xs text-gray-400">
                              {activeTab === 'siswa' ? t.user?.siswa?.nomor_induk_siswa || '-' : t.user?.staff?.nomor_induk_pegawai || '-'}
                            </p>
                          </td>

                          {/* Kolom dinamis */}
                          {activeTab === 'siswa' && (
                            <td className="text-sm text-gray-600">
                              {t.user?.siswa ? `${t.user.siswa.tingkat} ${t.user.siswa.jurusan} ${t.user.siswa.kelas}` : '-'}
                            </td>
                          )}
                          {activeTab === 'staff' && (
                            <td className="text-sm text-gray-600">{t.user?.staff?.jabatan || '-'}</td>
                          )}

                          {/* Buku */}
                          <td>
                            <p className="font-medium text-gray-800 text-sm line-clamp-1">{t.buku?.judul || '-'}</p>
                            <p className="text-xs text-gray-400">{t.buku?.isbn || ''}</p>
                          </td>

                          {/* Deadline */}
                          <td>
                            <div className={`flex items-center gap-1 text-sm ${terlambat ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                              {formatDate(t.tgl_deadline)}
                            </div>
                          </td>

                          {/* Status */}
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

                          {/* Aksi */}
                          <td>
                            <div className="flex gap-2 justify-center">
                              <button
                                className="btn btn-ghost btn-xs text-blue-600 hover:bg-blue-50"
                                onClick={() => handleDetailClick(t)}
                                title="Detail"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                className="btn btn-sm bg-green-600 hover:bg-green-700 text-white border-none gap-1 shadow-sm"
                                onClick={() => handleTerimaClick(t)}
                                disabled={loadingTerima === t.id}
                              >
                                {loadingTerima === t.id ? (
                                  <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                  <CheckCircle size={15} />
                                )}
                                Terima
                              </button>
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

      {/* Detail Modal */}
      {showDetailModal && (
        <DetailPengembalianModal
          isOpen={showDetailModal}
          onClose={() => { setShowDetailModal(false); setSelectedTransaksi(null); }}
          transaksi={selectedTransaksi}
          onTerima={handleTerimaClick}
          loadingTerima={loadingTerima}
          isLate={isLate}
          hitungSelisihHari={hitungSelisihHari}
          getNamaPeminjam={getNamaPeminjam}
          formatDate={formatDate}
          activeTab={activeTab}
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => { setShowConfirmModal(false); setSelectedTransaksi(null); }}
        onConfirm={handleTerimaConfirm}
        title="Konfirmasi Pengembalian"
        message={
          selectedTransaksi ? (
            <div className="space-y-1">
              <p>Terima pengembalian buku berikut?</p>
              <p className="font-semibold text-gray-800">{selectedTransaksi.buku?.judul}</p>
              <p className="text-sm text-gray-500">Peminjam: {getNamaPeminjam(selectedTransaksi.user)}</p>
              {isLate(selectedTransaksi.tgl_deadline) && (
                <p className="text-sm text-red-600 font-medium mt-2">
                  ⚠️ Terlambat {hitungSelisihHari(selectedTransaksi.tgl_deadline)} hari · Denda Rp{' '}
                  {(hitungSelisihHari(selectedTransaksi.tgl_deadline) * 1000).toLocaleString('id-ID')}
                </p>
              )}
            </div>
          ) : ''
        }
        confirmText="Terima"
        cancelText="Batal"
        type="success"
      />
    </AppLayout>
  );
};

export default Pengembalian;