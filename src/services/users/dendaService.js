import { getToken } from "../../utils/auth";

const API_URL = "/api/user/transaksi";

export const getMyDenda = async () => {
  const res = await fetch(API_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal memuat denda");
  const transaksiWithDenda = (data.data || []).filter(
    (t) => parseFloat(t.total_denda) > 0
  );

  return { success: true, data: transaksiWithDenda };
};