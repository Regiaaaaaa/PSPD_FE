import { useState } from "react";
import AdminSidebar from "../components/Admin/AdminSidebar";
import OperatorSidebar from "../components/Operator/OperatorSidebar";
import UserSidebar from "../components/Users/UserSidebar";
import AdminTopBar from "../components/Admin/AdminTopBar";
import OperatorTopBar from "../components/Operator/OperatorTopBar";
import UserTopBar from "../components/Users/UserTopBar";
import { getUserRole } from "../utils/auth";

const sidebarMap = {
  admin: AdminSidebar,
  operator: OperatorSidebar,
  siswa: UserSidebar,
  staff: UserSidebar,
};

const topbarMap = {
  admin: AdminTopBar,
  operator: OperatorTopBar,
  siswa: UserTopBar,
  staff: UserTopBar,
};

export default function AppLayout({ children }) {
  const role = getUserRole();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const Sidebar = sidebarMap[role];
  const TopBar = topbarMap[role] || UserTopBar;

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