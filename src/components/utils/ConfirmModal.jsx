import { useEffect, useRef } from "react";

export function ConfirmModal({
  show,
  title = "Confirm",
  message = "Are you sure?",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "danger",
  icon = "bi-exclamation-triangle",
  onConfirm,
  onCancel,
  loading = false,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (show && confirmRef.current) {
      confirmRef.current.focus();
    }
  }, [show]);

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        onClick={loading ? undefined : onCancel}
      />

      {/* Modal */}
      <div
        className="position-fixed top-50 start-50 translate-middle"
        style={{ zIndex: 1051, width: "400px", maxWidth: "90vw" }}
      >
        <div className="card border-0 shadow-lg">
          <div className="card-body text-center p-4">
            <div
              className={`rounded-circle bg-${variant} bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-3`}
              style={{ width: 64, height: 64 }}
            >
              <i className={`bi ${icon} fs-2 text-${variant}`}></i>
            </div>

            <h5 className="fw-bold mb-1">{title}</h5>
            <p className="text-muted mb-4">{message}</p>

            <div className="d-flex gap-2 justify-content-center">
              <button
                className="btn btn-outline-secondary px-4"
                onClick={onCancel}
                disabled={loading}
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmRef}
                className={`btn btn-${variant} px-4`}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Deleting...
                  </>
                ) : (
                  confirmLabel
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ConfirmModal;
