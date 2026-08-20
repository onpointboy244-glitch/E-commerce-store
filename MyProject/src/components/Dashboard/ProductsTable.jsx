import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useProducts } from "../../Hooks/useProducts";
import { deleteProduct } from "../../utilsFunctions/adminApi";
import { ConfirmModal } from "../utils/ConfirmModal";

export function ProductsTable() {
  const navigate = useNavigate();
  const { data: products } = useProducts();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const formatCurrency = (val) => (val || 0).toFixed(2);

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-semibold"><i className="bi bi-box-seam me-2 text-primary"></i>Products Inventory</h5>
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-sm btn-success px-3" onClick={() => navigate("/admin/products/add")}>
            <i className="bi bi-plus-lg me-1"></i>Add Product
          </button>
          <span className="badge bg-primary rounded-pill">{products?.length || 0} products</span>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Category</th>
              <th>Stock</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(products || []).map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <img src={product.image || "/placeholder.svg"} alt={product.name} className="rounded" width="40" height="40" style={{ objectFit: "cover" }} />
                    <span className="fw-medium">{product.name}</span>
                  </div>
                </td>
                <td className="fw-medium">{formatCurrency(product.price)} JD</td>
                <td><span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill">{product.category || "N/A"}</span></td>
                <td><span className="badge bg-success bg-opacity-10 text-success rounded-pill"><i className="bi bi-check-circle me-1"></i>In Stock</span></td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-primary me-1" onClick={() => navigate(`/admin/products/${product.id}`)}>
                    <i className="bi bi-pencil me-1"></i>Edit
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(product)}>
                    <i className="bi bi-trash me-1"></i>Delete
                  </button>
                </td>
              </tr>
            ))}
            {(!products || products.length === 0) && (
              <tr>
                <td colSpan="5" className="text-center py-4 text-muted">
                  <i className="bi bi-inbox fs-3 d-block mb-2"></i>
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm delete modal */}
      <ConfirmModal
        show={!!deleteTarget}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name || ""}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setDeleting(true);
          try {
            await deleteProduct(deleteTarget.id);
            toast.success(`${deleteTarget.name} has been deleted`, { duration: 3000 });
          } catch (error) {
            toast.error(error.message || "Failed to delete product", { duration: 3000 });
            console.error("Error deleting product:", error.message);
          } finally {
            setDeleting(false);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
