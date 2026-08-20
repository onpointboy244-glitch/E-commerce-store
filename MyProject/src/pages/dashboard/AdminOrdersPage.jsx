import { RecentOrdersTable } from "@/components/Dashboard/RecentOrdersTable";

export function AdminOrdersPage() {
  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container-fluid px-4">
        <div className="d-flex align-items-center gap-2 mb-4">
          <i className="bi bi-receipt fs-3 text-primary"></i>
          <h2 className="fw-bold mb-0">All Orders</h2>
        </div>
        <RecentOrdersTable maxItems={Infinity} />
      </div>
    </div>
  );
}

export default AdminOrdersPage;
