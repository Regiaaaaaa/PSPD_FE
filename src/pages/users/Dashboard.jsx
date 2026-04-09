import { useEffect, useState } from "react";
import { getDashboard } from "../../services/dashboardService";
import AppLayout from "../../components/AppLayout";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const now = new Date();
const YEARS = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

// ─── Shared primitives ───────────────────────────────────────────────────────

const KpiCard = ({ label, value, sub, accentColor, delay = 0 }) => (
  <div style={{
    background: "#fff",
    border: "0.5px solid #e5e7eb",
    borderLeft: `3px solid ${accentColor}`,
    borderRadius: 12,
    padding: "1rem 1rem 1rem 0.9rem",
    animation: "fadeUp 0.35s ease both",
    animationDelay: `${delay}ms`,
  }}>
    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 500, color: accentColor, lineHeight: 1 }}>
      {value ?? "—"}
    </div>
    {sub && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{sub}</div>}
  </div>
);

const Panel = ({ title, children, style = {} }) => (
  <div style={{
    background: "#fff", border: "0.5px solid #e5e7eb",
    borderRadius: 12, padding: "1.1rem 1.25rem", ...style,
  }}>
    {title && (
      <div style={{ fontSize: 13, fontWeight: 500, color: "#111827", marginBottom: "0.9rem" }}>
        {title}
      </div>
    )}
    {children}
  </div>
);

const StatRow = ({ label, value, color, total }) => {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 0", borderBottom: "0.5px solid #f3f4f6",
    }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />
      <span style={{ flex: 1, fontSize: 13, color: "#6b7280" }}>{label}</span>
      <div style={{ width: 80, height: 4, background: "#f3f4f6", borderRadius: 2 }}>
        <div style={{ width: `${pct}%`, height: 4, borderRadius: 2, background: color }} />
      </div>
      <span style={{ fontSize: 15, fontWeight: 500, color: "#111827", minWidth: 28, textAlign: "right" }}>
        {value ?? 0}
      </span>
    </div>
  );
};

const DendaItem = ({ label, value, bg, color }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "9px 0", borderBottom: "0.5px solid #f3f4f6",
  }}>
    <span style={{ fontSize: 13, color: "#6b7280" }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 500, color, background: bg, padding: "2px 10px", borderRadius: 6 }}>
      {value ?? "—"}
    </span>
  </div>
);

