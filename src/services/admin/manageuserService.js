import { getToken } from "../../utils/auth";

const API_URL = "/api/admin";

// Get all users
export const getAllUsers = async () => {
  const token = getToken();

  const res = await fetch(`${API_URL}/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw data.message || "Gagal memuat data user";
  return data;
};

// Get user detail
export const getUserDetail = async (id) => {
  const token = getToken();

  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw data.message || "Gagal memuat detail user";
  return data;
};

// Create operator
export const createOperator = async (payload) => {
  const token = getToken();

  const res = await fetch(`${API_URL}/users/operator`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw data.message || "Gagal membuat akun operator";
  return data;
};

// Create staff
export const createStaff = async (payload) => {
  const token = getToken();

  const res = await fetch(`${API_URL}/users/staff`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw data.message || "Gagal membuat akun staff";
  return data;
};

// Create siswa
export const createSiswa = async (payload) => {
  const token = getToken();

  const res = await fetch(`${API_URL}/users/siswa`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw data.message || "Gagal membuat akun siswa";
  return data;
};

// Update user
export const updateUser = async (id, payload) => {
  const token = getToken();

  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw data.message || "Gagal update user";
  return data;
};

// Delete user
export const deleteUser = async (id) => {
  const token = getToken();

  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw data.message || "Gagal menghapus user";
  return data;
};

// Reset password user
export const resetPasswordUser = async (id) => {
  const token = getToken();

  const res = await fetch(`${API_URL}/users/${id}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw data.message || "Gagal reset password";
  return data;
};