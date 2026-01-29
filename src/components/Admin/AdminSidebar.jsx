import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";

export default function AdminSidebar({ isOpen, onClose }) {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  // Reset mobile menu when switching to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        onClose();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onClose]);

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/books", label: "Books", icon: BookOpen },
    { path: "/admin/categories", label: "Categories", icon: FolderOpen },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Overlay */}
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
          ${isOpen ? 'w-52' : isExpanded ? 'w-52' : 'w-16'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className={`h-14 flex items-center border-b border-gray-200 ${(isExpanded || isOpen) ? 'justify-between px-3' : 'justify-center px-2'}`}>
          <div className={`flex items-center gap-2 min-w-0 ${(!isExpanded && !isOpen) && 'justify-center'}`}>
            <img 
              src="/icon1.png" 
              alt="Logo" 
              className="w-7 h-7 object-contain flex-shrink-0"
            />
            {(isExpanded || isOpen) && (
              <span className="font-semibold text-gray-800 text-sm truncate">Admin Panel</span>
            )}
          </div>
          
          {/* Close button for mobile */}
          {isOpen && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 hover:bg-gray-100 rounded text-gray-600"
            >
              <X size={18} />
            </button>
          )}

          {/* Collapse button for desktop when expanded */}
          {isExpanded && !isOpen && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
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
                    flex items-center px-3 py-3 rounded text-sm
                    transition-colors
                    ${
                      isActive(item.path)
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    }
                    ${(isExpanded || isOpen) ? 'gap-3' : 'justify-center'}
                  `}
                  title={(!isExpanded && !isOpen) ? item.label : ''}
                >
                  <IconComponent size={20} className="flex-shrink-0" />
                  {(isExpanded || isOpen) && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Toggle Button - Show at bottom when collapsed (desktop only) */}
        {!isExpanded && !isOpen && (
          <div className="border-t border-gray-200 p-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
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