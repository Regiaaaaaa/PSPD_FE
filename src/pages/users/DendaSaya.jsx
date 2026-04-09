import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { BookOpen, DollarSign, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getMyDenda } from '../../services/users/dendaService';
import AppLayout from '../../components/AppLayout';
import Pagination from '../../components/common/Pagination';

const DendaSaya = () => {
  const [denda, setDenda] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchDenda();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const fetchDenda = async () => {
    setLoading(true);
    try {
      const data = await getMyDenda();
      console.log('Data denda:', data);
      setDenda(data.data || []);
    } catch (error) {
      toast.error(error.message || 'Gagal memuat denda');
    } finally {
      setLoading(false);
    }
  };

  const getCoverUrl = (coverPath) => {
    if (!coverPath) return null;
    if (coverPath.startsWith('http')) return coverPath;
    return coverPath.startsWith('storage/') ? `/${coverPath}` : `/storage/${coverPath}`;
  };

  const formatRupiah = (amount) => {
    if (!amount) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
  };

  const dendaStatusConfig = {
    belum_lunas: {
      label: 'Belum Lunas',
      badge: 'badge-error',
      icon: <AlertCircle size={12} />,
    },
    lunas: {
      label: 'Lunas',
      badge: 'badge-success',
      icon: <CheckCircle size={12} />,
    },
  };

  const getDendaStatusInfo = (status) => dendaStatusConfig[status] || {
    label: status || 'Unknown',
    badge: 'badge-ghost',
    icon: <Clock size={12} />,
  };

  const hasActiveFilter = searchTerm || filterStatus;

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setCurrentPage(1);
  };

  const filteredDenda = denda.filter((d) => {
    const matchSearch =
      d.buku?.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.buku?.penulis?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus ? d.denda?.status_pembayaran === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredDenda.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDenda = filteredDenda.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              Denda Saya
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Daftar denda keterlambatan pengembalian buku
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status Pembayaran</label>
              <select
                className="select select-bordered w-full bg-white text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="belum_lunas">Belum Lunas</option>
                <option value="lunas">Lunas</option>
              </select>
            </div>
          </div>
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
          {Pagination({
            currentPage,
            totalPages,
            itemsPerPage,
            totalItems: filteredDenda.length,
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
          ) : paginatedDenda.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-16 text-gray-400">
              <DollarSign size={40} className="mb-2 opacity-40" />
              <p className="text-sm">
                {hasActiveFilter ? 'Tidak ada denda yang ditemukan' : 'Anda tidak memiliki denda'}
              </p>
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
                  {paginatedDenda.map((d) => {
                    const coverUrl = getCoverUrl(d.buku?.cover);
                    const dendaStatus = getDendaStatusInfo(d.denda?.status_pembayaran);
                    const jumlahDenda = d.denda?.nominal || 0;

                    return (
                      <div key={d.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0">
                            {coverUrl ? (
                              <img
                                src={coverUrl}
                                alt={d.buku?.judul}
                                className="w-14 h-20 sm:w-16 sm:h-22 object-cover rounded"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-14 h-20 sm:w-16 sm:h-22 bg-gray-200 rounded flex items-center justify-center">
                                <BookOpen size={16} className="text-gray-400" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-semibold text-sm text-gray-800 leading-tight">
                                {d.buku?.judul || '-'}
                              </h3>
                              <span className={`badge ${dendaStatus.badge} badge-xs inline-flex items-center gap-0.5 whitespace-nowrap flex-shrink-0`}>
                                {dendaStatus.icon} {dendaStatus.label}
                              </span>
                            </div>

                            <p className="text-xs text-gray-500 mb-2">{d.buku?.penulis || '-'}</p>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-red-700 font-medium">Jumlah Denda:</span>
                                <span className="text-sm font-bold text-red-600">{formatRupiah(jumlahDenda)}</span>
                              </div>
                              {d.denda?.tgl_pembayaran && (
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <Calendar size={12} />
                                  <span>Dibayar Pada: {formatDate(d.denda.tgl_pembayaran)}</span>
                                </div>
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
                      <th className="w-32 text-center font-semibold text-gray-700">Jumlah Denda</th>
                      <th className="w-36 text-center font-semibold text-gray-700">Tgl Pembayaran</th>
                      <th className="w-32 text-center font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDenda.map((d, index) => {
                      const coverUrl = getCoverUrl(d.buku?.cover);
                      const dendaStatus = getDendaStatusInfo(d.denda?.status_pembayaran);
                      const jumlahDenda = d.denda?.nominal || 0;

                      return (
                        <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                          <td>{startIndex + index + 1}</td>
                          <td>
                            {coverUrl ? (
                              <img
                                src={coverUrl}
                                alt={d.buku?.judul}
                                className="w-12 h-16 object-cover rounded"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                                <BookOpen size={16} className="text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="font-medium text-gray-800">{d.buku?.judul || '-'}</td>
                          <td className="text-gray-600">{d.buku?.penulis || '-'}</td>
                          <td className="text-center">
                            <span className="font-bold text-red-600">{formatRupiah(jumlahDenda)}</span>
                          </td>
                          <td className="text-center text-sm text-gray-600">
                            {d.denda?.tgl_pembayaran ? formatDate(d.denda.tgl_pembayaran) : '-'}
                          </td>
                          <td className="text-center">
                            <span className={`badge ${dendaStatus.badge} badge-sm inline-flex items-center gap-1 whitespace-nowrap`}>
                              {dendaStatus.icon} {dendaStatus.label}
                            </span>
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
                totalItems: filteredDenda.length,
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
      </div>
    </AppLayout>
  );
};

export default DendaSaya;