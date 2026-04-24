import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Eye,
  ClipboardList,
  CalendarDays,
  RotateCcw,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import {
  getKelolaTransaksi,
  updateDeadlineTransaksi,
  overrideKembaliNormal,
} from '../../services/operator/kelolaTransaksiService';
import AppLayout from '../../components/AppLayout';
import Pagination from '../../components/common/Pagination';

const STATUS_CONFIG = {
  dipinjam: { label: 'Dipinjam',  bg: 'bg-blue-100',   text: 'text-blue-800'   },
  terlambat:{ label: 'Terlambat', bg: 'bg-orange-100',  text: 'text-orange-800' },
  selesai:  { label: 'Selesai',   bg: 'bg-green-100',   text: 'text-green-800'  },
  ditolak:  { label: 'Ditolak',   bg: 'bg-red-100',     text: 'text-red-800'    },
  menunggu: { label: 'Menunggu',  bg: 'bg-gray-100',    text: 'text-gray-700'   },
};

const STATUS_DENDA_CONFIG = {
  belum_bayar: { label: 'Belum Bayar', bg: 'bg-red-100',   text: 'text-red-800'   },
  lunas:       { label: 'Lunas',       bg: 'bg-green-100', text: 'text-green-800' },
};

const DETAIL_STATUS_CONFIG = {
  dipinjam:      { label: 'Dipinjam',       bg: 'bg-blue-100',   text: 'text-blue-800'   },
  kembali_normal:{ label: 'Kembali Normal', bg: 'bg-green-100',  text: 'text-green-800'  },
  hilang:        { label: 'Hilang',         bg: 'bg-red-100',    text: 'text-red-800'    },
  rusak:         { label: 'Rusak',          bg: 'bg-yellow-100', text: 'text-yellow-800' },
};
const Badge = ({ config, fallbackKey, size = 'sm' }) => {
  const cfg = config || { label: fallbackKey || '-', bg: 'bg-gray-100', text: 'text-gray-700' };
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${padding} ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
};


