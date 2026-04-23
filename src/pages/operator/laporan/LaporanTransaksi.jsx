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

const detailStatusBadge = (status) => {
  switch (status) {
    case "dipinjam":
      return <span className="badge badge-outline badge-warning badge-xs">dipinjam</span>;
    case "kembali":
      return <span className="badge badge-outline badge-success badge-xs">kembali</span>;
    default:
      return <span className="badge badge-ghost badge-xs">{status || "-"}</span>;
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

const groupByTransaksi = (rows) => {
  const groups = [];
  rows.forEach((row) => {
    if (row.rowspan > 0) {
      groups.push({
        id: row.id,
        nama_user: row.nama_user,
        status_transaksi: row.status_transaksi,
        tgl_pinjam: row.tgl_pinjam,
        tgl_deadline: row.tgl_deadline,
        buku: [],
      });
    }
    if (groups.length > 0) {
      groups[groups.length - 1].buku.push({
        judul_buku: row.judul_buku,
        status_detail: row.status_detail,
        tgl_kembali: row.tgl_kembali,
      });
    }
  });
  return groups;
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
      setData(res.data || []);
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
  const groupedAll = groupByTransaksi(data).filter((group) => {
    const q = searchTerm.toLowerCase();
    if (!q) return true;
    return (
      group.nama_user?.toLowerCase().includes(q) ||
      group.status_transaksi?.toLowerCase().includes(q) ||
      group.buku.some((b) => b.judul_buku?.toLowerCase().includes(q))
    );
  });
  const totalPages = Math.ceil(groupedAll.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGroups = groupedAll.slice(startIndex, startIndex + itemsPerPage);
  const paginatedRows = paginatedGroups.flatMap((g) =>
    g.buku.map((b, i) => ({
      id: g.id,
      nama_user: g.nama_user,
      status_transaksi: i === 0 ? g.status_transaksi : null,
      rowspan: i === 0 ? g.buku.length : 0,
      tgl_pinjam: g.tgl_pinjam,
      tgl_deadline: g.tgl_deadline,
      judul_buku: b.judul_buku,
      status_detail: b.status_detail,
      tgl_kembali: b.tgl_kembali,
    }))
  );

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
            totalItems: groupedAll.length,
            searchTerm,
            onPageChange: goToPage,
            onItemsPerPageChange: (v) => { setItemsPerPage(v); setCurrentPage(1); },
            onSearchChange: (v) => { setSearchTerm(v); setCurrentPage(1); },
          }).TopControls()}

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <span className="loading loading-spinner loading-lg text-blue-500" />
            </div>
          ) : paginatedGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <ArrowLeftRight size={36} className="mb-2 opacity-40" />
              <p className="text-sm">Tidak ada data transaksi</p>
            </div>
          ) : (
            <>
              {/* Mobile Card — dikelompokkan per transaksi */}
              <div className="block lg:hidden divide-y divide-gray-100">
                {paginatedGroups.map((group, idx) => (
                  <div key={`${group.id}-${idx}`} className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">
                          {group.nama_user || "-"}
                        </p>
                        {group.buku.length > 1 && (
                          <p className="text-[10px] text-blue-500 mt-0.5">
                            {group.buku.length} buku
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-end gap-1">
                        <span className="text-xs text-gray-400">#{startIndex + idx + 1}</span>
                        {statusBadge(group.status_transaksi)}
                      </div>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      {group.buku.map((b, bi) => (
                        <div key={bi} className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-3 py-2">
                          <p className="text-xs text-gray-700 truncate">{b.judul_buku}</p>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {b.tgl_kembali && (
                              <span className="text-[10px] text-gray-400">{formatDate(b.tgl_kembali)}</span>
                            )}
                            {detailStatusBadge(b.status_detail)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-[10px] text-gray-400 mb-0.5">Tgl Pinjam</p>
                        <p className="text-xs font-medium text-gray-700 leading-tight">
                          {formatDate(group.tgl_pinjam)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-[10px] text-gray-400 mb-0.5">Deadline</p>
                        <p className="text-xs font-medium text-gray-700 leading-tight">
                          {formatDate(group.tgl_deadline)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden lg:block overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-white border-b-2 border-gray-200">
                      <th className="w-12 font-semibold text-gray-700">No</th>
                      <th className="font-semibold text-gray-700">Peminjam</th>
                      <th className="font-semibold text-gray-700">Judul Buku</th>
                      <th className="font-semibold text-gray-700">Status Buku</th>
                      <th className="font-semibold text-gray-700">Tgl Pinjam</th>
                      <th className="font-semibold text-gray-700">Deadline</th>
                      <th className="font-semibold text-gray-700">Tgl Kembali</th>
                      <th className="font-semibold text-gray-700 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      let trxCounter = 0;
                      return paginatedRows.map((row, idx) => {
                        const isFirstRow = row.rowspan > 0;
                        if (isFirstRow) trxCounter++;
                        const trxNo = startIndex + trxCounter;

                        return (
                          <tr
                            key={`${row.id}-${idx}`}
                            className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                          >
                            {isFirstRow && (
                              <td
                                rowSpan={row.rowspan}
                                className="text-sm text-gray-500 align-middle"
                              >
                                {trxNo}
                              </td>
                            )}
                            {isFirstRow && (
                              <td
                                rowSpan={row.rowspan}
                                className="text-sm font-medium text-gray-700 align-middle"
                              >
                                {row.nama_user || "-"}
                              </td>
                            )}

                            {/* Kolom per buku */}
                            <td className="text-sm text-gray-700 max-w-[200px] truncate">
                              {row.judul_buku || "-"}
                            </td>
                            <td className="text-sm">
                              {detailStatusBadge(row.status_detail)}
                            </td>

                            {isFirstRow && (
                              <td
                                rowSpan={row.rowspan}
                                className="text-sm text-gray-600 align-middle"
                              >
                                {formatDate(row.tgl_pinjam)}
                              </td>
                            )}
                            {isFirstRow && (
                              <td
                                rowSpan={row.rowspan}
                                className="text-sm text-gray-600 align-middle"
                              >
                                {formatDate(row.tgl_deadline)}
                              </td>
                            )}
                            <td className="text-sm text-gray-600">
                              {formatDate(row.tgl_kembali)}
                            </td>

                            {isFirstRow && (
                              <td
                                rowSpan={row.rowspan}
                                className="text-center align-middle"
                              >
                                {statusBadge(row.status_transaksi)}
                              </td>
                            )}
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>

              {Pagination({
                currentPage,
                totalPages,
                itemsPerPage,
                totalItems: groupedAll.length,
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