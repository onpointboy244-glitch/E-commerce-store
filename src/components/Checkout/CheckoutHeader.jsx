import { Link } from "react-router-dom";
import { Profile } from "../Layout/Profile";

export function CheckoutHeader({ totalQuantity }) {
  return (
    <header className="checkout-header">
      <div className="checkout-header-inner container">
        <Link className="checkout-logo-link" to="/" aria-label="Back to home">
          <img
            src="images/kitchen.png"
            alt="Logo"
            width="44"
            height="44"
            className="checkout-logo"
            style={{ filter: "invert(1)" }}
          />
        </Link>

        <div className="checkout-title-group">
          <h1 className="checkout-heading">Checkout</h1>
          {totalQuantity > 0 && (
            <span className="checkout-count" aria-live="polite">
              {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        <div className="checkout-profile">
          <Profile />
        </div>
      </div>
    </header>
  );
}
