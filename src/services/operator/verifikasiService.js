import { getToken } from "../../utils/auth";

const API_URL = "/api/operator/verifikasi";
const NOTIF_URL = "/api/operator/notifications";
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});


// Get semua pengajuan
export const getVerifikasi = async () => {
  const res = await fetch(API_URL, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal memuat data verifikasi");
  return data;
};

// Approve peminjaman
export const approveVerifikasi = async (id, tgl_deadline = null, pesan_diterima = null) => {
  const body = {};
  if (tgl_deadline) {
    body.tgl_deadline = tgl_deadline;
  }
  if (pesan_diterima) {
    body.pesan_diterima = pesan_diterima;
  }

  const res = await fetch(`${API_URL}/${id}/approve`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal menyetujui transaksi");
  return data;
};

// Reject peminjaman
export const rejectVerifikasi = async (id, pesan_ditolak) => {
  const res = await fetch(`${API_URL}/${id}/reject`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ pesan_ditolak }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal menolak transaksi");
  return data;
};

// Get notifikasi
export const getOperatorNotifications = async () => {
  const res = await fetch(NOTIF_URL, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal memuat notifikasi");
  return data;
};

// Tandai satu notifikasi sebagai dibaca
export const markOperatorNotificationAsRead = async (id) => {
  const res = await fetch(`${NOTIF_URL}/${id}/read`, {
    method: "POST",
    headers: getHeaders(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal membaca notifikasi");
  return data;
};

// Tandai semua notifikasi
export const markAllOperatorNotificationsRead = async () => {
  const res = await fetch(`${NOTIF_URL}/mark-all-read`, {
    method: "POST", 
    headers: getHeaders(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal membaca semua notifikasi");
  return data;
};