import { getToken } from "../../utils/auth";

const API_URL = "/api/operator/kelola-transaksi";

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});
export const getKelolaTransaksi = async () => {
  const res = await fetch(API_URL, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal memuat data transaksi");
  return data;
};
export const updateDeadlineTransaksi = async (id, tgl_deadline) => {
  const res = await fetch(`${API_URL}/${id}/deadline`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ tgl_deadline }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal mengupdate deadline");
  return data;
};

export const overrideKembaliNormal = async (detailId) => {
  const res = await fetch(`${API_URL}/detail/${detailId}/kembali-normal`, {
    method: "PATCH",
    headers: getHeaders(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal override ke kembali normal");
  return data;
};