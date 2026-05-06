import { Outlet, Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { label: "LOGIN",    path: "/login" },
  { label: "PROFILE",  path: "/profile" },
  { label: "PROJECTS", path: "/projects" },
];

export default function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <aside style={{ width: 210, background: "#111" }}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              color: pathname === item.path ? "#fff" : "rgba(255,255,255,0.5)",
              // active page gets full white, others dimmed
            }}
          >
            {item.label}
          </Link>
        ))}
      </aside>

      <main style={{ flex: 1, overflowY: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}