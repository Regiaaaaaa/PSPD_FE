import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  AlertCircle,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import AppLayout from "../../../components/AppLayout";
import Pagination from "../../../components/common/Pagination";
import {
  getLaporanDenda,
  exportDendaExcel,
  exportDendaPdf,
} from "../../../services/operator/laporanService";

const MONTHS = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "lunas", label: "Lunas" },
  { value: "belum_lunas", label: "Belum Lunas" },
];

const statusBadge = (status) => {
  if (status === "lunas")
    return <span className="badge badge-success badge-sm">Lunas</span>;
  if (status === "belum_lunas")
    return <span className="badge badge-error badge-sm">Belum Lunas</span>;
  return <span className="badge badge-ghost badge-sm">{status}</span>;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatRupiah = (val) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val || 0);

export default function LaporanDenda() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulan, setBulan] = useState(String(new Date().getMonth() + 1));
  const [tahun, setTahun] = useState(String(currentYear));
  const [statusPembayaran, setStatusPembayaran] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { bulan, tahun };
      if (statusPembayaran) params.status_pembayaran = statusPembayaran;
      const res = await getLaporanDenda(params);
      setData(res.data || []);
    } catch (err) {
      toast.error(err.message || "Gagal memuat laporan denda");
    } finally {
      setLoading(false);
    }
  };

  const filtered = data.filter((item) => {
    const q = searchTerm.toLowerCase();
    const namaUser = item.transaksi_detail?.transaksi?.user?.name?.toLowerCase() ?? "";
    const judulBuku = item.transaksi_detail?.buku?.judul?.toLowerCase() ?? "";
    const status = item.status_pembayaran?.toLowerCase() ?? "";
    return namaUser.includes(q) || judulBuku.includes(q) || status.includes(q);
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleExportExcel = () => {
    const params = { bulan, tahun };
    if (statusPembayaran) params.status_pembayaran = statusPembayaran;
    exportDendaExcel(params);
  };

  const handleExportPdf = () => {
    const params = { bulan, tahun };
    if (statusPembayaran) params.status_pembayaran = statusPembayaran;
    exportDendaPdf(params);
  };

  const totalNominal = filtered.reduce((acc, item) => acc + (item.nominal || 0), 0);

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Link to="/operator/laporan" className="hover:text-blue-600 transition-colors">
              Laporan
            </Link>
            <ChevronRight size={12} />
            <span className="text-gray-600 font-medium">Denda</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Laporan Denda
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Data seluruh denda keterlambatan pengembalian buku per periode
          </p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex gap-3 flex-1 min-w-0">
              <div className="flex-1 min-w-[100px]">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Bulan</label>
                <select
                  className="select select-sm select-bordered bg-white w-full text-sm"
                  value={bulan}
                  onChange={(e) => setBulan(e.target.value)}
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[80px]">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Tahun</label>
                <select
                  className="select select-sm select-bordered bg-white w-full text-sm"
                  value={tahun}
                  onChange={(e) => setTahun(e.target.value)}
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="w-full sm:flex-1 sm:w-auto sm:min-w-[140px]">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Status Pembayaran
              </label>
              <select
                className="select select-sm select-bordered bg-white w-full text-sm"
                value={statusPembayaran}
                onChange={(e) => setStatusPembayaran(e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-sm btn-primary gap-2 w-full sm:w-auto sm:px-5"
              onClick={() => { fetchData(); setCurrentPage(1); }}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <RefreshCw size={14} />
              )}
              Tampilkan
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">Export:</span>
            <button
              className="btn btn-xs gap-1.5 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              onClick={handleExportExcel}
            >
              <FileSpreadsheet size={13} />
              Excel
            </button>
            <button
              className="btn btn-xs gap-1.5 bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
              onClick={handleExportPdf}
            >
              <FileText size={13} />
              PDF
            </button>
          </div>
        </div>

        {/* Total Nominal Banner */}
        {!loading && filtered.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 mb-5 flex items-center justify-between gap-3">
            <span className="text-sm text-rose-600 font-medium">
              Total Nominal Denda (hasil filter)
            </span>
            <span className="text-sm sm:text-base font-bold text-rose-700 flex-shrink-0">
              {formatRupiah(totalNominal)}
            </span>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {Pagination({
            currentPage,
            totalPages,
            itemsPerPage,
            totalItems: filtered.length,
            searchTerm,
            onPageChange: goToPage,
            onItemsPerPageChange: (v) => { setItemsPerPage(v); setCurrentPage(1); },
            onSearchChange: (v) => { setSearchTerm(v); setCurrentPage(1); },
          }).TopControls()}

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <span className="loading loading-spinner loading-lg text-rose-400" />
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <AlertCircle size={36} className="mb-2 opacity-40" />
              <p className="text-sm">Tidak ada data denda</p>
            </div>
          ) : (
            <>
              {/* Mobile Card */}
              <div className="block lg:hidden divide-y divide-gray-100">
                {paginated.map((item, idx) => (
                  <div key={item.id} className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">
                          {item.transaksi_detail?.buku?.judul || "-"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {item.transaksi_detail?.transaksi?.user?.name || "-"}
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-end gap-1">
                        <span className="text-xs text-gray-400">#{startIndex + idx + 1}</span>
                        {statusBadge(item.status_pembayaran)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="bg-rose-50 rounded-lg p-2">
                        <p className="text-[10px] text-gray-400 mb-0.5">Nominal</p>
                        <p className="text-xs font-bold text-rose-600 leading-tight">
                          {formatRupiah(item.nominal)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-[10px] text-gray-400 mb-0.5">Dibayar Pada</p>
                        <p className="text-xs font-medium text-gray-700 leading-tight">
                          {formatDate(item.tgl_pembayaran)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-white border-b-2 border-gray-200">
                      <th className="w-12 font-semibold text-gray-700">No</th>
                      <th className="font-semibold text-gray-700">Peminjam</th>
                      <th className="font-semibold text-gray-700">Judul Buku</th>
                      <th className="font-semibold text-gray-700">Nominal</th>
                      <th className="font-semibold text-gray-700">Dibayar Pada</th>
                      <th className="font-semibold text-gray-700 text-center">Status Pembayaran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((item, idx) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="text-sm text-gray-500">{startIndex + idx + 1}</td>
                        {/* ✅ sesuai relasi BE */}
                        <td className="text-sm font-medium text-gray-700">
                          {item.transaksi_detail?.transaksi?.user?.name || "-"}
                        </td>
                        <td className="text-sm text-gray-700 max-w-xs truncate">
                          {item.transaksi_detail?.buku?.judul || "-"}
                        </td>
                        <td className="text-sm font-semibold text-rose-600">
                          {formatRupiah(item.nominal)}
                        </td>
                        <td className="text-sm text-gray-600">
                          {formatDate(item.tgl_pembayaran)}
                        </td>
                        <td className="text-center">
                          {statusBadge(item.status_pembayaran)}
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
                totalItems: filtered.length,
                searchTerm,
                onPageChange: goToPage,
                onItemsPerPageChange: (v) => { setItemsPerPage(v); setCurrentPage(1); },
                onSearchChange: (v) => { setSearchTerm(v); setCurrentPage(1); },
              }).BottomControls()}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}