import { createPortal } from "react-dom";
import "../../styles/ProductCard.css";
import {
  hasActiveOffer,
  getEffectivePrice,
} from "@/utilsFunctions/productHelpers";

function ModalRatingStars({ rating }) {
  if (!rating || rating <= 0) return null;
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < full)
      stars.push(<i key={i} className="bi bi-star-fill text-warning"></i>);
    else if (i === full && half)
      stars.push(<i key={i} className="bi bi-star-half text-warning"></i>);
    else stars.push(<i key={i} className="bi bi-star text-warning"></i>);
  }
  return (
    <div className="d-flex align-items-center gap-1 mb-2">
      {stars} <span className="text-muted ms-1">({rating})</span>
    </div>
  );
}

export function ProductModal({ product, onAddToCart, state, dispatch }) {
  if (!product) return null;

  const isOffer = hasActiveOffer(product);
  const finalPrice = isOffer ? getEffectivePrice(product).toFixed(2) : null;

  return createPortal(
    <div
      className="product-modal-overlay"
      onClick={() => dispatch({ type: "HIDE_MODAL" })}
    >
      <div className="product-modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-btn"
          onClick={() => dispatch({ type: "HIDE_MODAL" })}
        >
          <i className="bi bi-x-lg"></i>
        </button>
        <div className="modal-body-content">
          <div className="modal-image-section">
            {isOffer && (
              <div className="offer-badge offer-badge-modal">
                -{product.offer}%
              </div>
            )}
            <img src={product.image} alt={product.name} />
          </div>
          <div className="modal-info-section">
            <h2 className="modal-product-title">{product.name}</h2>
            <ModalRatingStars rating={product.rating} />
            <p className="modal-product-price">
              {isOffer ? (
                <>
                  <span
                    className="text-decoration-line-through text-muted me-2"
                    style={{ fontSize: "1.2rem", fontWeight: 500 }}
                  >
                    {product.price} JD
                  </span>
                  {finalPrice} JD
                </>
              ) : (
                <>{product.price} JD</>
              )}
            </p>
            <div className="modal-divider"></div>
            <p className="modal-product-description">
              {product.description ||
                "Discover the authentic taste of our special recipe, prepared with the finest ingredients to ensure a delicious experience in every bite."}
            </p>
            <div className="modal-footer-logic">
              <div className="d-flex align-items-center gap-3 mt-4">
                {/* Modern Quantity Selector for Modal */}
                <div
                  className="d-flex align-items-center justify-content-between bg-light rounded-pill p-2 border shadow-sm"
                  style={{ width: "130px", height: "50px" }}
                >
                  <button
                    className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center p-0 border-0 bg-white shadow-sm qty-pill-btn"
                    style={{ width: "26px", height: "26px" }}
                    onClick={() =>
                      dispatch({
                        type: "SET_QTY",
                        payload: { quantity: state.localQty - 1 },
                      })
                    }
                    disabled={state.localQty <= 1}
                  >
                    <i
                      className={`bi bi-dash-lg ${state.localQty <= 1 ? "text-muted" : "text-dark"}`}
                    ></i>
                  </button>
                  <span className="fw-bold fs-5">{state.localQty}</span>
                  <button
                    className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center p-0 border-0 bg-white shadow-sm qty-pill-btn"
                    style={{ width: "26px", height: "26px" }}
                    onClick={() =>
                      dispatch({
                        type: "SET_QTY",
                        payload: { quantity: state.localQty + 1 },
                      })
                    }
                    disabled={state.localQty >= 10}
                  >
                    <i className="bi bi-plus-lg text-danger"></i>
                  </button>
                </div>

                <button
                  className={`btn btn-dark w-100 add-product mt-auto ${state.isAdded ? "added-success" : ""}`}
                  onClick={onAddToCart}
                >
                  <i
                    className={`${state.isAdded ? "bi bi-check-circle-fill" : "bi bi-plus-lg me-1"}`}
                  ></i>
                  {state.isAdded ? (
                    " Added"
                  ) : (
                    <>
                      Add to cart
                      <span className="ms-2 ps-2 border-start border-secondary text-danger fw-bold">
                        {(getEffectivePrice(product) * state.localQty).toFixed(
                          2,
                        )}
                        <small className="ms-1" style={{ fontSize: "0.7rem" }}>
                          JD
                        </small>
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
