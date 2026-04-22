  import { getToken } from "../../utils/auth";

  const API_URL = "/api/admin";

  // Get all books
  export const getAllBooks = async () => {
    const token = getToken();

    const res = await fetch(`${API_URL}/books`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw data.message || "Gagal memuat data buku";
    return data;
  };

  // Get book detail
  export const getBookDetail = async (id) => {
    const token = getToken();

    const res = await fetch(`${API_URL}/books/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw data.message || "Gagal memuat detail buku";
    return data;
  };

  // Create book
  export const createBook = async (formData) => {
    const token = getToken();

    const res = await fetch(`${API_URL}/books`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData, 
    });

    const data = await res.json();
    if (!res.ok) throw data.message || "Gagal membuat buku";
    return data;
  };

  // Update book
  export const updateBook = async (id, formData) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/books/${id}`, {
      method: "POST", // Ubah jadi POST
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData, 
    });

    const data = await res.json();
    if (!res.ok) throw data.message || "Gagal update buku";
    return data;
  };

  // Delete book
  export const deleteBook = async (id) => {
    const token = getToken();

    const res = await fetch(`${API_URL}/books/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw data.message || "Gagal menghapus buku";
    return data;
  };