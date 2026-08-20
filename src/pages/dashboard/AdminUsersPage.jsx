import { UsersTable } from "@/components/Dashboard/UsersTable";

export function AdminUsersPage() {
  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container-fluid px-4">
        <div className="d-flex align-items-center gap-2 mb-4">
          <i className="bi bi-people fs-3 text-primary"></i>
          <h2 className="fw-bold mb-0">Users</h2>
        </div>
        <UsersTable />
      </div>
    </div>
  );
}

export default AdminUsersPage;
