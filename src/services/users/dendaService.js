import { getToken } from "../../utils/auth";

const API_URL = "/api/user/transaksi";

// Get denda 
export const getMyDenda = async () => {
  const token = getToken();

  const res = await fetch(API_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal memuat denda");
  const transaksiWithDenda = (data.data || []).filter((t) => t.denda);

  return {
    success: true,
    data: transaksiWithDenda,
  };
};

