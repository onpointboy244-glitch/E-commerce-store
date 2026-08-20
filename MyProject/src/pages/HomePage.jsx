import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CategoryBar } from "../components/Products/CategoryBar";
import { Header } from "../components/Layout/Header";
import { ProductCard } from "../components/Products/ProductCard";
import { Hero } from "../components/Layout/Hero";
import { Features } from "../components/Layout/Features";
import { useProducts } from "../Hooks/useProducts";

export function HomePage({ cartItems, setCartItems }) {
  const [category, setCategory] = useState("food");
  const location = useLocation();
  const navigate = useNavigate();
  const { data: filteredProducts, isLoading: loading } = useProducts(category);
  const pendingTarget = useRef(null);
  const pendingCategory = useRef(null);

  // SearchBar on homepage calls this directly — no navigate needed
  const handleSearchSelect = useCallback((productId, productCategory) => {
    setCategory(productCategory);
    requestAnimationFrame(() => {
      const el = document.getElementById(`product-${productId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("highlite-active");
        setTimeout(() => el.classList.remove("highlite-active"), 3000);
      }
    });
  }, []);

  // When coming from another page via search, set category and scroll
  useEffect(() => {
    // Keep Shopping — scroll to products
    if (location.state?.scrollToProducts) {
      document.querySelector(".products-countaier")?.scrollIntoView({ behavior: "smooth", block: "start" });
      navigate(location.pathname, { replace: true, state: {} });
      return;
    }

    // Search selected from another page
    if (!location.state?.category) return;
    setCategory(location.state.category);
    pendingTarget.current = location.state.productId;
    pendingCategory.current = location.state.category;
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate]);

  // When products finish loading, scroll to pending target
  useEffect(() => {
    const id = pendingTarget.current;
    if (!id || !filteredProducts) return;

    // Don't scroll until the category has actually settled to match the target
    if (pendingCategory.current && pendingCategory.current !== category) return;

    pendingTarget.current = null;
    pendingCategory.current = null;

    const el = document.getElementById(`product-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("highlite-active");
      setTimeout(() => el.classList.remove("highlite-active"), 3000);
    }
  }, [filteredProducts, category]);

  const HandleAddtoCart = (id, qty) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === id
            ? { ...item, quantity: Number(item.quantity) + Number(qty) }
            : item,
        );
      }
      return [
        ...prevItems,
        { id, quantity: Number(qty) },
      ];
    });
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Header cartCount={totalItems} onSearchSelect={handleSearchSelect} />
      <Hero />
      <Features />

      <CategoryBar setCategory={setCategory} currentCategory={category} />

      <div className="container my-5">
        <div
          className="products-countaier row g-4"
          style={{ minHeight: "600px" }}
        >
          {loading || !filteredProducts?.length ? (
            <div
              className="col-12 d-flex flex-column align-items-center justify-content-center"
              style={{ minHeight: "400px" }}
            >
              <div
                className="spinner-border text-danger mb-3"
                role="status"
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  borderWidth: "3px",
                }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted small fw-bold text-uppercase letter-spacing-1">
                Discovering delicious bites...
              </p>
            </div>
          ) : (
            filteredProducts?.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={HandleAddtoCart}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
