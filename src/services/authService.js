import { getToken } from "../utils/auth";

const API_URL = "/api";

// Login
export const login = async (payload) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Login gagal");
  }

  return data;
};

// Register Siswa
export const registerSiswa = async (payload) => {
  const res = await fetch(`${API_URL}/register/siswa`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Register siswa gagal");
  }

  return data;
};

// Register Staff
export const registerStaff = async (payload) => {
  const res = await fetch(`${API_URL}/register/staff`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Register staff gagal");
  }

  return data;
};

export const logout = async () => {
  const token = getToken();
  if (!token) return;

  await fetch(`${API_URL}/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};