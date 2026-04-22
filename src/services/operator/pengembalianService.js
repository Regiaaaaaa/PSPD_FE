import { getToken } from "../../utils/auth";

const API_URL = "/api/operator/pengembalian";

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});
export const getPengembalian = async () => {
  const res = await fetch(API_URL, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal memuat data pengembalian");
  return data;
};
export const terimaPengembalian = async (detailId, status) => {
  const res = await fetch(`${API_URL}/${detailId}/terima`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal menerima pengembalian");
  return data;
};