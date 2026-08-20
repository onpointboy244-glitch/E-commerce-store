import { useReducer } from "react";
import "../../styles/ProductCard.css";
import { ProductModal } from "./ProductModal";
import { reducer } from "../../state/ProductReducer";
import {
  hasActiveOffer,
  getEffectivePrice,
} from "@/utilsFunctions/productHelpers";

function RatingStars({ rating }) {
  if (!rating || rating <= 0) return null;
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < full)
      stars.push(
        <i
          key={i}
          className="bi bi-star-fill text-warning"
          style={{ fontSize: "0.75rem" }}
        ></i>,
      );
    else if (i === full && half)
      stars.push(
        <i
          key={i}
          className="bi bi-star-half text-warning"
          style={{ fontSize: "0.75rem" }}
        ></i>,
      );
    else
      stars.push(
        <i
          key={i}
          className="bi bi-star text-warning"
          style={{ fontSize: "0.75rem" }}
        ></i>,
      );
  }
  return (
    <div className="d-flex align-items-center gap-1 mb-1">
      {stars} <span className="small text-muted ms-1">({rating})</span>
    </div>
  );
}

export function ProductCard({ product, onAddToCart }) {
  const [state, dispatch] = useReducer(reducer, {
    isAdded: false,
    showModal: false,
    localQty: 1,
  });

  const isOffer = hasActiveOffer(product);
  const finalPrice = isOffer ? getEffectivePrice(product).toFixed(2) : null;

  const handleAddToCart = () => {
    onAddToCart(product.id, state.localQty);
    dispatch({ type: "SET_ADDED" });
    setTimeout(() => {
      dispatch({ type: "STOP" });
    }, 800);
  };

  return (
    <div
      className="col-12 col-sm-6 col-md-4 col-lg-3"
      id={`product-${product.id}`}
    >
      <div className="card h-100 product border-0 shadow-sm transition-all">
        <div
          className="info-icon-wrapper"
          title="View Details"
          onClick={() => dispatch({ type: "SHOW_MODAL" })}
        >
          <i className="bi bi-info-circle info-icon"></i>
        </div>
        {state.showModal && (
          <ProductModal
            product={product}
            onAddToCart={handleAddToCart}
            state={state}
            dispatch={dispatch}
          />
        )}
        <div className="product-image-container p-3">
          {isOffer && <div className="offer-badge">-{product.offer}%</div>}
          <img
            src={product.image}
            fetchPriority="high"
            className="card-img-top rounded"
            alt={product.name}
            width="150"
            height="150"
          />
        </div>
        <div className="card-body d-flex flex-column align-items-center pt-0 pb-3 px-3">
          <h6 className="card-title fw-bold text-dark text-center mb-1">
            {product.name}
          </h6>

          <RatingStars rating={product.rating} />

          {/* Modern Quantity Selector */}
          <div
            className="d-flex align-items-center justify-content-between mb-3 bg-light rounded-pill p-1 border shadow-sm"
            style={{ width: "110px" }}
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
                style={{ fontSize: "0.8rem" }}
              ></i>
            </button>
            <span className="fw-bold small">{state.localQty}</span>
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
              <i
                className="bi bi-plus-lg text-danger"
                style={{ fontSize: "0.8rem" }}
              ></i>
            </button>
          </div>

          <div className="h5 fw-bold text-danger mb-3">
            {isOffer ? (
              <>
                <span
                  className="text-decoration-line-through text-muted me-2"
                  style={{ fontSize: "0.9rem" }}
                >
                  {product.price}
                </span>
                {finalPrice}
              </>
            ) : (
              product.price
            )}
            <small className="text-muted" style={{ fontSize: "0.8rem" }}>
              JD
            </small>
          </div>
          <button
            className={`btn btn-dark w-100 add-product mt-auto ${state.isAdded ? "added-success" : ""}`}
            onClick={handleAddToCart}
          >
            <i
              className={`${state.isAdded ? "bi bi-check-circle-fill" : "bi bi-plus-lg me-1"}`}
            ></i>
            {state.isAdded ? " Added" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
