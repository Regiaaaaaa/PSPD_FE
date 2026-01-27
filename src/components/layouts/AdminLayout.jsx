import AdminSidebar from "../sidebars/AdminSidebar";
import { Toaster } from "react-hot-toast";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Toaster />
      <AdminSidebar />
      
      <main className="flex-1 overflow-auto w-full lg:w-auto">
        <div className="p-6 pt-16 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}