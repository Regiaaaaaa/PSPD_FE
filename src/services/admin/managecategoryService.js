import { getToken } from "../../utils/auth";

const API_URL = "/api/admin";

// Get all categories
export const getAllCategories = async () => {
  const token = getToken();

  const res = await fetch(`${API_URL}/categories`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw data.message || "Gagal memuat data kategori";
  return data;
};

// Get category detail
export const getCategoryDetail = async (id) => {
  const token = getToken();

  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw data.message || "Gagal memuat detail kategori";
  return data;
};

// Create category
export const createCategory = async (payload) => {
  const token = getToken();

  const res = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw data.message || "Gagal membuat kategori";
  return data;
};

// Update category
export const updateCategory = async (id, payload) => {
  const token = getToken();

  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw data.message || "Gagal update kategori";
  return data;
};

// Delete category
export const deleteCategory = async (id) => {
  const token = getToken();

  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw data.message || "Gagal menghapus kategori";
  return data;
};


