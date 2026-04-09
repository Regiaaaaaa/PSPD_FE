import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  BarChart2,
  ArrowLeftRight,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Calendar,
  TrendingUp,
  BookOpen,
  CheckCircle,
  Clock,
  DollarSign,
  ChevronRight,
} from "lucide-react";
import AppLayout from "../../../components/AppLayout";
import {
  getSummary,
  exportSummaryExcel,
  exportSummaryPdf,
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

export default function LaporanSummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bulan, setBulan] = useState(String(new Date().getMonth() + 1));
  const [tahun, setTahun] = useState(String(currentYear));

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const data = await getSummary({ bulan, tahun });
      setSummary(data);
    } catch (error) {
      toast.error(error.message || "Gagal memuat data summary");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => fetchSummary();
  const handleExportExcel = () => exportSummaryExcel({ bulan, tahun });
  const handleExportPdf = () => exportSummaryPdf({ bulan, tahun });

  const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val || 0);

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span>Laporan</span>
            <ChevronRight size={12} />
            <span className="text-gray-600 font-medium">Summary</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Laporan Summary
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Ringkasan transaksi dan denda perpustakaan per periode
          </p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Bulan
              </label>
              <select
                className="select select-sm select-bordered bg-white w-full text-sm"
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[100px]">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Tahun
              </label>
              <select
                className="select select-sm select-bordered bg-white w-full text-sm"
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="btn btn-sm btn-primary gap-2 px-4 w-full min-[400px]:w-auto"
              onClick={handleFilter}
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
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <span className="loading loading-spinner loading-lg text-blue-500" />
          </div>
        ) : summary ? (
          <>
            {/* Periode */}
            <div className="flex items-center gap-2 mb-4 text-xs sm:text-sm text-gray-500">
              <Calendar size={13} className="flex-shrink-0" />
              <span>
                Periode:{" "}
                <span className="font-medium text-gray-700">
                  {summary.periode?.dari} s/d {summary.periode?.sampai}
                </span>
              </span>
            </div>

            {/* Stat Cards — Transaksi */}
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Transaksi
            </p>
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-4 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs opacity-90">Total Transaksi</p>
                    <p className="text-2xl font-bold mt-1">
                      {summary.transaksi?.total ?? 0}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 opacity-75 flex-shrink-0" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-sm p-4 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs opacity-90">Sedang Dipinjam</p>
                    <p className="text-2xl font-bold mt-1">
                      {summary.transaksi?.dipinjam ?? 0}
                    </p>
                  </div>
                  <BookOpen className="w-8 h-8 opacity-75 flex-shrink-0" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-4 text-white min-[480px]:col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs opacity-90">Sudah Kembali</p>
                    <p className="text-2xl font-bold mt-1">
                      {summary.transaksi?.kembali ?? 0}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 opacity-75 flex-shrink-0" />
                </div>
              </div>
            </div>

            {/* Stat Cards — Denda */}
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Denda
            </p>
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl shadow-sm p-4 text-white min-[480px]:col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs opacity-90">Total Nominal Denda</p>
                    <p className="text-lg sm:text-xl font-bold mt-1 truncate">
                      {formatRupiah(summary.denda?.total_nominal)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 opacity-75 flex-shrink-0" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-4 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs opacity-90">Denda Lunas</p>
                    <p className="text-2xl font-bold mt-1">
                      {summary.denda?.lunas ?? 0}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 opacity-75 flex-shrink-0" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm p-4 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs opacity-90">Belum Lunas</p>
                    <p className="text-2xl font-bold mt-1">
                      {summary.denda?.belum_lunas ?? 0}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 opacity-75 flex-shrink-0" />
                </div>
              </div>
            </div>

            {/* Export */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Export Laporan
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  className="btn btn-sm gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 flex-1 min-[360px]:flex-none"
                  onClick={handleExportExcel}
                >
                  <FileSpreadsheet size={15} />
                  Excel
                </button>
                <button
                  className="btn btn-sm gap-2 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 flex-1 min-[360px]:flex-none"
                  onClick={handleExportPdf}
                >
                  <FileText size={15} />
                  PDF
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 min-[560px]:grid-cols-2 gap-3">
              <Link
                to="/operator/laporan/transaksi"
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3 hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                  <ArrowLeftRight size={17} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-700 truncate">
                    Laporan Transaksi
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    Lihat detail semua transaksi peminjaman
                  </p>
                </div>
                <ChevronRight
                  size={15}
                  className="text-gray-300 group-hover:text-blue-400 transition-colors flex-shrink-0"
                />
              </Link>

              <Link
                to="/operator/laporan/denda"
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3 hover:border-rose-300 hover:bg-rose-50/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0 group-hover:bg-rose-200 transition-colors">
                  <AlertCircle size={17} className="text-rose-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-700 truncate">
                    Laporan Denda
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    Lihat detail semua data denda
                  </p>
                </div>
                <ChevronRight
                  size={15}
                  className="text-gray-300 group-hover:text-rose-400 transition-colors flex-shrink-0"
                />
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <BarChart2 size={40} className="mb-2 opacity-40" />
            <p className="text-sm">Pilih periode dan klik Tampilkan</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}