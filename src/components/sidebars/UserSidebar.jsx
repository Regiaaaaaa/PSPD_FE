import { Link } from "react-router-dom";
import { getUser } from "../../utils/auth";

export default function UserSidebar() {
  const user = getUser();

  return (
    <aside style={{ width: 220, background: "#f3f4f6", padding: 20 }}>
      <h3>User</h3>
      <p style={{ fontSize: 12 }}>{user?.name}</p>

      <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Link to="/users/dashboard">Dashboard</Link>
        <Link to="/users/books">Katalog Buku</Link>
        <Link to="/users/history">Riwayat</Link>
      </nav>
    </aside>
  );
}
