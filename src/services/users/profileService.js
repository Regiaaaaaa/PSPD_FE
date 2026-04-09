import { getToken } from "../../utils/auth";

const API_URL = "/api/user/profile";

// Update profile user
export const updateProfile = async (payload) => {
  const token = getToken();

  const res = await fetch(API_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal update profile");
  return data;
};

// Ganti password
export const changePassword = async (payload) => {
  const token = getToken();

  const res = await fetch(`${API_URL}/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal ubah password");
  return data;
};