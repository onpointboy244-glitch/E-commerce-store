import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartItemsReview } from "./CartItemsReview";
import { DeliveryStep } from "./DeliveryStep";
import { FinalReview } from "./FinalReview";
import { StepsIndicator } from "./StepsIndicator";
import { PaymentSummary } from "./PaymentSummary";
import "../../styles/SteppedCheckout.css";

export function SteppedCheckout({
  cartItems,
  setCartItems,
  products,
  allDeliveryOptions,
  totalQuantity,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState("forward");
  const [shippingAddress, setShippingAddress] = useState(null);
  const [validationError, setValidationError] = useState("");
  const navigate = useNavigate();

  // If cart is emptied on step 2 or 3, go back to step 1
  useEffect(() => {
    if (cartItems.length === 0 && currentStep > 1) {
      setDirection("backward");
      setCurrentStep(1);
      setValidationError("");
    }
  }, [cartItems.length]);

  const goToStep = (step) => {
    if (step >= 1 && step <= 3) {
      setDirection(step > currentStep ? "forward" : "backward");
      setCurrentStep(step);
      setValidationError("");
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      if (currentStep === 2) {
        const itemsMissingDelivery = cartItems.filter(
          (item) => !item.DeliveryOption,
        );
        if (itemsMissingDelivery.length > 0) {
          setValidationError(
            `Please choose a shipping method for all items (${itemsMissingDelivery.length} item${itemsMissingDelivery.length > 1 ? "s" : ""} missing).`,
          );
          return;
        }
        if (!shippingAddress?.city?.trim()) {
          setValidationError(
            "Please enter your shipping address (at least the city) before continuing.",
          );
          return;
        }
      }
      goToStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setValidationError("");
      goToStep(currentStep - 1);
    }
  };

  return (
    <div className="stepped-checkout-container">
      {/* ── Step Indicator ── */}
      <StepsIndicator currentStep={currentStep} onGoToStep={goToStep} />

      {/* ── Step Content ── */}
      <div className="row g-4">
        {/* Main content area */}
        <div className="col-12 col-lg-8">
          <div className="step-content">
            <div className={`step-content-inner ${direction}`} key={currentStep}>
              {currentStep === 1 && (
                <CartItemsReview
                  cartItems={cartItems}
                  setCartItems={setCartItems}
                  products={products}
                  totalQuantity={totalQuantity}
                  onKeepShopping={() =>
                    navigate("/", { state: { scrollToProducts: true } })
                  }
                />
              )}

              {currentStep === 2 && (
                <DeliveryStep
                  cartItems={cartItems}
                  setCartItems={setCartItems}
                  products={products}
                  allDeliveryOptions={allDeliveryOptions}
                  validationError={validationError}
                  shippingAddress={shippingAddress}
                  setShippingAddress={setShippingAddress}
                />
              )}

              {currentStep === 3 && (
                <FinalReview
                  cartItems={cartItems}
                  products={products}
                  allDeliveryOptions={allDeliveryOptions}
                  shippingAddress={shippingAddress}
                  totalQuantity={totalQuantity}
                  onEditItems={() => goToStep(1)}
                  onEditAddress={() => goToStep(2)}
                />
              )}
            </div>
          </div>

          {/* ── Navigation Buttons ── */}
          {currentStep === 1 && (
            <div className="step-actions" style={{ justifyContent: "flex-end" }}>
              <button className="btn-step-next" onClick={handleNext} disabled={cartItems.length === 0}>
                Continue to Delivery
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="step-actions">
              <button className="btn-step-back" onClick={handleBack}>
                <i className="bi bi-chevron-left"></i>
                Back to Items
              </button>
              <button className="btn-step-next" onClick={handleNext}>
                Continue to Review
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="step-actions" style={{ justifyContent: "flex-start" }}>
              <button className="btn-step-back" onClick={handleBack}>
                <i className="bi bi-chevron-left"></i>
                Back to Delivery
              </button>
            </div>
          )}
        </div>

        {/* ── Order Summary Sidebar ── */}
        <div className="col-12 col-lg-4">
          <PaymentSummary
            cartItems={cartItems}
            setCartItems={setCartItems}
            totalQuantity={totalQuantity}
            products={products}
            allDeliveryOptions={allDeliveryOptions}
            shippingAddress={shippingAddress}
            currentStep={currentStep}
          />
        </div>
      </div>
    </div>
  );
}

export default SteppedCheckout;
