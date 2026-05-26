import { Link } from "react-router"

export function PrismatLogo({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
     <div
      onClick={onToggle}
      title="Toggle sidebar"
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "0 14px 28px",
        cursor: "pointer",
        overflow: "hidden",
      }}
    >
    <Link to='/' style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 34, height: 34, borderRadius: "50%",
        border: "1.5px solid rgba(255, 255, 255, 0.39)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 16, height: 16, borderRadius: "50%",
          background: "linear-gradient(135deg, #7ec8e3, #b0e0f5)",
        }} />
      </div>
      <span style={{
        fontFamily: "'Elms Sans', 'DM Sans', sans-serif",
        fontSize: 14, fontWeight: 600,
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: "#fff",
      }}>
        Prismat
      </span>
    </Link>
    </div>
  );
}