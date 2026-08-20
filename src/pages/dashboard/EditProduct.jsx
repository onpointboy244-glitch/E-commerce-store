import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseconfig";
import { toast } from "sonner";
import { updateProduct } from "../../utilsFunctions/adminApi";

export function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: "",
    price: 0,
    category: "",
    image: "",
    description: "",
    offer: 0,
    rating: 0,
    offerEndsAt: null,
  });
  const [loading, setLoading] = useState(true);

  // Load product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const today = new Date().toISOString().split("T")[0];
          const isOfferExpired =
            snap.data().offer > 0 &&
            snap.data().offerEndsAt &&
            new Date() >= new Date(snap.data().offerEndsAt);

          setProduct({
            ...snap.data(),
            // Ensure fields exist for the form
            name: snap.data().name || "",
            price: snap.data().price || 0,
            category: snap.data().category || "",
            image: snap.data().image || "",
            description: snap.data().description || "",
            // Auto-reset expired offer so the form shows clean defaults
            offer: isOfferExpired ? 0 : snap.data().offer || 0,
            rating: snap.data().rating || 0,
            offerEndsAt: isOfferExpired ? today : snap.data().offerEndsAt || "",
          });
        } else {
          toast.error("Product not found", { duration: 3000 });
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product", { duration: 3000 });
        navigate("/admin/products");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ["price", "offer", "rating"];
    setProduct((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateProduct(id, {
        name: product.name,
        price: product.price,
        type: product.type,
        image: product.image,
        description: product.description,
        offer: product.offer,
        rating: product.rating,
        offerEndsAt: product.offerEndsAt || null,
      });
      toast.success("Product updated", { duration: 3000 });
      navigate("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error.message);
      toast.error(error.message || "Failed to update product", { duration: 3000 });
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Edit Product</h2>
      <form onSubmit={handleSave} className="mt-3">
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Price (JD)</label>
          <input
            type="number"
            step="0.01"
            className="form-control"
            name="price"
            value={product.price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Category</label>
          <input
            type="text"
            className="form-control"
            name="type"
            value={product.type}
            onChange={handleChange}
            placeholder="food / sweet"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Image URL</label>
          <input
            type="text"
            className="form-control"
            name="image"
            value={product.image}
            onChange={handleChange}
          />
          {product.image && (
            <img
              src={product.image}
              alt="Preview"
              className="mt-2 rounded border"
              style={{ width: "80px", height: "80px", objectFit: "cover" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            name="description"
            rows="3"
            value={product.description}
            onChange={handleChange}
            placeholder="Brief description of the product..."
          />
        </div>
        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Offer (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              className="form-control"
              name="offer"
              value={product.offer}
              onChange={handleChange}
              placeholder="0 (no discount)"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Offer Until</label>
            <input
              type="date"
              className="form-control"
              name="offerEndsAt"
              value={product.offerEndsAt || ""}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Rating</label>
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
        </div>
        <button type="submit" className="btn btn-primary me-2">
          Save
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/admin")}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

export default EditProduct;
