import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FolderOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Reset mobile menu when switching to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/books", label: "Books", icon: BookOpen },
    { path: "/admin/categories", label: "Categories", icon: FolderOpen },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login/petugas');
  };

  return (
    <>
      {/* Mobile Menu Toggle - Hide when menu is open */}
      {!isMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white px-3 py-2 rounded shadow-lg"
        >
          ☰
        </button>
      )}

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-white border-r border-gray-200 flex flex-col h-screen
          transition-all duration-300
          fixed lg:sticky top-0 z-40
          ${isMobileMenuOpen ? 'w-52' : isExpanded ? 'w-52' : 'w-16'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className={`h-14 flex items-center border-b border-gray-200 ${(isExpanded || isMobileMenuOpen) ? 'justify-between px-3' : 'justify-center px-2'}`}>
          <div className={`flex items-center gap-2 min-w-0 ${(!isExpanded && !isMobileMenuOpen) && 'justify-center'}`}>
            <img 
              src="/icon1.png" 
              alt="Logo" 
              className="w-7 h-7 object-contain flex-shrink-0"
            />
            {(isExpanded || isMobileMenuOpen) && (
              <span className="font-semibold text-gray-800 text-sm truncate">Admin Panel</span>
            )}
          </div>
          
          {/* Close button for mobile */}
          {isMobileMenuOpen && (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 hover:bg-gray-100 rounded text-gray-600"
            >
              <X size={18} />
            </button>
          )}

          {/* Collapse button for desktop when expanded */}
          {isExpanded && !isMobileMenuOpen && (
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
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center px-3 py-3 rounded text-sm
                    transition-colors
                    ${
                      isActive(item.path)
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    }
                    ${(isExpanded || isMobileMenuOpen) ? 'gap-3' : 'justify-center'}
                  `}
                  title={(!isExpanded && !isMobileMenuOpen) ? item.label : ''}
                >
                  <IconComponent size={20} className="flex-shrink-0" />
                  {(isExpanded || isMobileMenuOpen) && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Toggle Button - Show at bottom when collapsed (desktop only) */}
        {!isExpanded && !isMobileMenuOpen && (
          <div className="hidden lg:block border-t border-gray-200 p-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-center px-3 py-3 rounded text-sm text-gray-600 hover:bg-gray-50"
              title="Expand"
            >
              <ChevronRight size={20} className="flex-shrink-0" />
            </button>
          </div>
        )}

        {/* Logout Button */}
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center px-3 py-3 rounded text-sm
              text-gray-600 hover:bg-gray-50
              ${(isExpanded || isMobileMenuOpen) ? 'gap-3' : 'justify-center'}
            `}
            title={(!isExpanded && !isMobileMenuOpen) ? 'Logout' : ''}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {(isExpanded || isMobileMenuOpen) && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}