const IconWarning = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 19h20L12 2z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 9v5M12 16.5v.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const IconReceipt = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M6 2h12a1 1 0 0 1 1 1v18l-3-2-3 2-3-2-3 2V3a1 1 0 0 1 1-1z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M9 8h6M9 12h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const WarningPillCard = ({
  icon, label, value, active,
  accentBg, accentBorder, accentIcon,
  accentBadgeBg, accentValueText, delay,
}) => (
  <div style={{
    flex: 1, minWidth: 180,
    display: "flex", alignItems: "center", gap: 12,
    background: active ? accentBg : "#F1EFE8",
    border: `0.5px solid ${active ? accentBorder : "#D3D1C7"}`,
    borderRadius: 12, padding: "12px 16px",
    animation: "fadeUp 0.35s ease both",
    animationDelay: `${delay}ms`,
    transition: "background 0.2s, border-color 0.2s",
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 10,
      background: active ? accentBadgeBg : "#D3D1C7",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      {icon(active ? accentIcon : "#888780")}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{
        fontSize: 11, fontWeight: 500,
        color: active ? accentIcon : "#5F5E5A",
        textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 2,
      }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 24, fontWeight: 500, color: active ? accentValueText : "#444441", lineHeight: 1 }}>
          {value ?? 0}
        </span>
        <span style={{ fontSize: 12, color: active ? accentIcon : "#888780" }}>item</span>
      </div>
    </div>
    <span style={{
      fontSize: 11, fontWeight: 500,
      color: active ? accentIcon : "#5F5E5A",
      background: active ? accentBadgeBg : "#D3D1C7",
      padding: "3px 9px", borderRadius: 20, flexShrink: 0,
    }}>
      {active ? "Perlu tindakan" : "Aman"}
    </span>
  </div>
);

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardUser() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [bulan, setBulan]     = useState(now.getMonth() + 1);
  const [tahun, setTahun]     = useState(now.getFullYear());

  const fetchData = (b, t) => {
    setLoading(true);
    setError(null);
    getDashboard({ bulan: b, tahun: t })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(bulan, tahun); }, [bulan, tahun]);

  const total = data?.total_transaksimu || 1;

  return (
    <AppLayout>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px; margin-bottom: 12px;
        }
        .mid-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 10px; margin-bottom: 12px;
        }
        .warning-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 10px; margin-bottom: 12px;
        }
        @media (max-width: 860px) {
          .kpi-grid     { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .mid-grid     { grid-template-columns: 1fr; }
          .warning-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .kpi-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="p-3 sm:p-4 lg:p-6 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Pantau aktivitas peminjaman dan status denda kamu</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bulan</label>
              <select
                className="select select-bordered w-full bg-white text-sm"
                value={bulan}
                onChange={(e) => setBulan(Number(e.target.value))}
                disabled={loading}
              >
                {MONTHS.map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tahun</label>
              <select
                className="select select-bordered w-full bg-white text-sm"
                value={tahun}
                onChange={(e) => setTahun(Number(e.target.value))}
                disabled={loading}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error mb-4 text-sm">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Loading awal */}
        {loading && !data && (
          <div className="flex items-center gap-3 text-gray-500 py-12 text-sm">
            <span className="loading loading-spinner loading-md" />
            Memuat dashboard…
          </div>
        )}

        {data && (
          <>
            {/* Label periode */}
            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs text-gray-400">
                Data transaksi — {MONTHS[data.filter.bulan - 1]} {data.filter.tahun}
              </p>
              {loading && <span className="loading loading-spinner loading-xs text-gray-400" />}
            </div>

            {/* KPI */}
            <div className="kpi-grid">
              <KpiCard label="Total transaksi"       value={data.total_transaksimu}    sub="bulan ini"       accentColor="#378ADD" delay={0}   />
              <KpiCard label="Pinjaman aktif"        value={data.pinjaman_aktif}       sub="sedang dipinjam" accentColor="#1D9E75" delay={60}  />
              <KpiCard label="Dikembalikan"          value={data.dikembalikan}         sub="selesai"         accentColor="#639922" delay={120} />
              <KpiCard label="Menunggu persetujuan"  value={data.menunggu_persetujuan} sub="perlu diproses"  accentColor="#EF9F27" delay={180} />
            </div>

            {/* Rincian + denda */}
            <div className="mid-grid">
              <Panel title="Rincian status transaksi">
                <StatRow label="Pinjaman aktif"       value={data.pinjaman_aktif}       color="#378ADD" total={total} />
                <StatRow label="Dikembalikan"         value={data.dikembalikan}         color="#1D9E75" total={total} />
                <StatRow label="Menunggu persetujuan" value={data.menunggu_persetujuan} color="#EF9F27" total={total} />
                <StatRow label="Ditolak"              value={data.ditolak}              color="#E24B4A" total={total} />
                <StatRow label="Dibatalkan"           value={data.dibatalkan}           color="#888780" total={total} />
              </Panel>

              <Panel title="Rekap denda saya">
                <DendaItem label="Total denda"  value={data.total_denda}       bg="#E6F1FB" color="#185FA5" />
                <DendaItem
                  label="Belum lunas"
                  value={data.denda_belum_lunas}
                  bg={data.denda_belum_lunas > 0 ? "#FAECE7" : "#F1EFE8"}
                  color={data.denda_belum_lunas > 0 ? "#993C1D" : "#5F5E5A"}
                />
                <DendaItem label="Sudah lunas"  value={data.denda_lunas}       bg="#E1F5EE" color="#0F6E56" />
              </Panel>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}