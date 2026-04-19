import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import { clearAuth, getUser } from "../utils/auth";
import { getNotifications, markNotificationAsRead, markAllNotificationsRead } from "../services/users/transaksiService";
import { getOperatorNotifications, markOperatorNotificationAsRead, markAllOperatorNotificationsRead } from "../services/operator/verifikasiService";
import toast from "react-hot-toast";
import { UserCircle, LogOut, ChevronDown, Menu, Bell } from "lucide-react";

export default function TopBar({ onMenuClick }) {
  const navigate = useNavigate();
  const user = getUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const getRoleConfig = () => {
    const role = user?.role || "user";

    const configs = {
      admin: {
        displayName: "Admin",
        profilePath: "/admin/profile",
        avatarBg: "bg-gray-200",
        avatarText: "text-gray-600",
      },
      operator: {
        displayName: "Operator",
        profilePath: "/operator/profile",
        avatarBg: "bg-blue-200",
        avatarText: "text-blue-600",
      },
      siswa: {
        displayName: user?.name || "Siswa",
        profilePath: "/users/profile",
        avatarBg: "bg-green-200",
        avatarText: "text-green-600",
      },
      staff: {
        displayName: user?.name || "Staff",
        profilePath: "/users/profile",
        avatarBg: "bg-green-200",
        avatarText: "text-green-600",
      },
    };

    return configs[role] || configs.siswa;
  };

  const roleConfig = getRoleConfig();
  const isUserRole = ["staff", "siswa"].includes(user?.role);
  const isOperatorRole = user?.role === "operator";
  const hasNotifFeature = isUserRole || isOperatorRole;

  const fetchNotifications = async () => {
    try {
      let res;

      if (isOperatorRole) {
        res = await getOperatorNotifications();
      } else {
        res = await getNotifications();
      }

      if (res.success) {
        setNotifications(res.data.slice(0, 10));
        setUnreadCount(res.unread_count);
      }
    } catch {
      // Silent
    }
  };

  useEffect(() => {
    if (!hasNotifFeature) return;

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 10000);

    return () => clearInterval(interval);
  }, [hasNotifFeature]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logout berhasil. Sampai jumpa 👋");
    } catch {
      toast.error("Terjadi kesalahan saat logout");
    } finally {
      clearAuth();
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    }
  };

  const handleMarkAsRead = async (id) => {
  try {
    if (isOperatorRole) {
      await markOperatorNotificationAsRead(id);
    } else {
      await markNotificationAsRead(id);
    }

    await fetchNotifications();
    
    setTimeout(() => {
      window.location.reload();
    }, 500); 

  } catch {
    toast.error("Gagal menandai notifikasi");
  }
};

 const handleMarkAllRead = async () => {
  try {
    if (isOperatorRole) {
      await markAllOperatorNotificationsRead();
    } else {
      await markAllNotificationsRead();
    }

    await fetchNotifications();
    toast.success("Semua notifikasi sudah dibaca");
    
    setTimeout(() => {
      window.location.reload();
    }, 1000); 

  } catch {
    toast.error("Gagal menandai semua notifikasi");
  }
};

  // Helper
  const getStatusBadge = (notifData) => {
    const status = notifData?.status;

    if (!status) return null;

    const statusConfig = {
      pending: { label: "menunggu", className: "bg-yellow-100 text-yellow-700" },
      dipinjam: { label: "dipinjam", className: "bg-green-100 text-green-700" },
      ditolak: { label: "ditolak", className: "bg-red-100 text-red-700" },
      menunggu: { label: "menunggu", className: "bg-yellow-100 text-yellow-700" },
    };

    const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-600" };

    return (
      <span className={`inline-block mt-1 text-xs font-medium px-1.5 py-0.5 rounded ${config.className}`}>
        {config.label}
      </span>
    );
  };

  // Render
  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left side */}
      <button
        type="button"
        onClick={onMenuClick}
        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Menu size={20} className="text-gray-700" />
      </button>

      {/* Spacer for desktop */}
      <div className="hidden lg:block"></div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Bell Icon */}
        {hasNotifFeature && (
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell size={20} className="text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 mt-2 sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden" style={{ top: "3.5rem" }}>
                {/* Header notif */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-800">Notifikasi</span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMarkAllRead();
                      }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Tandai semua dibaca
                    </button>
                  )}
                </div>

                {/* List notif */}
                <ul className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <li className="px-4 py-6 text-center text-sm text-gray-400">
                      Tidak ada notifikasi
                    </li>
                  ) : (
                    notifications.map((notif) => {
                      const isUnread = !notif.read_at;
                      const notifData = notif.data || {};

                      return (
                        <li
                          key={notif.id}
                          onClick={() => isUnread && handleMarkAsRead(notif.id)}
                          className={`px-4 py-3 cursor-pointer transition-colors ${
                            isUnread ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {/* Dot indikator unread */}
                            <span
                              className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                                isUnread ? "bg-blue-500" : "bg-transparent"
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-700 leading-snug">{notifData.message}</p>
                              {getStatusBadge(notifData)}
                            </div>
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className={`w-8 h-8 rounded-full ${roleConfig.avatarBg} flex items-center justify-center`}>
              <UserCircle size={20} className={roleConfig.avatarText} />
            </div>

            <span className="hidden sm:block text-sm font-medium text-gray-700">
              {roleConfig.displayName}
            </span>

            <ChevronDown
              size={16}
              className={`text-gray-600 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <Link
                to={roleConfig.profilePath}
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <UserCircle size={18} />
                <span>Profile</span>
              </Link>

              <hr className="my-1 border-gray-200" />

              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}