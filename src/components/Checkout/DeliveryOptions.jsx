import { useEffect, useMemo } from "react";
import dayjs from "dayjs";
import "../../styles/DeliveryOptions.css";
export function DeliveryOptions({
  allDeliveryOptions,
  cartItems,
  productId,
  setCartItems,
}) {
  // نجد المنتج الحالي في السلة
  const currentItem = cartItems.find((item) => item.id === productId);

  // رتب الخيارات من الأرخص للأغلى
  const sortedOptions = useMemo(
    () =>
      allDeliveryOptions
        ?.slice()
        .sort((a, b) => a.deliveryprice - b.deliveryprice) || [],
    [allDeliveryOptions],
  );

  // ابحث عن الخيار الذي عليه علامة default
  const defaultOption = allDeliveryOptions?.find((o) => o.flag === "default");

  // إذا لم يكن للمنتج خيار توصيل محدد، أو كان الخيار المحدد محذوفاً، اختر الـ default
  useEffect(() => {
    if (!currentItem || sortedOptions.length === 0) return;
    const optionStillExists = sortedOptions.some((o) => o.id === currentItem.DeliveryOption);
    if (!currentItem.DeliveryOption || !optionStillExists) {
      const targetId = (defaultOption?.id) || sortedOptions[0].id;
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, DeliveryOption: targetId } : item,
        ),
      );
    }
  }, [currentItem, productId, sortedOptions, defaultOption, setCartItems]);

  // دالة لتحديث خيار التوصيل للمنتج المختار
  const updateDelivery = (optionId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, DeliveryOption: optionId } : item,
      ),
    );
  };

  if (!currentItem) return null;

  return (
    <div className="delivery-options-list">
      {sortedOptions.map((Option) => {
        const datestring = dayjs()
          .add(Option.deliverydays, "days")
          .format("dddd, MMMM D");

        const pricestring =
          Option.deliveryprice === 0
            ? "FREE"
            : `${Option.deliveryprice.toFixed(2)} JD`;

        const ischecked = currentItem.DeliveryOption === Option.id;

        const iconClass =
          Option.deliveryprice === 0
            ? "bi-truck"
            : "bi-lightning-charge-fill";

        return (
          <div
            key={Option.id}
            className={`delivery-option-card ${ischecked ? "active" : ""}`}
            onClick={() => updateDelivery(Option.id)}
          >
            <span className="days-hover-badge">
              {Option.deliverydays} {Option.deliverydays === 1 ? "day" : "days"}
            </span>
            <div className="option-icon">
              <i className={`bi ${iconClass}`}></i>
            </div>

            <input
              className="form-check-input"
              type="radio"
              name={`delivery-option-${productId}`}
              checked={ischecked}
              onChange={() => updateDelivery(Option.id)}
              readOnly
            />

            <label
              className="form-check-label w-100"
              style={{ cursor: "pointer", pointerEvents: "none" }}
            >
              <span
                className="d-block fw-bold text-dark mb-0"
                style={{ fontSize: "0.82rem" }}
              >
                {datestring}
              </span>
              <span
                className="text-muted d-flex justify-content-between align-items-center"
                style={{ fontSize: "0.7rem" }}
              >
                {Option.deliveryprice === 0
                  ? "Standard Shipping"
                  : "Express Shipping"}
                <span
                  className={`fw-bold ${Option.deliveryprice === 0 ? "text-success" : "text-dark"}`}
                >
                  {pricestring}
                </span>
              </span>
            </label>
          </div>
        );
      })}
    </div>
  );
}
