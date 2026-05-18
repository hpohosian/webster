import { useNavigate, Link } from 'react-router';
import { useState } from "react";
import { PrismatLogo } from "./../assets/Logo";
import {IconUser, Editor, Logomaker} from "./../assets/Icons"
import "./LeftSidebar.css";

const API = import.meta.env?.VITE_API;

const NAV_ITEMS = [
  {
    label: "Logo",
    icon: (
      // <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      //   <rect x="3" y="3" width="8" height="8" rx="1" />
      //   <rect x="13" y="3" width="8" height="8" rx="1" />
      //   <rect x="3" y="13" width="8" height="8" rx="1" />
      //   <rect x="13" y="13" width="8" height="8" rx="1" />
      // </svg>

       <Logomaker/>
      ),
    path: "/logo-maker"
  },
  {
    label: "Editor",
    icon: (
     <Editor/>
    ),
    path: "/edit-page"
  },
  {
    label: "Profile",
    icon: (
     <IconUser/>
    ),
    path: "projects/:userId"
  },
];

export default function LeftSidebar() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState<string | null>("profile");
  const [error, setError] = useState("");

  async function handleNavClick(e: React.MouseEvent, item: (typeof NAV_ITEMS)[number]) {
    try {
      const me = await fetch("http://localhost:3000/auth/me", { credentials: "include" })
        const meData = await me.json();

        if (!meData.user) {
          navigate("/login");
          return;
        }
        setActiveNav(item.label);

      } catch (err) {
      console.error(err);
    }
  }

  async function handleLogout() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    try {
      const res = await fetch(`${API}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (data.error) {
        setError(data.message || "Logout failed.");
      } else {
        navigate("/");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  }

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
            className={`prismat-nav-item${activeNav === item.label ? " active" : ""}`}
            onClick={(e) => handleNavClick(e, item)}
          >
            {item.icon}
            {!collapsed && item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          className="account-chip prismat-nav-item"
          style={{ gap: 14 }}
          onClick={handleLogout}
        >
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}
