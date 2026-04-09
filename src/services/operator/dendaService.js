import { getToken } from "../../utils/auth";

const API_URL = "/api/operator/denda";

// Get semua denda (bisa filter by status: 'belum_lunas' | 'lunas')
export const getDenda = async (status = "") => {
  const token = getToken();

  const url = status ? `${API_URL}?status=${status}` : API_URL;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal memuat data denda");
  return data;
};

// Tandai denda sebagai lunas
export const bayarDenda = async (id) => {
  const token = getToken();

  const res = await fetch(`${API_URL}/${id}/bayar`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal memproses pembayaran denda");
  return data;
};