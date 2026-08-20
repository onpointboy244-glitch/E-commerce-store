export const STEPS = [
  { number: 1, title: "Review Items", subtitle: "Check your cart" },
  { number: 2, title: "Delivery & Address", subtitle: "Where and how" },
  { number: 3, title: "Review & Pay", subtitle: "Final step" },
];

export function StepsIndicator({ currentStep, onGoToStep }) {
  return (
    <div className="steps-indicator">
      {STEPS.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;

        return (
          <div key={step.number} className="d-flex align-items-center">
            <div className="step-item">
              <div
                className={`step-circle ${
                  isCompleted
                    ? "completed cursor-pointer"
                    : isActive
                      ? "active"
                      : "inactive"
                }`}
                onClick={() => isCompleted && onGoToStep(step.number)}
                role={isCompleted ? "button" : undefined}
                tabIndex={isCompleted ? 0 : undefined}
                onKeyDown={
                  isCompleted
                    ? (e) => e.key === "Enter" && onGoToStep(step.number)
                    : undefined
                }
                title={isCompleted ? `Go back to ${step.title}` : step.title}
              >
                {isCompleted ? (
                  <i
                    className="bi bi-check-lg"
                    style={{ fontSize: "1rem" }}
                  ></i>
                ) : (
                  step.number
                )}
              </div>
              <div className="step-label">
                <span className="step-title">{step.title}</span>
                <span className="step-subtitle">{step.subtitle}</span>
              </div>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`step-connector ${
                  currentStep > step.number ? "completed" : ""
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default StepsIndicator;
