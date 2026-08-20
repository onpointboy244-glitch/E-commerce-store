import { useAuthUser } from "../../Hooks/useAuthUser";
import { useNavigate } from "react-router-dom";
import { usePlaceOrder } from "../../Hooks/usePlaceOrder";
import { getEffectivePrice } from "@/utilsFunctions/productHelpers";
import "../../styles/PaymentSummary.css";
export function PaymentSummary({
  cartItems,
  setCartItems,
  totalQuantity,
  products,
  allDeliveryOptions,
  shippingAddress,
  currentStep,
}) {
  const { data: authUser } = useAuthUser();
  const navigate = useNavigate();
  const { mutate: confirmAndPlaceOrder, isPending } = usePlaceOrder();

  const productLookup = products?.reduce(
    (acc, p) => ({ ...acc, [p.id]: p }),
    {},
  );

  const totalPrice = cartItems.reduce((sum, item) => {
    const product = productLookup[item.id];
    if (product) {
      return sum + getEffectivePrice(product) * item.quantity;
    }
    return sum;
  }, 0);

  // 1. الحصول على IDs خيارات التوصيل الفريدة المختارة في السلة
  const usedDeliveryOptionIds = [
    ...new Set(cartItems.map((item) => item.DeliveryOption)),
  ];

  // 2. حساب المجموع بناءً على الخيارات الفريدة فقط (Combined Shipping)
  const shipping = usedDeliveryOptionIds.reduce((sum, optionId) => {
    const deliveryOption = allDeliveryOptions?.find(
      (opt) => opt.id === optionId,
    );
    return sum + (deliveryOption ? deliveryOption.deliveryprice : 0);
  }, 0);
  // 3. حساب التوفير الناتج عن الشحن المجمع
  const perItemShipping = cartItems.reduce((sum, item) => {
    const opt = allDeliveryOptions?.find((o) => o.id === item.DeliveryOption);
    return sum + (opt?.deliveryprice ?? 0);
  }, 0);
  const shippingSavings = perItemShipping - shipping;

  // 4. تحديد ما إذا كان يجب إظهار بادج الخصم (إذا وُجد خيار غير مجاني مكرر لأكثر من منتج)
  const showDiscountBadge = shippingSavings > 0;

  const totalbeforetax = totalPrice + shipping;
  const tax = totalbeforetax * 0.1; // ضريبة 10%
  const orderTotal = totalPrice + shipping + tax;

  const handlePlaceOrder = () => {
    if (!authUser) {
      navigate("/user");
      return;
    }

    const cartItemsForServer = cartItems.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      deliveryOptionId: item.DeliveryOption,
    }));

    const orderData = {
      cartItems: cartItemsForServer,
      shippingAddress:
        shippingAddress?.city ||
        shippingAddress?.street ||
        shippingAddress?.building_number
          ? shippingAddress
          : undefined,
    };

    // Submit directly — usePlaceOrder handles loading/success/error toasts + navigation
    confirmAndPlaceOrder(orderData, {
      onSuccess: () => {
        localStorage.removeItem("cartItems");
        sessionStorage.removeItem("checkout_shipping_address");
        setCartItems([]);
      },
    });
  };

  return (
    <div
      className="card price-card-sticky border-0"
      style={{ position: "sticky", top: "90px", alignSelf: "flex-start" }}
    >
      <div className="card-header bg-transparent border-0 pt-3 px-4">
        <h5 className="summary-title fw-bold mb-0">Order Summary</h5>
      </div>

      <div className="card-body px-3 pb-2">
        {/* Items Section */}
        <div className="price-row d-flex justify-content-between align-items-center">
          <span className="text-muted small">Items ({totalQuantity})</span>
          <span key={totalPrice} className="fw-bold second">
            {totalPrice.toFixed(2)} JD
          </span>
        </div>

        <div className="price-row d-flex justify-content-between align-items-center">
          <span className="text-muted small">Shipping & Handling</span>
          <span key={shipping} className="fw-bold second">
            {shipping.toFixed(2)} JD
          </span>
        </div>

        {/* Shipping Discount Badge */}
        <div
          className={`shipping-discount-badge p-2 mb-3 align-items-center justify-content-center ${showDiscountBadge ? "visible" : ""}`}
        >
          <small
            className="text-success fw-bold d-flex align-items-center gap-1"
            style={{ fontSize: "0.75rem" }}
          >
            <i className="bi bi-patch-check-fill"></i>
            Combined shipping: saved {shippingSavings.toFixed(2)} JD
          </small>
        </div>

        {/* Tax Section */}
        <div className="price-row d-flex justify-content-between align-items-center">
          <span className="text-muted small">Total before tax</span>
          <span key={totalbeforetax} className="fw-bold second">
            {totalbeforetax.toFixed(2)} JD
          </span>
        </div>

        <div className="price-row d-flex justify-content-between align-items-center mb-3">
          <span className="text-muted small">Estimated Tax (10%)</span>
          <span key={tax} className="fw-bold second">
            {tax.toFixed(2)} JD
          </span>
        </div>

        {/* Total Section */}
        <div className="total-section d-flex justify-content-between align-items-center">
          <span className="total-label fw-bold">Order Total</span>
          <span key={orderTotal} className="total-price fw-bold second">
            {orderTotal.toFixed(2)} JD
          </span>
        </div>

        {/* Action Button */}
        <button
          className={`btn w-100 py-2 fw-bold rounded-pill place-order-btn text-white ${!authUser ? "btn-signin" : isPending || cartItems.length === 0 || (currentStep && currentStep < 3) ? "opacity-75" : ""}`}
          onClick={handlePlaceOrder}
          disabled={
            isPending ||
            (authUser && cartItems.length === 0) ||
            (authUser && currentStep && currentStep < 3)
          }
          title={
            currentStep && currentStep < 3
              ? "Review your order in step 3 to place it"
              : ""
          }
        >
          <div className="d-flex align-items-center justify-content-center gap-2">
            {isPending ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
              ></span>
            ) : (
              <i className="bi bi-shield-lock-fill"></i>
            )}
            <span>
              {isPending
                ? "Processing..."
                : authUser
                  ? cartItems.length === 0
                    ? "Cart is Empty"
                    : currentStep && currentStep < 3
                      ? "Review in Step 3"
                      : "Place Order"
                  : "Sign in to Order"}
            </span>
          </div>
        </button>

        <p
          className="text-center text-muted mt-3 mb-0"
          style={{ fontSize: "0.7rem", opacity: 0.8 }}
        >
          <i className="bi bi-lock-fill me-1"></i>
          Encrypted Secure Checkout
        </p>
      </div>
    </div>
  );
}
