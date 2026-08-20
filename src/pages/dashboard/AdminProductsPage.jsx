import { ProductsTable } from "@/components/Dashboard/ProductsTable";

export function AdminProductsPage() {
  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container-fluid px-4">
        <div className="d-flex align-items-center gap-2 mb-4">
          <i className="bi bi-box-seam fs-3 text-primary"></i>
          <h2 className="fw-bold mb-0">Products Inventory</h2>
        </div>
        <ProductsTable />
      </div>
    </div>
  );
}

export default AdminProductsPage;
