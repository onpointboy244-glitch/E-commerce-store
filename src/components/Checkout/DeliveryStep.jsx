import { useState, useEffect, useRef, useMemo } from "react";
import { DeliveryOptions } from "./DeliveryOptions";
import { ShippingAddress } from "./ShippingAddress";

export function DeliveryStep({
  cartItems,
  setCartItems,
  products,
  allDeliveryOptions,
  validationError,
  setShippingAddress,
}) {
  const [syncDelivery, setSyncDelivery] = useState(false);
  const lastSyncedOption = useRef(null);
  const errorRef = useRef(null);

  // Scroll validation error into view when it appears
  useEffect(() => {
    if (validationError && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [validationError]);

  const productLookup = useMemo(
    () => products?.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}) || {},
    [products],
  );

  const applyDeliveryToAll = () => {
    const firstOption = cartItems.find((item) => item.DeliveryOption);
    if (!firstOption) return;
    const optionId = firstOption.DeliveryOption;
    lastSyncedOption.current = optionId;
    setCartItems((prev) =>
      prev.map((item) => ({ ...item, DeliveryOption: optionId })),
    );
  };

  // Sync: when syncDelivery is on, keep all items on the same option.
  // Detects which item the user just changed and syncs the rest to match.
  useEffect(() => {
    if (!syncDelivery) return;

    // Find an item whose option differs from our last synced snapshot
    const changed = cartItems.find(
      (item) =>
        item.DeliveryOption &&
        item.DeliveryOption !== lastSyncedOption.current,
    );
    if (!changed) return;

    // Sync all items to the changed item's option
    lastSyncedOption.current = changed.DeliveryOption;
    setCartItems((prev) =>
      prev.map((item) => ({ ...item, DeliveryOption: changed.DeliveryOption })),
    );
  }, [syncDelivery, cartItems, setCartItems]);

  return (
    <div>
      <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
        <i className="bi bi-truck text-danger"></i>
        Delivery Details
      </h5>

      {/* ── Validation Error ── */}
      {validationError && (
        <div
          ref={errorRef}
          className="d-flex align-items-center gap-2 py-2 px-3 mb-3"
          style={{
            fontSize: "0.85rem",
            borderRadius: "12px",
            border: "none",
            backgroundColor: "rgba(216, 36, 5, 0.06)",
            color: "#b31f04",
          }}
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>{validationError}</span>
        </div>
      )}

      {/* ── Address section (top) ── */}
      <div className="step2-address-card mb-4">
        <ShippingAddress onAddressChange={setShippingAddress} />
      </div>

      {/* ── Delivery options section (bottom) ── */}
      <div className="step2-delivery-section">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-box-seam text-danger"></i>
            Shipping Method
          </h6>
          {cartItems.length > 1 && (
            <button
              className="btn btn-sm d-flex align-items-center gap-1 rounded-pill"
              onClick={() => {
                setSyncDelivery((prev) => !prev);
                if (!syncDelivery) applyDeliveryToAll();
              }}
              style={{
                fontSize: "0.72rem",
                color: syncDelivery ? "#fff" : "#d82405",
                backgroundColor: syncDelivery
                  ? "#d82405"
                  : "rgba(216, 36, 5, 0.06)",
                border: `1px solid ${syncDelivery ? "#d82405" : "rgba(216, 36, 5, 0.15)"}`,
                padding: "3px 10px",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
            >
              <i className="bi bi-link-45deg"></i>
              {syncDelivery ? "Syncing" : "Same for All"}
            </button>
          )}
        </div>

        <p className="text-muted mb-3" style={{ fontSize: "0.8rem" }}>
          {syncDelivery
            ? "Change any item's shipping method and all items will update to match"
            : "Choose a shipping method for each item"}
        </p>

        <div className="step2-items-grid">
          {cartItems.map((item) => {
            const match = productLookup[item.id];
            if (!match) return null;
            return (
              <div key={item.id} className="step2-item-card">
                <div className="step2-item-header">
                  <img
                    src={match.image}
                    alt={match.name}
                    className="step2-item-img"
                  />
                  <div className="step2-item-info">
                    <span className="step2-item-name">{match.name}</span>
                    <span className="step2-item-price">
                      {match.price.toFixed(2)} JD
                    </span>
                  </div>
                  <span className="step2-item-qty">x{item.quantity}</span>
                </div>
                <div className="step2-item-delivery">
                  <DeliveryOptions
                    allDeliveryOptions={allDeliveryOptions}
                    cartItems={cartItems}
                    productId={item.id}
                    setCartItems={setCartItems}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DeliveryStep;
