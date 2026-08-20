import { Link, useLocation, useSearchParams } from "react-router-dom";
import "../../styles/mobileview.css";

export function MobileBottomNav({ cartItems }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const totalItems = cartItems?.reduce((sum, item) => sum + item.quantity, 0);

  const isActive = (path) => location.pathname === path;

  // التحقق إذا كان المسار هو الطلبات وبدون فلتر "تم التوصيل"
  const isOrdersActive =
    location.pathname === "/orders" &&
    searchParams.get("filter") !== "delivered";

  return (
    <div className="mobile-bottom-nav">
      <Link to="/" className={`nav-item ${isActive("/") ? "active" : ""}`}>
        <i className="bi bi-house-door"></i>
        <span>Home</span>
      </Link>
      <Link
        to="/orders"
        className={`nav-item ${isOrdersActive ? "active" : ""}`}
      >
        <i className="bi bi-bag-check"></i>
        <span>Orders</span>
      </Link>

      <Link
        to="/checkout"
        className={`nav-item ${isActive("/checkout") ? "active" : ""}`}
      >
        <i className="bi bi-cart3 cart-icon">
          <span className="counter">{totalItems}</span>
        </i>
        <span>Cart</span>
      </Link>
    </div>
  );
}
