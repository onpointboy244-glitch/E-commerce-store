import { Navigate, Outlet } from "react-router-dom";
import { useAuthUser } from "../../Hooks/useAuthUser";
import { toast } from "sonner";

export function AdminRouteWrapper() {
  const { data: authUser, isLoading: isAuthLoading } = useAuthUser();

  if (isAuthLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-2">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return <Navigate to="/user" replace />;
  }

  if (authUser.role !== "admin") {
    toast.error(
      "Access Denied: You don't have permission to access the admin dashboard",
      { duration: 5000 },
    );
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
