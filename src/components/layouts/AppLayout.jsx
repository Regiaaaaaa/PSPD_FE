import AdminSidebar from "../sidebars/AdminSidebar";
import OperatorSidebar from "../sidebars/OperatorSidebar";
import UserSidebar from "../sidebars/UserSidebar";
import { getUserRole } from "../../utils/auth";

const sidebarMap = {
  admin: AdminSidebar,
  operator: OperatorSidebar,
  siswa: UserSidebar,
  staff: UserSidebar,
};

export default function AppLayout({ children }) {
  const role = getUserRole();
  const Sidebar = sidebarMap[role] || UserSidebar;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto w-full lg:w-auto">
        <div className="p-6 pt-16 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}
