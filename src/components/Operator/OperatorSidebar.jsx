import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import {
  LayoutDashboard,
  BookOpen,
  BookCheck,
  ChevronLeft,
  ChevronRight,
  SquareCheckBig,
  X,
  ReceiptText,
  Files,
  ChevronDown,
  BarChart2,
  ArrowLeftRight,
  AlertCircle,
} from "lucide-react";

export default function OperatorSidebar({ isOpen, onClose }) {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [laporanOpen, setLaporanOpen] = useState(false);

  
  useEffect(() => {
    if (location.pathname.startsWith("/operator/laporan")) {
      setLaporanOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        onClose();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [onClose]);

  const menuItems = [
    { path: "/operator/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/operator/monitoring-buku", label: "Books", icon: BookOpen },
    { path: "/operator/verifikasi-peminjaman", label: "Verifikasi", icon: SquareCheckBig },
    { path: "/operator/pengembalian", label: "Pengembalian", icon: BookCheck },
    { path: "/operator/kelola-transaksi", label: "Kelola Transaksi", icon: ArrowLeftRight },
    { path: "/operator/validasi-denda", label: "Validasi Denda", icon: ReceiptText },
  ];

  const laporanSubMenu = [
    { path: "/operator/laporan", label: "Summary", icon: BarChart2 },
    { path: "/operator/laporan/transaksi", label: "Transaksi", icon: ArrowLeftRight },
    { path: "/operator/laporan/denda", label: "Denda", icon: AlertCircle },
  ];

  const isActive = (path) => location.pathname === path;
  const isLaporanActive = location.pathname.startsWith("/operator/laporan");
  const showLabel = isExpanded || isOpen;

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-white border-r border-gray-200 flex flex-col h-screen
          transition-all duration-300
          fixed lg:sticky top-0 z-40
          ${isOpen ? "w-52" : isExpanded ? "w-52" : "w-16"}
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div
          className={`h-14 flex items-center border-b border-gray-200 ${
            showLabel ? "justify-between px-3" : "justify-center px-2"
          }`}
        >
          <div
            className={`flex items-center gap-2 min-w-0 ${
              !showLabel && "justify-center"
            }`}
          >
            <img
              src="/icon1.png"
              alt="Logo"
              className="w-7 h-7 object-contain flex-shrink-0"
            />
            {showLabel && (
              <span className="font-semibold text-gray-800 text-sm truncate">
                Operator Panel
              </span>
            )}
          </div>

          {isOpen && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 hover:bg-gray-100 rounded text-gray-600"
            >
              <X size={18} />
            </button>
          )}

          {isExpanded && !isOpen && (
            <button
              onClick={() => setIsExpanded(false)}
              className="hidden lg:block p-1.5 hover:bg-gray-100 rounded text-gray-600 flex-shrink-0"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center px-3 py-3 rounded text-sm transition-colors
                    ${
                      isActive(item.path)
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }
                    ${showLabel ? "gap-3" : "justify-center"}
                  `}
                  title={!showLabel ? item.label : ""}
                >
                  <IconComponent size={20} className="flex-shrink-0" />
                  {showLabel && <span>{item.label}</span>}
                </Link>
              );
            })}

            {/* Report Sub Menu */}
            <div>
              <button
                onClick={() => {
                  if (!showLabel) {
                    setIsExpanded(true);
                    setLaporanOpen(true);
                  } else {
                    setLaporanOpen((prev) => !prev);
                  }
                }}
                className={`
                  w-full flex items-center px-3 py-3 rounded text-sm transition-colors
                  ${
                    isLaporanActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }
                  ${showLabel ? "gap-3" : "justify-center"}
                `}
                title={!showLabel ? "Laporan" : ""}
              >
                <Files size={20} className="flex-shrink-0" />
                {showLabel && (
                  <>
                    <span className="flex-1 text-left">Laporan</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${
                        laporanOpen ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )}
              </button>

              {/* Submenu */}
              {showLabel && laporanOpen && (
                <div className="mt-1 ml-3 pl-3 border-l-2 border-blue-100 space-y-1">
                  {laporanSubMenu.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        onClick={onClose}
                        className={`
                          flex items-center gap-2.5 px-3 py-2.5 rounded text-sm transition-colors
                          ${
                            isActive(sub.path)
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                          }
                        `}
                      >
                        <SubIcon size={16} className="flex-shrink-0" />
                        <span>{sub.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Toggle collapsed */}
        {!isExpanded && !isOpen && (
          <div className="border-t border-gray-200 p-3">
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full flex items-center justify-center px-3 py-3 rounded text-sm text-gray-600 hover:bg-gray-50"
              title="Expand"
            >
              <ChevronRight size={20} className="flex-shrink-0" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}