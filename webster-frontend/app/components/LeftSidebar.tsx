import { useNavigate, Link } from 'react-router';
import { useState, useEffect } from "react";
import { PrismatLogo } from "./../assets/Logo";
import { IconUser, Editor, Logomaker } from "./../assets/Icons"
import "./LeftSidebar.css";

const API = import.meta.env?.VITE_API;

export default function LeftSidebar() {    
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState<string | null>("profile");
  const [error, setError] = useState("");
  // const [isLogged, setIsLogged] = useState(false);
  const [userId, setId] = useState(null);
  
  useEffect(() => {
     fetch(`${API}/auth/me`, { credentials: "include" })
       .then(r => r.json())
       .then(data => {
         if (data.user) {
           setId(data.user.id); 
         }
       })
     .catch(console.error);
   }, []);

  const NAV_ITEMS = [
    {
      label: "Logo",
      icon: <Logomaker/>,
      action: () => navigate("/logo-maker")
    },
    {
      label: "Editor",
      icon: <Editor/>,
      action: async () => {
        const projectId = await createProject();
        if (projectId) {
          navigate(`/edit-page/${projectId}`);
        }
      }
    },
    {
      label: "Profile",
      icon: <IconUser/>,
     action: async () => {
       navigate(`/projects/${userId}`);
     }
    },
  ];
  
  const createProject = async () => {
  try {
    // if (!userId) window.location.href = "/login";

    const res = await fetch(`${API}/projects`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "My project",
        canvas: {
          width: 800,
          height: 600,
          background: "#ffffff",
        },
      }),
    });
     const project = await res.json();
      return project.id;
    } catch (err) {
      console.error(err);
    }
  };

  async function handleNavClick(item: (typeof NAV_ITEMS)[number]) {
    try {
      const me = await fetch(`${API}/auth/me`, { credentials: "include" })
        const meData = await me.json();

        if (!meData.user) {
          navigate("/login");
          return;
        }
        setActiveNav(item.label);
        item.action();

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
          <button
            key={item.label}
            className={`prismat-nav-item${activeNav === item.label ? " active" : ""}`}
            onClick={() => handleNavClick(item)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              color: "#e5e5e7",
              width: "100%"
            }}
          >
            {item.icon}
            {!collapsed && item.label}
          </button>
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
