// components/TopBar.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import { clearAuth, getUser } from "../utils/auth";
import toast from "react-hot-toast";
import { UserCircle, LogOut, ChevronDown, Menu } from "lucide-react";

export default function TopBar({ onMenuClick }) {
  const navigate = useNavigate();
  const user = getUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const getRoleConfig = () => {
    const role = user?.role || 'user';
    
    const configs = {
      admin: {
        displayName: 'Admin',
        profilePath: '/admin/profile',
        avatarBg: 'bg-gray-200',
        avatarText: 'text-gray-600'
      },
      operator: {
        displayName: 'Operator',
        profilePath: '/operator/profile',
        avatarBg: 'bg-blue-200',
        avatarText: 'text-blue-600'
      },
      siswa: {
        displayName: user?.name || 'Siswa',
        profilePath: '/users/profile',
        avatarBg: 'bg-green-200',
        avatarText: 'text-green-600'
      },
      staff: {
        displayName: user?.name || 'Staff',
        profilePath: '/users/profile',
        avatarBg: 'bg-green-200',
        avatarText: 'text-green-600'
      }
    };

    return configs[role] || configs.siswa;
  };

  const roleConfig = getRoleConfig();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
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

  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left side */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Menu size={20} className="text-gray-700" />
      </button>

      {/* Spacer for desktop */}
      <div className="hidden lg:block"></div>

      {/* Right side */}
      <div className="relative" ref={dropdownRef}>
        <button
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
            className={`text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
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
    </header>
  );
}