import { Link } from "react-router-dom";

export default function OperatorSidebar() {
  return (
    <aside style={{ width: 220, background: "#1f2937", color: "#fff", padding: 20 }}>
      <h3>Operator</h3>

      <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Link to="/operator/dashboard">Dashboard</Link>
        <Link to="/operator/books">Books</Link>
        <Link to="/operator/borrow">Peminjaman</Link>
        <Link to="/operator/returns">Pengembalian</Link>
      </nav>
    </aside>
  );
}
