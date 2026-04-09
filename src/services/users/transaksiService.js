import { getToken } from "../../utils/auth";

const API_URL = "/api/user/transaksi";

// Get all transaksi user yang login
export const getMyTransaksi = async () => {
  const token = getToken();

  const res = await fetch(API_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal memuat transaksi");
  return data;
};

// Ajukan peminjaman buku
export const ajukanPeminjaman = async (bukuId, payload) => {
  const token = getToken();

  const res = await fetch(`${API_URL}/${bukuId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal mengajukan peminjaman");
  return data;
};

// Get detail transaksi
export const getTransaksiById = async (id) => {
  const token = getToken();

  const res = await fetch(`${API_URL}/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal memuat detail transaksi");
  return data;
};


export const cancelTransaksi = async (id) => {
  const token = getToken();

  const res = await fetch(`${API_URL}/${id}/cancel`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal membatalkan peminjaman");
  return data;
};

export const cekDendaAktif = async () => {
  const token = getToken();

  const res = await fetch(`${API_URL}/cek-denda`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal mengecek denda");
  return data;
};