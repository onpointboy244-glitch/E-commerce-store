import { useAuthUser } from "@/Hooks/useAuthUser";
import { StatsCards } from "@/components/Dashboard/StatsCards";
import { ChartsSection } from "@/components/Dashboard/ChartsSection";

export function AdminDashboard() {
  // Auth is handled by AdminLayout — this hook is only for the welcome message
  const { data: authUser } = useAuthUser();

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container-fluid px-4">
        <div className="d-flex align-items-center gap-2 mb-4">
          <i className="bi bi-speedometer2 fs-3 text-primary"></i>
          <div>
            <h2 className="fw-bold mb-0">Dashboard</h2>
            <p className="text-muted mb-0">
              Welcome back, <strong>{authUser?.fullname || "Admin"}</strong>
            </p>
          </div>
        </div>

        <StatsCards />
        <ChartsSection />
      </div>
    </div>
  );
}

export default AdminDashboard;