const KelolaTransaksi = () => {
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('siswa');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [filterTingkat, setFilterTingkat] = useState('all');
  const [filterJurusan, setFilterJurusan] = useState('all');
  const [filterKelas, setFilterKelas] = useState('all');

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);

  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState(null);
  const [newDeadline, setNewDeadline] = useState('');
  const [loadingDeadline, setLoadingDeadline] = useState(false);

  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [loadingOverride, setLoadingOverride] = useState(false);

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm('');
    setFilterTingkat('all');
    setFilterJurusan('all');
    setFilterKelas('all');
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getKelolaTransaksi();
      setTransaksi(data.data || []);
    } catch (error) {
      toast.error(error?.message || 'Gagal memuat data transaksi');
    } finally {
      setLoading(false);
    }
  };


  const getNama = (item) =>
    item.user?.siswa?.nama_lengkap ||
    item.user?.staff?.nama_lengkap ||
    item.user?.name || '-';

  const getNoInduk = (item) => {
    if (item.user?.siswa) return item.user.siswa.nomor_induk_siswa || '-';
    if (item.user?.staff) return item.user.staff.nomor_induk_pegawai || '-';
    return '-';
  };

  const getSubInfo = (item) => {
    if (item.user?.siswa) {
      const s = item.user.siswa;
      return `${s.tingkat || ''} ${s.jurusan || ''} ${s.kelas || ''}`.trim() || '-';
    }
    if (item.user?.staff) return item.user.staff.jabatan || '-';
    return '-';
  };

  const getDetails = (item) => item.details || [];

  const getBukuDisplay = (item) => {
    const list = getDetails(item);
    if (list.length === 0) return { judul: '-', extra: null };
    if (list.length === 1) return { judul: list[0].buku?.judul || '-', extra: null };
    return { judul: list[0].buku?.judul || '-', extra: `+${list.length - 1} buku lainnya` };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  const formatRupiah = (val) => {
    if (!val || val === 0) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(val);
  };

  const hasActiveFilter =
    searchTerm || filterTingkat !== 'all' || filterJurusan !== 'all' || filterKelas !== 'all';

  const handleResetFilter = () => {
    setFilterTingkat('all');
    setFilterJurusan('all');
    setFilterKelas('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleDetailClick = (item) => {
    setSelectedTransaksi(item);
    setShowDetailModal(true);
  };

  const handleDeadlineClick = (item) => {
    setSelectedDeadline(item);
    setNewDeadline(item.tgl_deadline ? item.tgl_deadline.split('T')[0] : '');
    setShowDeadlineModal(true);
  };

  const handleDeadlineConfirm = async () => {
    if (!newDeadline) { toast.error('Tanggal deadline wajib diisi'); return; }
    setLoadingDeadline(true);
    try {
      await updateDeadlineTransaksi(selectedDeadline.id, newDeadline);
      toast.success('Deadline berhasil diupdate');
      setShowDeadlineModal(false);
      setSelectedDeadline(null);
      setNewDeadline('');
      fetchData();
    } catch (error) {
      toast.error(error?.message || 'Gagal mengupdate deadline');
    } finally {
      setLoadingDeadline(false);
    }
  };

  const handleOverrideClick = (detail) => {
    setSelectedDetail(detail);
    setShowOverrideModal(true);
  };

  const handleOverrideConfirm = async () => {
    setLoadingOverride(true);
    try {
      await overrideKembaliNormal(selectedDetail.id);
      toast.success('Berhasil override ke kembali normal');
      setShowOverrideModal(false);
      setSelectedDetail(null);
      setShowDetailModal(false);
      fetchData();
    } catch (error) {
      toast.error(error?.message || 'Gagal melakukan override');
    } finally {
      setLoadingOverride(false);
    }
  };


  const filteredTransaksi = transaksi
    .filter((item) => {
      if (activeTab === 'siswa') return !!item.user?.siswa;
      if (activeTab === 'staff') return !!item.user?.staff;
      return true;
    })
    .filter((item) => {
      const nama = getNama(item).toLowerCase();
      const judulMatch = getDetails(item).some(d =>
        d.buku?.judul?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchSearch = nama.includes(searchTerm.toLowerCase()) || judulMatch;
      if (activeTab !== 'siswa') return matchSearch;
      const matchTingkat = filterTingkat === 'all' || item.user?.siswa?.tingkat === filterTingkat;
      const matchJurusan = filterJurusan === 'all' || item.user?.siswa?.jurusan === filterJurusan;
      const matchKelas   = filterKelas === 'all'   || item.user?.siswa?.kelas?.toString() === filterKelas;
      return matchSearch && matchTingkat && matchJurusan && matchKelas;
    });

  const totalPages   = Math.ceil(filteredTransaksi.length / itemsPerPage);
  const startIndex   = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredTransaksi.slice(startIndex, startIndex + itemsPerPage);
  const goToPage = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };

  const paginationProps = {
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems: filteredTransaksi.length,
    searchTerm,
    onPageChange: goToPage,
    onItemsPerPageChange: (value) => { setItemsPerPage(value); setCurrentPage(1); },
    onSearchChange: setSearchTerm,
  };


  return (
    <AppLayout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Kelola Transaksi</h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola deadline dan status transaksi peminjaman buku
            </p>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-2 rounded-lg">
            <ClipboardList size={16} />
            <span>{transaksi.length} total transaksi</span>
          </div>
        </div>

        {/* Tabs */}
        <div role="tablist" className="tabs tabs-lift tabs-sm mb-6">
          {['siswa', 'staff'].map((tab) => (
            <a
              key={tab}
              role="tab"
              className={`tab capitalize ${activeTab === tab ? 'tab-active [--tab-bg:#dbeafe] [--tab-color:#1e40af]' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </a>
          ))}
        </div>

        {/* Filter Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  label: 'Tingkat', value: filterTingkat,
                  onChange: (v) => { setFilterTingkat(v); setCurrentPage(1); },
                  options: [['all','Semua Tingkat'],['X','X'],['XI','XI'],['XII','XII']],
                },
                {
                  label: 'Jurusan', value: filterJurusan,
                  onChange: (v) => { setFilterJurusan(v); setCurrentPage(1); },
                  options: [['all','Semua Jurusan'],['RPL','RPL'],['ANIMASI','ANIMASI'],['TJKT','TJKT'],['TE','TE'],['PSPT','PSPT']],
                },
                {
                  label: 'Kelas', value: filterKelas,
                  onChange: (v) => { setFilterKelas(v); setCurrentPage(1); },
                  options: [['all','Semua Kelas'],['1','1'],['2','2'],['3','3'],['4','4'],['5','5']],
                },
              ].map(({ label, value, onChange, options }) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                  <select
                    className="select select-bordered bg-white w-full"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={activeTab !== 'siswa'}
                  >
                    {options.map(([val, txt]) => (
                      <option key={val} value={val}>{txt}</option>
                    ))}
                  </select>
                </div>
              ))}
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
          {Pagination(paginationProps).TopControls()}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-16 text-gray-400 gap-2">
              <ClipboardList size={40} className="opacity-40" />
              <p className="text-sm">
                {hasActiveFilter ? 'Tidak ada transaksi yang ditemukan' : 'Belum ada transaksi'}
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
                      <th className="font-semibold text-gray-700">
                        {activeTab === 'siswa' ? 'Kelas' : 'Jabatan'}
                      </th>
                      <th className="font-semibold text-gray-700">Buku</th>
                      <th className="w-32 text-center font-semibold text-gray-700">Status</th>
                      <th className="w-32 text-center font-semibold text-gray-700">Deadline</th>
                      <th className="w-32 text-center font-semibold text-gray-700">Denda</th>
                      <th className="w-28 text-center font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item, index) => {
                      const buku = getBukuDisplay(item);
                      return (
                        <tr
                          key={item.id}
                          className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-150"
                        >
                          <td className="text-gray-500">{startIndex + index + 1}</td>

                          {/* Peminjam */}
                          <td>
                            <p className="font-medium text-gray-800 text-sm">{getNama(item)}</p>
                            <p className="text-xs text-gray-400">{getNoInduk(item)}</p>
                          </td>

                          {/* Kelas / Jabatan */}
                          <td className="text-sm text-gray-600">{getSubInfo(item)}</td>

                          {/* Buku */}
                          <td>
                            <p className="font-medium text-gray-800 text-sm line-clamp-1">{buku.judul}</p>
                            {buku.extra && <p className="text-xs text-blue-500">{buku.extra}</p>}
                          </td>

                          {/* Status transaksi */}
                          <td className="text-center">
                            <Badge config={STATUS_CONFIG[item.status]} fallbackKey={item.status} />
                          </td>

                          {/* Deadline */}
                          <td className="text-center text-sm text-gray-600">
                            {formatDate(item.tgl_deadline)}
                          </td>

                          {/* Denda */}
                          <td className="text-center">
                            {item.status_denda
                              ? <Badge config={STATUS_DENDA_CONFIG[item.status_denda]} fallbackKey={item.status_denda} />
                              : <span className="text-xs text-gray-400">Tidak Memiliki Denda</span>
                            }
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
                                className="btn btn-ghost btn-xs text-orange-600 hover:bg-orange-50"
                                onClick={() => handleDeadlineClick(item)}
                                title="Update Deadline"
                              >
                                <CalendarDays size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {Pagination(paginationProps).BottomControls()}
            </>
          )}
        </div>
      </div>
      {showDetailModal && selectedTransaksi && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-2xl max-h-[85vh] overflow-y-auto">
            <h3 className="font-bold text-base mb-1">Detail Transaksi</h3>
            <p className="text-xs text-gray-400 mb-4">ID: #{selectedTransaksi.id}</p>

            {/* Info peminjam */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Informasi Peminjam</p>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                {[
                  { label: 'Nama',    value: getNama(selectedTransaksi) },
                  { label: 'No. Induk', value: getNoInduk(selectedTransaksi) },
                  {
                    label: selectedTransaksi.user?.siswa ? 'Kelas' : 'Jabatan',
                    value: getSubInfo(selectedTransaksi),
                  },
                  { label: 'Deadline', value: formatDate(selectedTransaksi.tgl_deadline) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <span className="text-gray-500 text-xs block mb-0.5">{label}</span>
                    <p className="font-medium text-gray-800">{value}</p>
                  </div>
                ))}

                {/* Status — uses Badge */}
                <div>
                  <span className="text-gray-500 text-xs block mb-0.5">Status Transaksi</span>
                  <Badge
                    config={STATUS_CONFIG[selectedTransaksi.status]}
                    fallbackKey={selectedTransaksi.status}
                  />
                </div>

                {/* Total denda */}
                <div>
                  <span className="text-gray-500 text-xs block mb-0.5">Total Denda</span>
                  <p className="font-medium text-red-600">{formatRupiah(selectedTransaksi.total_denda)}</p>
                </div>
              </div>
            </div>

            {/* Detail buku */}
            <p className="text-sm font-semibold text-gray-700 mb-2">Detail Buku</p>
            <div className="space-y-3 mb-4">
              {getDetails(selectedTransaksi).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Tidak ada detail buku</p>
              ) : (
                getDetails(selectedTransaksi).map((d, i) => (
                  <div key={d.id || i} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <BookOpen size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="font-medium text-gray-800 text-sm line-clamp-1">
                          {d.buku?.judul || '-'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge
                          config={DETAIL_STATUS_CONFIG[d.status]}
                          fallbackKey={d.status}
                        />
                        {d.status === 'hilang' && (
                          <button
                            className="btn btn-xs btn-warning gap-1"
                            onClick={() => handleOverrideClick(d)}
                            title="Override ke Kembali Normal"
                          >
                            <RotateCcw size={12} />
                            Override
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-500">
                      {[
                        { label: 'Tgl Kembali',    value: formatDate(d.tgl_kembali)       },
                        { label: 'Denda Telat',    value: formatRupiah(d.denda_telat)     },
                        { label: 'Denda Kerusakan',value: formatRupiah(d.denda_kerusakan) },
                        { label: 'Denda Hilang',   value: formatRupiah(d.denda_hilang)    },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <span className="block mb-0.5">{label}</span>
                          <span className="text-gray-700 font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                    {d.total_denda_item > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100 flex justify-end">
                        <span className="text-xs text-red-600 font-semibold">
                          Total: {formatRupiah(d.total_denda_item)}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="modal-action mt-2">
              <button
                className="btn btn-warning btn-sm gap-1"
                onClick={() => { setShowDetailModal(false); handleDeadlineClick(selectedTransaksi); }}
              >
                <CalendarDays size={14} />
                Update Deadline
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setShowDetailModal(false); setSelectedTransaksi(null); }}
              >
                Tutup
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => { setShowDetailModal(false); setSelectedTransaksi(null); }}
          />
        </div>
      )}
      {showDeadlineModal && selectedDeadline && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md">
            <h3 className="font-bold text-base mb-4">Update Deadline</h3>
            <div className="bg-orange-50 rounded-lg p-3 mb-4 space-y-1">
              <p className="text-sm">
                <span className="font-semibold">Peminjam:</span> {getNama(selectedDeadline)}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Deadline saat ini:</span>{' '}
                {formatDate(selectedDeadline.tgl_deadline)}
              </p>
              <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                <AlertCircle size={12} />
                Mengubah deadline akan menghitung ulang denda keterlambatan
              </p>
            </div>
            <div className="form-control w-full mb-2">
              <label className="label pb-1">
                <span className="label-text text-sm font-medium">
                  Deadline Baru <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full text-sm"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
              />
            </div>
            <div className="modal-action mt-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setShowDeadlineModal(false); setSelectedDeadline(null); setNewDeadline(''); }}
                disabled={loadingDeadline}
              >
                Batal
              </button>
              <button
                className="btn btn-warning btn-sm gap-1"
                onClick={handleDeadlineConfirm}
                disabled={loadingDeadline || !newDeadline}
              >
                {loadingDeadline
                  ? <span className="loading loading-spinner loading-xs" />
                  : <CalendarDays size={14} />}
                {loadingDeadline ? 'Memproses...' : 'Update Deadline'}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => { setShowDeadlineModal(false); setSelectedDeadline(null); setNewDeadline(''); }}
          />
        </div>
      )}

      {showOverrideModal && selectedDetail && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md">
            <h3 className="font-bold text-base mb-4">Override ke Kembali Normal</h3>
            <div className="bg-yellow-50 rounded-lg p-3 mb-4 space-y-1">
              <p className="text-sm">
                <span className="font-semibold">Buku:</span> {selectedDetail.buku?.judul || '-'}
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="font-semibold">Status saat ini:</span>
                <Badge config={DETAIL_STATUS_CONFIG.hilang} />
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-xs text-blue-700 space-y-1">
              <p className="font-semibold">Efek override:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Status buku berubah menjadi <strong>Kembali Normal</strong></li>
                <li>Semua denda (telat, kerusakan, hilang) akan dihapus</li>
                <li>Stok buku akan ditambah kembali</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Apakah kamu yakin ingin melakukan override ini?
            </p>
            <div className="modal-action mt-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setShowOverrideModal(false); setSelectedDetail(null); }}
                disabled={loadingOverride}
              >
                Batal
              </button>
              <button
                className="btn btn-warning btn-sm gap-1"
                onClick={handleOverrideConfirm}
                disabled={loadingOverride}
              >
                {loadingOverride
                  ? <span className="loading loading-spinner loading-xs" />
                  : <RotateCcw size={14} />}
                {loadingOverride ? 'Memproses...' : 'Ya, Override'}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => { setShowOverrideModal(false); setSelectedDetail(null); }}
          />
        </div>
      )}
    </AppLayout>
  );
};

export default KelolaTransaksi;