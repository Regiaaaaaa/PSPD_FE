import { getToken } from "../../utils/auth";

const API_URL = "/api/operator/verifikasi";

// Get semua transaksi yang menunggu verifikasi
export const getVerifikasi = async () => {
  const token = getToken();

  const res = await fetch(API_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal memuat data verifikasi");
  return data;
};

// Approve peminjaman
export const approveVerifikasi = async (id) => {
  const token = getToken();

  const res = await fetch(`${API_URL}/${id}/approve`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal menyetujui transaksi");
  return data;
};

// Reject peminjaman
export const rejectVerifikasi = async (id, pesan_ditolak) => {
  const token = getToken();

  const res = await fetch(`${API_URL}/${id}/reject`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ pesan_ditolak }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal menolak transaksi");
  return data;
};