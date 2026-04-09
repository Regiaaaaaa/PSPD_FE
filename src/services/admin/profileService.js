import { getToken } from "../../utils/auth";

const API_URL = "/api/admin";

// Update profile admin
export const updateProfile = async (payload) => {
  const token = getToken();

  const res = await fetch(`${API_URL}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw data.message || "Gagal update profile";
  return data;
};

// Change password admin
export const changePassword = async (payload) => {
  const token = getToken();

  const res = await fetch(`${API_URL}/profile/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw data.message || "Gagal ganti password";
  return data;
};





