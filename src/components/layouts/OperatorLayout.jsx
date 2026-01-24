import OperatorSidebar from "../sidebars/OperatorSidebar";

export default function OperatorLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <OperatorSidebar />
      <main style={{ flex: 1, padding: 20 }}>
        {children}
      </main>
    </div>
  );
}
