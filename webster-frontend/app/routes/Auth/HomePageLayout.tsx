import { Outlet, Link, useLocation } from "react-router";
import LeftSidebar from "../../components/LeftSidebar";

export default function AppLayout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
     <LeftSidebar/>
      <main style={{ flex: 1, overflowY: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}
