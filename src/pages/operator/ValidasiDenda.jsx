import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Receipt, CheckCircle, Clock, BadgeCheck, Eye } from 'lucide-react';
import { getDenda, bayarDenda } from '../../services/operator/dendaService';
import AppLayout from '../../components/AppLayout';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';

const ValidasiDenda = () => {
  const [dendaList, setDendaList] = useState([]);
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
  const [selectedDenda, setSelectedDenda] = useState(null);

  // Modal bayar
  const [showBayarModal, setShowBayarModal] = useState(false);
  const [selectedBayar, setSelectedBayar] = useState(null);
  const [loadingBayar, setLoadingBayar] = useState(false);

  useEffect(() => { fetchDenda(); }, []);

  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm('');
    setFilterTingkat('all');
    setFilterJurusan('all');
    setFilterKelas('all');
  }, [activeTab]);

  const fetchDenda = async () => {
    setLoading(true);
    try {
      const data = await getDenda();
      setDendaList(data.data?.data || data.data || []);
    } catch (error) {
      toast.error(error?.message || 'Gagal memuat data denda');
    } finally {
      setLoading(false);
    }
  };

  // Handler
  const handleDetailClick = (item) => {
    setSelectedDenda(item);
    setShowDetailModal(true);
  };

  const handleBayarClick = (item) => {
    setSelectedDenda(null);
    setShowDetailModal(false);
    setSelectedBayar(item);
    setShowBayarModal(true);
  };

  const handleBayarConfirm = async () => {
    setLoadingBayar(true);
    try {
      await bayarDenda(selectedBayar.id);
      toast.success('Denda berhasil ditandai lunas');
      setShowBayarModal(false);
      setSelectedBayar(null);
      fetchDenda();
    } catch (error) {
      toast.error(error?.message || 'Gagal memproses pembayaran denda');
    } finally {
      setLoadingBayar(false);
    }
  };

  const handleResetFilter = () => {
    setFilterTingkat('all');
    setFilterJurusan('all');
    setFilterKelas('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const hasActiveFilter = searchTerm || filterTingkat !== 'all' || filterJurusan !== 'all' || filterKelas !== 'all';

  // Helpers
  const getNama = (item) => {
    return item.transaksi?.user?.siswa?.nama_lengkap
      || item.transaksi?.user?.staff?.nama_lengkap
      || item.transaksi?.user?.name
      || '-';
  };

  const getSubInfo = (item) => {
    const siswa = item.transaksi?.user?.siswa;
    const staff = item.transaksi?.user?.staff;
    if (siswa) {
      if (siswa.tingkat && siswa.jurusan) return `${siswa.tingkat} ${siswa.jurusan} ${siswa.kelas || ''}`.trim();
      return siswa.kelas || '-';
    }
    if (staff) return staff.jabatan || '-';
    return '-';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  const formatRupiah = (amount) => {
    if (!amount && amount !== 0) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredDenda = dendaList
    .filter((item) => item.status_pembayaran !== 'lunas') 
    .filter((item) => {
      if (activeTab === 'siswa') return !!item.transaksi?.user?.siswa;
      if (activeTab === 'staff') return !!item.transaksi?.user?.staff;
      return true;
    })
    .filter((item) => {
      const nama = getNama(item).toLowerCase();
      const judul = item.transaksi?.buku?.judul?.toLowerCase() || '';
      const matchSearch = nama.includes(searchTerm.toLowerCase()) || judul.includes(searchTerm.toLowerCase());

      if (activeTab !== 'siswa') return matchSearch;

      const siswa = item.transaksi?.user?.siswa;
      const matchTingkat = filterTingkat === 'all' || siswa?.tingkat === filterTingkat;
      const matchJurusan = filterJurusan === 'all' || siswa?.jurusan === filterJurusan;
      const matchKelas = filterKelas === 'all' || siswa?.kelas?.toString() === filterKelas;

      return matchSearch && matchTingkat && matchJurusan && matchKelas;
    });

  // Stats
  const totalBelumLunas = dendaList.filter((d) => d.status_pembayaran !== 'lunas').length;

  // Pagination
  const totalPages = Math.ceil(filteredDenda.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredDenda.slice(startIndex, startIndex + itemsPerPage);
  const goToPage = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Validasi Denda</h1>
            <p className="text-sm text-gray-500 mt-1">Daftar denda yang belum dibayar &amp; perlu divalidasi</p>
          </div>
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
            <Clock size={16} />
            <span>{totalBelumLunas} denda belum lunas</span>
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

              {/* Tingkat - hanya aktif tab siswa */}
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

              {/* Jurusan */}
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

              {/* Kelas */}
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
            totalItems: filteredDenda.length,
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
            <Receipt size={40} className="opacity-40" />
            <p className="text-sm">
              {hasActiveFilter ? 'Tidak ada denda yang ditemukan' : 'Tidak ada denda yang perlu divalidasi'}
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
                      <th className="w-32 text-right font-semibold text-gray-700">Total Denda</th>
                      <th className="w-32 text-center font-semibold text-gray-700">Tgl Denda</th>
                      <th className="w-28 text-center font-semibold text-gray-700">Aksi</th>
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
                              ? item.transaksi?.user?.siswa?.nomor_induk_siswa || '-'
                              : item.transaksi?.user?.staff?.nomor_induk_pegawai || '-'}
                          </p>
                        </td>

                        {/* Kelas/jabatan */}
                        {activeTab === 'siswa' && (
                          <td className="text-sm text-gray-600">{getSubInfo(item)}</td>
                        )}
                        {activeTab === 'staff' && (
                          <td className="text-sm text-gray-600">{item.transaksi?.user?.staff?.jabatan || '-'}</td>
                        )}

                        {/* Buku */}
                        <td>
                          <p className="font-medium text-gray-800 text-sm line-clamp-1">
                            {item.transaksi?.buku?.judul || '-'}
                          </p>
                          <p className="text-xs text-gray-400">{item.transaksi?.buku?.isbn || ''}</p>
                        </td>

                        {/* Total Denda */}
                        <td className="text-right text-sm font-semibold text-red-600">
                          {formatRupiah(item.nominal)}
                        </td>

                        {/* Tgl Denda */}
                        <td className="text-center text-sm text-gray-600">
                          {formatDate(item.created_at)}
                        </td>

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
                              onClick={() => handleBayarClick(item)}
                              title="Tandai Lunas"
                            >
                              <CheckCircle size={15} />
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
                totalItems: filteredDenda.length,
                searchTerm,
                onPageChange: goToPage,
                onItemsPerPageChange: (value) => { setItemsPerPage(value); setCurrentPage(1); },
                onSearchChange: setSearchTerm,
              }).BottomControls()}
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDenda && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md">
            <h3 className="font-bold text-base mb-4 flex items-center gap-2">
              <Receipt size={18} className="text-blue-600" />
              Detail Denda
            </h3>

            <div className="space-y-3 text-sm">
              {/* Info Peminjam */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-2">Info Peminjam</p>
                <p><span className="text-gray-500 w-28 inline-block">Nama</span>
                  <span className="font-medium text-gray-800">{getNama(selectedDenda)}</span>
                </p>
                <p><span className="text-gray-500 w-28 inline-block">
                  {activeTab === 'siswa' ? 'NIS' : 'NIP'}
                </span>
                  <span className="font-medium text-gray-800">
                    {activeTab === 'siswa'
                      ? selectedDenda.transaksi?.user?.siswa?.nomor_induk_siswa || '-'
                      : selectedDenda.transaksi?.user?.staff?.nomor_induk_pegawai || '-'}
                  </span>
                </p>
                <p><span className="text-gray-500 w-28 inline-block">
                  {activeTab === 'siswa' ? 'Kelas' : 'Jabatan'}
                </span>
                  <span className="font-medium text-gray-800">{getSubInfo(selectedDenda)}</span>
                </p>
              </div>

              {/* Info Buku */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-2">Info Buku</p>
                <p><span className="text-gray-500 w-28 inline-block">Judul</span>
                  <span className="font-medium text-gray-800">{selectedDenda.transaksi?.buku?.judul || '-'}</span>
                </p>
                <p><span className="text-gray-500 w-28 inline-block">ISBN</span>
                  <span className="font-medium text-gray-800">{selectedDenda.transaksi?.buku?.isbn || '-'}</span>
                </p>
              </div>

              {/* Info Denda */}
              <div className="bg-red-50 rounded-lg p-3 space-y-1.5">
                <p className="font-semibold text-red-700 text-xs uppercase tracking-wide mb-2">Info Denda</p>
                <p><span className="text-gray-500 w-28 inline-block">Total Denda</span>
                  <span className="font-bold text-red-600 text-base">{formatRupiah(selectedDenda.nominal)}</span>
                </p>
                <p><span className="text-gray-500 w-28 inline-block">Tgl Denda</span>
                  <span className="font-medium text-gray-800">{formatDate(selectedDenda.created_at)}</span>
                </p>
              </div>
            </div>

            <div className="modal-action mt-4">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setShowDetailModal(false); setSelectedDenda(null); }}
              >
                Tutup
              </button>
              <button
                className="btn btn-success btn-sm text-white"
                onClick={() => handleBayarClick(selectedDenda)}
              >
                <CheckCircle size={14} />
                Tandai Lunas
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => { setShowDetailModal(false); setSelectedDenda(null); }}
          />
        </div>
      )}

      {/* Modal Konfirmasi Bayar */}
      <ConfirmModal
        isOpen={showBayarModal}
        onClose={() => { setShowBayarModal(false); setSelectedBayar(null); }}
        onConfirm={handleBayarConfirm}
        title="Konfirmasi Pembayaran Denda"
        type="success"
        confirmText={loadingBayar ? 'Memproses...' : 'Ya, Sudah Bayar'}
        cancelText="Batal"
        message={
          selectedBayar && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Apakah kamu yakin ingin menandai denda berikut sebagai <strong>lunas</strong>?
              </p>
              <div className="bg-green-50 rounded-lg p-3 space-y-1">
                <p className="text-sm"><span className="font-semibold">Peminjam:</span> {getNama(selectedBayar)}</p>
                <p className="text-sm">
                  <span className="font-semibold">{activeTab === 'siswa' ? 'Kelas' : 'Jabatan'}:</span>{' '}
                  {getSubInfo(selectedBayar)}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Buku:</span>{' '}
                  {selectedBayar.transaksi?.buku?.judul || '-'}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Total Denda:</span>{' '}
                  <span className="text-red-600 font-bold">{formatRupiah(selectedBayar.nominal)}</span>
                </p>
              </div>
            </div>
          )
        }
      />
    </AppLayout>
  );
};

export default ValidasiDenda;