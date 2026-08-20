import { useMemo } from "react";
import {
  hasActiveOffer,
  getEffectivePrice,
} from "@/utilsFunctions/productHelpers";

export function FinalReview({
  cartItems,
  products,
  allDeliveryOptions,
  shippingAddress,
  totalQuantity,
  onEditItems,
  onEditAddress,
}) {
  const productLookup = useMemo(
    () => products?.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}) || {},
    [products],
  );

  return (
    <div>
      <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
        <i className="bi bi-shield-check text-danger"></i>
        Review Your Order
      </h5>

      {/* Compact summary of items */}
      <div
        className="card border-0 shadow-sm mb-3"
        style={{ borderRadius: "16px" }}
      >
        <div className="card-body p-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="fw-bold mb-0" style={{ fontSize: "0.9rem" }}>
              <i className="bi bi-basket me-1 text-danger"></i>
              Items ({totalQuantity})
            </h6>
            <button
              className="btn btn-sm btn-link text-decoration-none p-0"
              onClick={onEditItems}
              style={{ fontSize: "0.8rem" }}
            >
              Edit
            </button>
          </div>
          {cartItems.map((item) => {
            const match = productLookup[item.id];
            if (!match) return null;

            const deliveryOpt = allDeliveryOptions?.find(
              (o) => o.id === item.DeliveryOption,
            );

            const isOffer = hasActiveOffer(match);
            const effectivePrice = getEffectivePrice(match);

            return (
              <div
                key={item.id}
                className="d-flex justify-content-between align-items-center py-1"
                style={{ fontSize: "0.85rem" }}
              >
                <span>
                  {isOffer && (
                    <span
                      className="offer-badge d-inline-block me-1"
                      style={{
                        position: "static",
                        display: "inline-block",
                        fontSize: "0.65rem",
                        padding: "1px 6px",
                      }}
                    >
                      -{match.offer}%
                    </span>
                  )}
                  {match.name}{" "}
                  <span className="text-muted">x{item.quantity}</span>
                </span>
                <div className="text-end">
                  <span className="fw-semibold d-block">
                    {isOffer && (
                      <span
                        className="text-decoration-line-through text-muted me-1"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {(match.price * item.quantity).toFixed(2)}
                      </span>
                    )}
                    {(effectivePrice * item.quantity).toFixed(2)} JD
                  </span>
                  {deliveryOpt && (
                    <span className="text-muted" style={{ fontSize: "0.7rem" }}>
                      +{" "}
                      {deliveryOpt.deliveryprice === 0
                        ? "FREE"
                        : `${deliveryOpt.deliveryprice.toFixed(2)} JD`}{" "}
                      shipping
                      {" • "}
                      {deliveryOpt.deliverydays}{" "}
                      {deliveryOpt.deliverydays === 1 ? "day" : "days"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipping summary — full address */}
      <div
        className="card border-0 shadow-sm mb-3"
        style={{ borderRadius: "16px" }}
      >
        <div className="card-body p-3">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <h6 className="fw-bold mb-0" style={{ fontSize: "0.9rem" }}>
              <i className="bi bi-geo-alt me-1 text-danger"></i>
              Shipping Address
            </h6>
            <button
              className="btn btn-sm btn-link text-decoration-none p-0"
              onClick={onEditAddress}
              style={{ fontSize: "0.8rem" }}
            >
              Edit
            </button>
          </div>
          {shippingAddress?.city ? (
            <div style={{ fontSize: "0.85rem" }}>
              <span className="fw-medium">{shippingAddress.city}</span>
              {shippingAddress.street && (
                <span>, {shippingAddress.street}</span>
              )}
              {shippingAddress.building_number && (
                <span>, {shippingAddress.building_number}</span>
              )}
              {shippingAddress.details && (
                <div
                  className="text-muted mt-1"
                  style={{ fontSize: "0.75rem" }}
                >
                  {shippingAddress.details}
                </div>
              )}
            </div>
          ) : (
            <p className="mb-0 text-muted" style={{ fontSize: "0.8rem" }}>
              No shipping address set
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FinalReview;
