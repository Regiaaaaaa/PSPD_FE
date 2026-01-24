const API_URL = "http://localhost:8000/api";

/* =====================
   PETUGAS (admin, operator)
===================== */
export const loginPetugas = async (payload) => {
  const res = await fetch(`${API_URL}/petugas/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Login petugas gagal");
  }

  return data;
};

/* =====================
   SISWA
===================== */
export const loginSiswa = async (payload) => {
  const res = await fetch(`${API_URL}/siswa/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Login siswa gagal");
  }

  return data;
};

export const registerSiswa = async (payload) => {
  const res = await fetch(`${API_URL}/siswa/register`, {
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

/* =====================
   STAFF
===================== */
export const loginStaff = async (payload) => {
  const res = await fetch(`${API_URL}/staff/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Login staff gagal");
  }

  return data;
};

export const registerStaff = async (payload) => {
  const res = await fetch(`${API_URL}/staff/register`, {
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
