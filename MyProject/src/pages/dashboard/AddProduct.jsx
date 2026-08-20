import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { addProduct } from "../../utilsFunctions/adminApi";

export function AddProduct() {
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: "",
    price: "",
    category: "",
    image: "",
    description: "",
    offer: "",
    rating: "",
    offerEndsAt: "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product.name || !product.price) {
      toast.error("Name and price are required", { duration: 3000 });
      return;
    }

    setSaving(true);
    try {
      await addProduct({
        name: product.name,
        price: parseFloat(product.price),
        type: product.type || "",
        image: product.image || "",
        description: product.description || "",
        offer: product.offer ? parseFloat(product.offer) : 0,
        rating: product.rating ? parseFloat(product.rating) : 0,
        offerEndsAt: product.offerEndsAt || null,
      });
      toast.success(`${product.name} has been added`, { duration: 3000 });
      navigate("/admin/products");
    } catch (error) {
      console.error("Error adding product:", error.message);
      toast.error(error.message || "Failed to add product", { duration: 3000 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
            <h4 className="mb-0 fw-semibold">
              <i className="bi bi-plus-circle me-2 text-primary"></i>Add Product
            </h4>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate("/admin")}
            >
              <i className="bi bi-arrow-left me-1"></i>Back to Dashboard
            </button>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    Product Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    Price (JD) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    name="price"
                    value={product.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-medium">
                    Offer (%) <span className="text-muted small">(0 = no discount)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="form-control"
                    name="offer"
                    value={product.offer}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-medium">
                    Offer Until
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    name="offerEndsAt"
                    value={product.offerEndsAt}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Type</label>
                  <input
                    type="text"
                    className="form-control"
                    name="type"
                    value={product.type}
                    onChange={handleChange}
                    placeholder="food/sweet"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Rating</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    className="form-control"
                    name="rating"
                    value={product.rating}
                    onChange={handleChange}
                    placeholder="0 - 5"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Image URL</label>
                  <input
                    type="text"
                    className="form-control"
                    name="image"
                    value={product.image}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-medium">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    rows="3"
                    value={product.description}
                    onChange={handleChange}
                    placeholder="Brief description of the product..."
                  ></textarea>
                </div>
              </div>

              {/* Image preview */}
              {product.image && (
                <div className="mt-3">
                  <p className="small text-muted mb-1">Preview:</p>
                  <img
                    src={product.image}
                    alt="Preview"
                    className="rounded border"
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}

              <div className="d-flex gap-2 mt-4">
                <button
                  type="submit"
                  className="btn btn-primary px-4"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-lg me-2"></i>Add Product
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={() => navigate("/admin")}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddProduct;
