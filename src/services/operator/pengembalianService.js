import { getToken } from "../../utils/auth";

const API_URL = "/api/operator/pengembalian";

// Get semua transaksi yang sedang dipinjam
export const getPengembalian = async () => {
  const token = getToken();

  const res = await fetch(API_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw data.message || "Gagal memuat data pengembalian";
  return data;
};

// Terima pengembalian buku
export const terimaPengembalian = async (id) => {
  const token = getToken();

  const res = await fetch(`${API_URL}/${id}/terima`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw data.message || "Gagal menerima pengembalian";
  return data;
};