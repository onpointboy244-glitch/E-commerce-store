import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/Header.css";

export function CartIcon({ cartCount }) {
  const prevCartCount = useRef(cartCount);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    // إذا زاد العدد (إضافة للسلة)، نفعّل حالة الاهتزاز
    if (cartCount > prevCartCount.current) {
      prevCartCount.current = cartCount;
      setIsShaking(true);

      const timer = setTimeout(() => {
        setIsShaking(false);
      }, 700);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [cartCount]);

  return (
    <div className="cart-container">
      <Link
        to="/checkout"
        className="d-flex align-items-center text-decoration-none"
      >
        <i
          // التريك هنا: تغيير الـ key يضمن إعادة بناء الأيقونة وتشغيل الأنميشن من الصفر في كل تحديث
          key={cartCount}
          className={`bi bi-cart3 cart-icon ${isShaking ? "shake-cart" : ""}`}
          style={{ fontSize: "2.2rem" }}
        >
          <span className="counter js-cart-quantity">{cartCount || 0}</span>
        </i>
        <span className="mycarttext d-none d-sm-inline">Mycart</span>
      </Link>
    </div>
  );
}
