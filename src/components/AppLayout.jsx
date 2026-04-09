import { useState } from "react";
import AdminSidebar from "../components/Admin/AdminSidebar";
import OperatorSidebar from "../components/Operator/OperatorSidebar";
import UserSidebar from "../components/Users/UserSidebar";
import TopBar from "../components/TopBar";
import { getUserRole } from "../utils/auth";

const sidebarMap = {
  admin: AdminSidebar,
  operator: OperatorSidebar,
  siswa: UserSidebar,
  staff: UserSidebar,
};

export default function AppLayout({ children }) {
  const role = getUserRole();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const Sidebar = sidebarMap[role];

  return (
    <div className="flex h-screen overflow-hidden">
      {Sidebar && (
        <Sidebar 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}