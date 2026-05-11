import { useNavigate, Link } from 'react-router';
import { useState } from "react";
import "./LeftSidebar.css"

const NAV_ITEMS = [
  { 
    label: "Login", path: "/login" },
  {
    label: "Logo maker",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="3" y="3" width="8" height="8" rx="1" />
        <rect x="13" y="3" width="8" height="8" rx="1" />
        <rect x="3" y="13" width="8" height="8" rx="1" />
        <rect x="13" y="13" width="8" height="8" rx="1" />
      </svg>
    ),
    path: "/logo-maker"
  },
  {
    label: "Editor",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <path d="M7 7h4M7 12h10M7 17h6" strokeLinecap="round" />
      </svg>
    ),
     path: "/edit-page"
  },
  {
    label: "Profile",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
      </svg>
    ),
    path: "projects/:userId"
  },
  // { label: "Projekts", 
  //   icon: ( 
  //     <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
  //     <path d="M21 7H3M16 12H3M21 17H3" strokeLinecap="round" /></svg>
  //   ),
  //   path: "/projects/:userId'" },
];

function PrismatLogo({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
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
        border: "1.5px solid rgba(255,255,255,0.3)",
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

export default function LeftSidebar() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState<string | null>("profile");
  return (
      <aside style={{
          width: collapsed ? 56 : 180,
          minWidth: collapsed ? 56 : 180,
          minHeight: "100vh",
          background: "#18191b",
          display: "flex",
          flexDirection: "column",
          padding: "24px 16px",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}>
            <PrismatLogo collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

          {/* Nav items */}
          <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`prismat-nav-item${activeNav === item.label ? "" : ""}`}
                onClick={(e) => { setActiveNav(item.label); }}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Bottom section */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button className="account-chip prismat-nav-item" style={{ gap: 14 }}>
              Logout
            </button>
          </div>
        </aside>
  )
}