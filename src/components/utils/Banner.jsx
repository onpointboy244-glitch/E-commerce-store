import { useProducts } from "../../Hooks/useProducts";
import { useDeliveryOptions } from "../../Hooks/useDeliveryOptions";
import "../../styles/banner.css";
export function Banner() {
  const { isUpdating: isUpdatingProduct, message: productMessage } =
    useProducts("all");
  const { isUpdating: isUpdatingDelivery, message: deliveryMessage } =
    useDeliveryOptions();

  const show = isUpdatingProduct || isUpdatingDelivery;

  return (
    <div
      id="live-update-banner"
      className={show ? "show-banner" : ""}
    >
      <div className="update-content">
        <i className="bi bi-megaphone-fill fs-1"></i>
        <div className="messages-stack">
          {isUpdatingProduct && (
            <div className="message-item">
              <span>{productMessage}</span>
              <i className="bi bi-exclamation-triangle-fill me-2 fs-2"></i>
            </div>
          )}
          {isUpdatingDelivery && (
            <div className="message-item">
              <span>{deliveryMessage}</span>
              <i className="bi bi-exclamation-triangle-fill me-2 fs-2"></i>
            </div>
          )}
        </div>
        <div
          className="spinner-border spinner-border-sm text-light"
          role="status"
        ></div>
      </div>
    </div>
  );
}

export default Banner;
