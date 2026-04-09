import { getToken } from "../../utils/auth";

const API_URL = "/api/user/katalog";
export const getAllBooks = async (params = {}) => {
  const token = getToken();

  const query = new URLSearchParams(params).toString();
  const url = query ? `${API_URL}?${query}` : API_URL;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal memuat katalog buku");
  return data;
};

// Get book detail
export const getBookById = async (id) => {
  const token = getToken();

  const res = await fetch(`${API_URL}/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal memuat detail buku");
  return data;
};