import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeftRight,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import AppLayout from "../../../components/AppLayout";
import Pagination from "../../../components/common/Pagination";
import {
  getLaporanTransaksi,
  exportTransaksiExcel,
  exportTransaksiPdf,
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
  { value: "dipinjam", label: "Dipinjam" },
  { value: "kembali", label: "Kembali" },
];

const statusBadge = (status) => {
  switch (status) {
    case "dipinjam":
      return <span className="badge badge-warning badge-sm">Dipinjam</span>;
    case "kembali":
      return <span className="badge badge-success badge-sm">Kembali</span>;
    default:
      return <span className="badge badge-ghost badge-sm">{status || "-"}</span>;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getBukuJudul = (buku = []) => {
  if (!buku || buku.length === 0) return "-";
  return buku.map((b) => b.judul).join(", ");
};

export default function LaporanTransaksi() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulan, setBulan] = useState(String(new Date().getMonth() + 1));
  const [tahun, setTahun] = useState(String(currentYear));
  const [status, setStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchData(bulan, tahun, status);
  }, []);

  const fetchData = async (b = bulan, t = tahun, s = status) => {
    setLoading(true);
    try {
      const params = { bulan: b, tahun: t };
      if (s) params.status = s;
      const res = await getLaporanTransaksi(params);
      const valid = (res.data || []).filter(
        (item) => item.status === "dipinjam" || item.status === "kembali"
      );
      setData(valid);
    } catch (err) {
      toast.error(err.message || "Gagal memuat laporan transaksi");
    } finally {
      setLoading(false);
    }
  };

  const handleTampilkan = () => {
    setCurrentPage(1);
    fetchData(bulan, tahun, status);
  };

  const filtered = data.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.nama_user?.toLowerCase().includes(q) ||
      getBukuJudul(item.buku).toLowerCase().includes(q) ||
      item.status?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleExportExcel = () => {
    const params = { bulan, tahun };
    if (status) params.status = status;
    exportTransaksiExcel(params);
  };

  const handleExportPdf = () => {
    const params = { bulan, tahun };
    if (status) params.status = status;
    exportTransaksiPdf(params);
  };

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Link
              to="/operator/laporan"
              className="hover:text-blue-600 transition-colors"
            >
              Laporan
            </Link>
            <ChevronRight size={12} />
            <span className="text-gray-600 font-medium">Transaksi</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Laporan Transaksi
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Data seluruh transaksi peminjaman buku per periode
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

            <div className="w-full sm:flex-1 sm:w-auto sm:min-w-[130px]">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
              <select
                className="select select-sm select-bordered bg-white w-full text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-sm btn-primary gap-2 w-full sm:w-auto sm:px-5"
              onClick={handleTampilkan}
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
              <span className="loading loading-spinner loading-lg text-blue-500" />
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <ArrowLeftRight size={36} className="mb-2 opacity-40" />
              <p className="text-sm">Tidak ada data transaksi</p>
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
                          {getBukuJudul(item.buku)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {item.nama_user || "-"}
                        </p>
                        {item.total_buku > 1 && (
                          <p className="text-[10px] text-blue-500 mt-0.5">
                            {item.total_buku} buku
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-end gap-1">
                        <span className="text-xs text-gray-400">#{startIndex + idx + 1}</span>
                        {statusBadge(item.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-[10px] text-gray-400 mb-0.5">Tgl Pinjam</p>
                        <p className="text-xs font-medium text-gray-700 leading-tight">
                          {formatDate(item.tgl_pinjam)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-[10px] text-gray-400 mb-0.5">Deadline</p>
                        <p className="text-xs font-medium text-gray-700 leading-tight">
                          {formatDate(item.tgl_deadline)}
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
                      <th className="font-semibold text-gray-700">Total Buku</th>
                      <th className="font-semibold text-gray-700">Tgl Pinjam</th>
                      <th className="font-semibold text-gray-700">Deadline</th>
                      <th className="font-semibold text-gray-700 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((item, idx) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="text-sm text-gray-500">{startIndex + idx + 1}</td>
                        <td className="text-sm font-medium text-gray-700">
                          {item.nama_user || "-"}
                        </td>
                        <td className="text-sm text-gray-700 max-w-xs truncate">
                          {getBukuJudul(item.buku)}
                        </td>
                        <td className="text-sm text-gray-600 text-center">
                          {item.total_buku ?? "-"}
                        </td>
                        <td className="text-sm text-gray-600">{formatDate(item.tgl_pinjam)}</td>
                        <td className="text-sm text-gray-600">{formatDate(item.tgl_deadline)}</td>
                        <td className="text-center">{statusBadge(item.status)}</td>
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