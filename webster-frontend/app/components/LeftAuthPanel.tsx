import { useNavigate, Link } from 'react-router';
import { useState } from "react";

const NAV_ITEMS = [
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
  },
  {
    label: "Editor",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <path d="M7 7h4M7 12h10M7 17h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Profile",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "LEARN",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M4 19V6a2 2 0 012-2h12a2 2 0 012 2v13" strokeLinecap="round" />
        <path d="M4 19h16M9 10h6M9 14h4" strokeLinecap="round" />
      </svg>
    ),
  },
];

function PrismatLogo() {
  return (
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
  );
}

export default function LeftSidebar() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState<string | null>("PROFILE");
  return (
    <>
      {/* ── LEFT SIDEBAR ── */}
        <aside style={{
          width: 210,
          minWidth: 210,
          background: "#18191b",
          display: "flex",
          flexDirection: "column",
          padding: "24px 16px",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}>
          {/* Logo */}
          <div style={{ padding: "4px 2px 32px" }}>
            <PrismatLogo />
          </div>

          {/* Nav items */}
          <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href="#"
                className={`prismat-nav-item${activeNav === item.label ? " active" : ""}`}
                onClick={(e) => { e.preventDefault(); setActiveNav(item.label); }}
              >
                {item.icon}
                {item.label}
                {/* {item.external && <span className="ext-arrow">↗</span>} */}
              </a>
            ))}
          </nav>

          {/* Bottom section */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Link to="*" className="prismat-nav-item" style={{ gap: 14 }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M21 7H3M16 12H3M21 17H3" strokeLinecap="round" />
              </svg>
              My Projekts
            </Link>
            <button className="account-chip">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
              </svg>
              Logout
            </button>
          </div>
        </aside>
  </>
  )
}