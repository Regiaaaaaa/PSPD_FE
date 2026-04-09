import { getToken } from "../utils/auth";

const API_URL = "/api/dashboard";

export const getDashboard = async (params = {}) => {
  const token = getToken();

  const query = new URLSearchParams();
  if (params.bulan) query.append("bulan", params.bulan);
  if (params.tahun) query.append("tahun", params.tahun);

  const url = query.toString() ? `${API_URL}?${query.toString()}` : API_URL;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal memuat dashboard");
  return data;
};