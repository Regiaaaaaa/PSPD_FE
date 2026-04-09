import { getToken } from "../../utils/auth";

const API_URL = "/api/operator/monitoring-buku";

// Get all monitoring buku
export const getMonitoringBuku = async () => {
  const token = getToken();

  const res = await fetch(API_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal memuat data monitoring buku");
  return data;
};