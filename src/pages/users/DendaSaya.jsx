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

  useEffect(() => { fetchDenda(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus]);

  const fetchDenda = async () => {
    setLoading(true);
    try {
      const data = await getMyDenda();
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
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const hasActiveFilter = searchTerm || filterStatus;

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setCurrentPage(1);
  };


  const allDendaRows = denda.flatMap((t) =>
    (t.details || [])
      .filter((d) => d.denda)
      .map((d) => ({
        ...d,
        tgl_deadline: t.tgl_deadline,
      }))
  );

  const filteredRows = allDendaRows.filter((row) => {
    const matchSearch = !searchTerm ||
      row.buku?.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.buku?.penulis?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus ? row.denda?.status_pembayaran === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const StatusBadge = ({ status }) => {
    if (status === 'lunas') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-xs font-semibold border border-green-200">
          <CheckCircle size={11} /> Lunas
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
        <AlertCircle size={11} /> Belum Lunas
      </span>
    );
  };

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Denda Saya</h1>
          <p className="text-sm text-gray-600 mt-2">Daftar denda keterlambatan pengembalian buku</p>
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
            <button className="btn btn-ghost border border-gray-300 hover:bg-gray-50" onClick={resetFilters}>
              Reset
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {Pagination({
            currentPage, totalPages, itemsPerPage,
            totalItems: filteredRows.length, searchTerm,
            onPageChange: goToPage,
            onItemsPerPageChange: (value) => { setItemsPerPage(value); setCurrentPage(1); },
            onSearchChange: setSearchTerm,
          }).TopControls()}

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <span className="loading loading-spinner loading-md sm:loading-lg"></span>
            </div>
          ) : paginatedRows.length === 0 ? (
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
              {/* Mobile Card View */}
              <div className="block lg:hidden">
                <div className="divide-y divide-gray-100">
                  {paginatedRows.map((row) => {
                    const coverUrl = getCoverUrl(row.buku?.cover);
                    return (
                      <div key={row.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex gap-3">
                          {/* Cover */}
                          <div className="flex-shrink-0">
                            {coverUrl ? (
                              <img
                                src={coverUrl} alt={row.buku?.judul}
                                className="w-14 h-20 object-cover rounded"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-14 h-20 bg-gray-200 rounded flex items-center justify-center">
                                <BookOpen size={16} className="text-gray-400" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-semibold text-sm text-gray-800 leading-tight truncate">
                                {row.buku?.judul || '-'}
                              </h3>
                              <StatusBadge status={row.denda?.status_pembayaran} />
                            </div>
                            <p className="text-xs text-gray-500 mb-2">{row.buku?.penulis || '-'}</p>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-red-700 font-medium">Denda:</span>
                                <span className="text-sm font-bold text-red-600">
                                  {formatRupiah(row.denda?.nominal)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock size={11} />
                                <span>Deadline: {formatDate(row.tgl_deadline)}</span>
                              </div>
                              {row.denda?.tgl_pembayaran && (
                                <div className="flex items-center gap-1 text-xs text-gray-600 mt-0.5">
                                  <Calendar size={11} />
                                  <span>Dibayar: {formatDate(row.denda.tgl_pembayaran)}</span>
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

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-white border-b-2 border-gray-200">
                      <th className="w-12 font-semibold text-gray-700">No</th>
                      <th className="w-16 font-semibold text-gray-700">Cover</th>
                      <th className="font-semibold text-gray-700">Judul Buku</th>
                      <th className="font-semibold text-gray-700">Penulis</th>
                      <th className="w-32 text-center font-semibold text-gray-700">Deadline</th>
                      <th className="w-32 text-center font-semibold text-gray-700">Denda</th>
                      <th className="w-36 text-center font-semibold text-gray-700">Tgl Pembayaran</th>
                      <th className="w-32 text-center font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((row, index) => {
                      const coverUrl = getCoverUrl(row.buku?.cover);
                      return (
                        <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                          <td>{startIndex + index + 1}</td>
                          <td>
                            {coverUrl ? (
                              <img
                                src={coverUrl} alt={row.buku?.judul}
                                className="w-10 h-14 object-cover rounded"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-10 h-14 bg-gray-200 rounded flex items-center justify-center">
                                <BookOpen size={14} className="text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="font-medium text-gray-800">{row.buku?.judul || '-'}</td>
                          <td className="text-gray-600 text-sm">{row.buku?.penulis || '-'}</td>
                          <td className="text-center text-sm text-gray-600">
                            {formatDate(row.tgl_deadline)}
                          </td>
                          <td className="text-center">
                            <span className="font-bold text-red-600">{formatRupiah(row.denda?.nominal)}</span>
                          </td>
                          <td className="text-center text-sm text-gray-600">
                            {row.denda?.tgl_pembayaran ? formatDate(row.denda.tgl_pembayaran) : '-'}
                          </td>
                          <td className="text-center">
                            <StatusBadge status={row.denda?.status_pembayaran} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {Pagination({
                currentPage, totalPages, itemsPerPage,
                totalItems: filteredRows.length, searchTerm,
                onPageChange: goToPage,
                onItemsPerPageChange: (value) => { setItemsPerPage(value); setCurrentPage(1); },
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