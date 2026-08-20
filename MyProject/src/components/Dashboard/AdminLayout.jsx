import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Close sidebar by default on mobile, open on desktop
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area — sidebar overlays on top, no push */}
      <div
        className="d-flex flex-column"
        style={{
          width: "100%",
          minHeight: "100vh",
        }}
      >
        {/* Top bar with sidebar toggle */}
        <div
          className="bg-white border-bottom px-3 py-2 d-flex align-items-center sticky-top"
          style={{ zIndex: 1020 }}
        >
          <button
            className="btn btn-link text-dark p-1 me-3 text-decoration-none"
            onClick={() => setSidebarOpen((prev) => !prev)}
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-label="Toggle sidebar"
          >
            <i className="bi bi-list fs-4"></i>
          </button>
          <span className="text-muted small d-flex align-items-center gap-1">
            <i className="bi bi-person-badge"></i>
            Admin Area
          </span>
        </div>

        {/* Child page content */}
        <div className="flex-grow-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
