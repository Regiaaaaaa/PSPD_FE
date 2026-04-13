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

 // @param {Array} books
export const ajukanPeminjaman = async (books) => {
  const token = getToken();

  const res = await fetch(`${API_URL}/pinjam`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ books }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal mengajukan peminjaman");
  return data;
};

// Get detail transaksi
export const getTransaksiById = async (id) => {
  const token = getToken();

  const res = await fetch(`${API_URL}/show/${id}`, {
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

  const res = await fetch(`${API_URL}/cancel/${id}`, {
    method: "POST",
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

// Ambil daftar notifikasi 
export const getNotifications = async () => {
  const token = getToken();

  const res = await fetch("/api/user/notifications", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal memuat notifikasi");
  return data;
};

// Tandai notifikasi
export const markNotificationAsRead = async (id) => {
  const token = getToken();

  const res = await fetch(`/api/user/notifications/${id}/read`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal menandai notifikasi");
  return data;
};

// Tandai semua notifikasi
export const markAllNotificationsRead = async () => {
  const token = getToken();

  const res = await fetch("/api/user/notifications/mark-all-read", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal menandai semua notifikasi");
  return data;
};