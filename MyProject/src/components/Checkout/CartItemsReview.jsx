import { useMemo } from "react";
import { toast } from "sonner";
import {
  hasActiveOffer,
  getEffectivePrice,
} from "@/utilsFunctions/productHelpers";

export function CartItemsReview({
  cartItems,
  setCartItems,
  products,
  onKeepShopping,
}) {
  const productLookup = useMemo(
    () => products?.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}) || {},
    [products],
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
          <i className="bi bi-basket text-danger"></i>
          Shopping Cart
        </h5>
        <button
          className="btn btn-sm d-flex align-items-center gap-1 rounded-pill btn-keep-shopping"
          onClick={onKeepShopping}
        >
          <i className="bi bi-plus-lg"></i>
          {cartItems.length === 0 ? "Start Shopping" : "Keep Shopping"}
        </button>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-5">
          <i
            className="bi bi-cart-x text-muted"
            style={{ fontSize: "3rem" }}
          ></i>
          <h6 className="mt-3 text-secondary">Your cart is empty</h6>
          <p className="text-muted small">
            Add some delicious items to your cart!
          </p>
        </div>
      ) : (
        cartItems.map((item) => {
          const match = productLookup[item.id];
          if (!match) return null;

          const isOffer = hasActiveOffer(match);
          const effectivePrice = getEffectivePrice(match);

          return (
            <div
              key={item.id}
              className="card mb-2 border-0 shadow-sm position-relative"
              style={{ borderRadius: "12px", overflow: "hidden" }}
            >
              {isOffer && (
                <div
                  className="offer-badge"
                  style={{
                    top: "8px",
                    left: "8px",
                    fontSize: "0.75rem",
                    padding: "3px 10px",
                  }}
                >
                  -{match.offer}%
                </div>
              )}
              <div className="card-body p-2 px-3">
                <div className="row g-2 align-items-center">
                  {/* Image */}
                  <div className="col-3 col-md-2">
                    <img
                      src={match.image}
                      alt={match.name}
                      className="w-100 rounded"
                      style={{
                        aspectRatio: "1",
                        objectFit: "cover",
                      }}
                    />
                  </div>

                  {/* Name + price */}
                  <div className="col-4 col-md-3">
                    <span
                      className="fw-semibold d-block"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {match.name}
                    </span>
                    <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                      {isOffer ? (
                        <>
                          <span className="text-decoration-line-through me-1">
                            {match.price.toFixed(2)}
                          </span>
                          <span className="text-danger fw-semibold">
                            {effectivePrice.toFixed(2)} JD
                          </span>
                        </>
                      ) : (
                        <>{match.price.toFixed(2)} JD</>
                      )}
                    </span>
                  </div>

                  {/* Delete button */}
                  <div className="col-2 col-md-2 text-center">
                    <button
                      className="btn btn-sm border-0 d-flex align-items-center gap-1 mx-auto btn-delete-item"
                      onClick={() => {
                        const removedItem = item;
                        const removedName = match.name;
                        setCartItems((prev) =>
                          prev.filter((ci) => ci.id !== item.id),
                        );
                        toast(
                          <div className="d-flex align-items-center justify-content-between w-100 gap-3">
                            <span style={{ fontSize: "0.85rem" }}>
                              Removed {removedItem.quantity}x {removedName}
                            </span>
                            <button
                              className="btn btn-sm btn-danger rounded-pill px-3 fw-semibold"
                              onClick={() => {
                                setCartItems((prev) => [...prev, removedItem]);
                                toast.dismiss();
                              }}
                            >
                              Undo
                            </button>
                          </div>,
                          { duration: 5000 },
                        );
                      }}
                      title="Remove"
                    >
                      <i
                        className="bi bi-trash3-fill"
                        style={{ fontSize: "0.75rem" }}
                      ></i>
                      <span className="d-none d-sm-inline">Delete</span>
                    </button>
                  </div>

                  {/* Qty controls */}
                  <div className="col-3 col-md-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-pill border"
                      style={{ maxWidth: "120px", padding: "2px 0" }}
                    >
                      <button
                        className="qty-pill-btn btn btn-sm border-0 px-2"
                        onClick={() =>
                          setCartItems((prev) =>
                            prev.map((ci) =>
                              ci.id === item.id
                                ? {
                                    ...ci,
                                    quantity: Math.max(1, ci.quantity - 1),
                                  }
                                : ci,
                            ),
                          )
                        }
                        disabled={item.quantity <= 1}
                      >
                        <i
                          className={`bi bi-dash-lg ${item.quantity <= 1 ? "text-muted" : "text-dark"}`}
                          style={{ fontSize: "0.85rem" }}
                        ></i>
                      </button>
                      <span
                        className="fw-bold"
                        style={{
                          fontSize: "1rem",
                          minWidth: "24px",
                          textAlign: "center",
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        className="qty-pill-btn btn btn-sm border-0 px-2"
                        onClick={() =>
                          setCartItems((prev) =>
                            prev.map((ci) =>
                              ci.id === item.id
                                ? {
                                    ...ci,
                                    quantity: Math.min(10, ci.quantity + 1),
                                  }
                                : ci,
                            ),
                          )
                        }
                      >
                        <i
                          className="bi bi-plus-lg text-danger"
                          style={{ fontSize: "0.85rem" }}
                        ></i>
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="col-2 text-end">
                    <div
                      className="fw-bold"
                      style={{ fontSize: "0.85rem", color: "#1a1a1a" }}
                    >
                      {(effectivePrice * item.quantity).toFixed(2)}
                    </div>
                    <span
                      className="text-muted"
                      style={{ fontSize: "0.65rem" }}
                    >
                      JD
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default CartItemsReview;
