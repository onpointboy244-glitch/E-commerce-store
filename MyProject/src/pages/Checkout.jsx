import { SteppedCheckout } from "../components/Checkout/SteppedCheckout";
import { CheckoutHeader } from "../components/Checkout/CheckoutHeader";
import { useProducts } from "../Hooks/useProducts";
import { useDeliveryOptions } from "../Hooks/useDeliveryOptions";
import { toast } from "sonner";
import "../styles/Checkout.css";

export function Checkout({ cartItems, setCartItems }) {
  const { data: products, isLoading: loadingProducts } = useProducts("all");
  const { data: allDeliveryOptions, isLoading: loadingDelivery } =
    useDeliveryOptions();
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleClearCart = () => {
    toast(
      <div className="d-flex align-items-center justify-content-between w-100 gap-3">
        <div>
          <p className="fw-semibold mb-1">Clear your cart?</p>
          <p className="mb-0" style={{ fontSize: "0.8rem", opacity: 0.7 }}>
            All {totalQuantity} item{totalQuantity > 1 ? "s" : ""} will be removed
          </p>
        </div>
        <div className="d-flex gap-2 flex-shrink-0">
          <button
            className="btn btn-sm btn-outline-secondary rounded-pill px-3"
            onClick={() => toast.dismiss()}
          >
            Keep
          </button>
          <button
            className="btn btn-sm btn-danger rounded-pill px-3"
            onClick={() => {
              setCartItems([]);
              toast.dismiss();
            }}
          >
            Clear
          </button>
        </div>
      </div>,
      { duration: 8000 },
    );
  };

  return (
    <>
      <title>Checkout</title>

      <CheckoutHeader totalQuantity={totalQuantity} />
      <div className="container pb-5">
        {loadingProducts ||
        loadingDelivery ||
        !products?.length ||
        !allDeliveryOptions?.length ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "300px" }}
          >
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="ms-3 mb-0 text-muted">Loading your cart...</p>
          </div>
        ) : (
          <SteppedCheckout
            cartItems={cartItems}
            setCartItems={setCartItems}
            products={products}
            allDeliveryOptions={allDeliveryOptions}
            totalQuantity={totalQuantity}
          />
        )}
      </div>

      {/* ── Floating Clear Cart ── */}
      {cartItems.length > 0 && (
        <button className="clear-cart-btn" onClick={handleClearCart} title="Clear cart">
          <i className="bi bi-trash3"></i>
        </button>
      )}
    </>
  );
}
