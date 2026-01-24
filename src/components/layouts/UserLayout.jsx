import UserSidebar from "../sidebars/UserSidebar";

export default function UserLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <UserSidebar />
      <main style={{ flex: 1, padding: 20 }}>
        {children}
      </main>
    </div>
  );
}
