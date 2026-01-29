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
    throw data.message;
  }

  return data;
};

// Register Siswa
export const registerSiswa = async (payload) => {
  const res = await fetch(`${API_URL}/register/siswa`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
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
      "Accept": "application/json",
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

// Kirim OTP
export const sendOtp = async (payload) => {
  const res = await fetch(`/api/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal kirim OTP");
  return data;
};

// Verifikasi OTP
export const verifyOtp = async (payload) => {
  const res = await fetch(`/api/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "OTP salah");
  return data;
};

// Reset password
export const resetPassword = async (payload) => {
  const res = await fetch(`/api/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Reset gagal");
  return data;
};


export const updateProfile = async (payload) => {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/profile`, { 
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw data.message || "Gagal memperbarui profile";
  }

  return data;
};

export const changePassword = async (payload) => {
  const token = getToken();
  const res = await fetch(`${API_URL}/admin/profile/change-password`, {  
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw data.message || "Gagal mengubah password";
  }

  return data;
};