import { getToken } from "../../utils/auth";

const BASE_URL = "/api/operator/laporan";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const downloadFile = async (url, filename) => {
  const res = await fetch(url, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Gagal export file");
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(objectUrl);
};

// Summary
export const getSummary = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/summary${query ? `?${query}` : ""}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal memuat summary laporan");
  return data;
};

export const exportSummaryExcel = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return downloadFile(
    `${BASE_URL}/summary/export/excel${query ? `?${query}` : ""}`,
    "summary.xlsx"
  );
};

export const exportSummaryPdf = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return downloadFile(
    `${BASE_URL}/summary/export/pdf${query ? `?${query}` : ""}`,
    "summary.pdf"
  );
};

// Transaksi
export const getLaporanTransaksi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/transaksi${query ? `?${query}` : ""}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal memuat laporan transaksi");
  return data;
};

export const exportTransaksiExcel = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return downloadFile(
    `${BASE_URL}/transaksi/export/excel${query ? `?${query}` : ""}`,
    "transaksi.xlsx"
  );
};

export const exportTransaksiPdf = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return downloadFile(
    `${BASE_URL}/transaksi/export/pdf${query ? `?${query}` : ""}`,
    "transaksi.pdf"
  );
};

// Denda
export const getLaporanDenda = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/denda${query ? `?${query}` : ""}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal memuat laporan denda");
  return data;
};

export const exportDendaExcel = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return downloadFile(
    `${BASE_URL}/denda/export/excel${query ? `?${query}` : ""}`,
    "denda.xlsx"
  );
};

export const exportDendaPdf = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return downloadFile(
    `${BASE_URL}/denda/export/pdf${query ? `?${query}` : ""}`,
    "denda.pdf"
  );
};