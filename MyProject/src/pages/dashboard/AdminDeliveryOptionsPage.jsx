import { DeliveryOptionsTable } from "@/components/Dashboard/DeliveryOptionsTable";

export function AdminDeliveryOptionsPage() {
  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container-fluid px-4">
        <div className="d-flex align-items-center gap-2 mb-4">
          <i className="bi bi-truck fs-3 text-primary"></i>
          <h2 className="fw-bold mb-0">Delivery Options</h2>
        </div>
        <DeliveryOptionsTable />
      </div>
    </div>
  );
}

export default AdminDeliveryOptionsPage;
