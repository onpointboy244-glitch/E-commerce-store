import { useState, useEffect, useRef } from "react";
import { useAuthUser } from "../../Hooks/useAuthUser";
import { useSaveProfileAddress } from "../../Hooks/useSaveProfileAddress";
import { toast } from "sonner";
import "../../styles/ShippingAddress.css";

const STORAGE_KEY = "checkout_shipping_address";

const loadAddressFromStorage = (userId) => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    // If stored data is tagged with a userId and it doesn't match the
    // current user, it's stale data from a previous session — ignore it.
    if (parsed.userId && parsed.userId !== userId) return null;
    // Unwrap new { address, userId } format; accept old bare-address format.
    return parsed.address || parsed;
  } catch {
    return null;
  }
};

const saveAddressToStorage = (addr, userId) => {
  try {
    const payload = userId ? { address: addr, userId } : addr;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* sessionStorage may be full or unavailable */
  }
};

export function ShippingAddress({ onAddressChange }) {
  const { data: authUser } = useAuthUser();
  const { mutate: saveAddress, isPending: savingAddress } =
    useSaveProfileAddress();
  const hasShownToast = useRef(false);
  const initialised = useRef(false);

  const emptyAddress = { city: "", street: "", building_number: "", details: "" };

  const [address, setAddress] = useState(emptyAddress);
  const [savedProfileAddress, setSavedProfileAddress] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // 1. Load/re-sync address from profile
  useEffect(() => {
    if (!authUser) return;

    const profileAddr = authUser.address
      ? {
          city: authUser.address.city || "",
          street: authUser.address.street || "",
          building_number: authUser.address.building_number || "",
          details: authUser.address.details || "",
        }
      : { ...emptyAddress };

    if (!initialised.current) {
      // ── First mount ──
      initialised.current = true;
      const storedAddress = loadAddressFromStorage(authUser?.uid);
      if (
        storedAddress &&
        Object.keys(emptyAddress).some(
          (k) => (storedAddress[k] || "") !== (profileAddr[k] || ""),
        )
      ) {
        // Stored address differs from profile → user customized → keep it
        setAddress(storedAddress);
        setSavedProfileAddress(profileAddr);
        return;
      }
      setAddress(profileAddr);
      setSavedProfileAddress(profileAddr);
    } else if (savedProfileAddress) {
      // ── Re-sync: profile data changed (e.g. EditProfile saved) ──
      const storedAddress = loadAddressFromStorage(authUser?.uid);
      // Only skip if stored data differs from the OLD profile snapshot
      // (meaning the user manually edited during checkout)
      if (
        storedAddress &&
        Object.keys(emptyAddress).some(
          (k) => (storedAddress[k] || "") !== (savedProfileAddress[k] || ""),
        )
      ) {
        return; // user customized → keep their edits
      }
      // Not customized (or no stored data) → sync with new profile
      setAddress(profileAddr);
      setSavedProfileAddress(profileAddr);
    }
  }, [authUser]);

  // 2. Report address up to parent (on every change)
  useEffect(() => {
    onAddressChange?.(address);
  }, [address, onAddressChange]);

  const handleChange = (field, value) => {
    setAddress((prev) => {
      const next = { ...prev, [field]: value };
      saveAddressToStorage(next, authUser?.uid);
      return next;
    });
  };

  const handleSaveLocal = () => {
    setIsEditing(false);
    saveAddressToStorage(address, authUser?.uid);
    onAddressChange?.(address);

    // If user is logged in + address differs from saved → ask about profile
    if (!authUser || !savedProfileAddress) return;

    const changed = Object.keys(emptyAddress).some(
      (k) => address[k] !== savedProfileAddress[k],
    );

    if (changed && !hasShownToast.current) {
      hasShownToast.current = true;
      toast(
        <div>
          <p className="mb-2 fw-semibold" style={{ fontSize: "0.9rem" }}>
            Save this address to your profile?
          </p>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-danger"
              onClick={() => {
                saveAddress({ userId: authUser.uid, address });
                sessionStorage.removeItem(STORAGE_KEY);
                toast.dismiss();
                hasShownToast.current = false;
              }}
              disabled={savingAddress}
            >
              {savingAddress ? "Saving..." : "Yes, Save"}
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                toast.dismiss();
                hasShownToast.current = false;
              }}
            >
              Just This Once
            </button>
          </div>
        </div>,
        { duration: 8000 },
      );
    }
  };

  const handleCancelEdit = () => {
    if (savedProfileAddress) {
      setAddress({ ...savedProfileAddress });
      saveAddressToStorage(savedProfileAddress, authUser?.uid);
    } else {
      setAddress({ ...emptyAddress });
      saveAddressToStorage(emptyAddress, authUser?.uid);
    }
    setIsEditing(false);
  };

  if (!authUser) {
    return (
      <div className="shipping-address-card">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-geo-alt text-muted"></i>
          <p className="mb-0 text-muted small">
            <a href="/user" className="text-danger text-decoration-none fw-semibold">
              Sign in
            </a>{" "}
            to add a shipping address
          </p>
        </div>
      </div>
    );
  }

  const hasAddress =
    address.city || address.street || address.building_number;

  return (
    <div className="shipping-address-card">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
          <i className="bi bi-geo-alt-fill text-danger"></i>
          Shipping Address
        </h6>
        {!isEditing && (
          <button
            className="btn btn-sm btn-outline-secondary rounded-pill"
            onClick={() => setIsEditing(true)}
            style={{ fontSize: "0.75rem" }}
          >
            <i className="bi bi-pencil"></i>{" "}
            {hasAddress ? "Edit" : "Add"}
          </button>
        )}
      </div>

      {isEditing ? (
        <div>
          <div className="row g-2">
            <div className="col-6">
              <label className="form-label text-muted mb-1" style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.3px", textTransform: "uppercase" }}>
                City
              </label>
              <input
                className="form-control form-control-sm"
                placeholder="e.g. Amman"
                value={address.city}
                onChange={(e) => handleChange("city", e.target.value)}
              />
            </div>
            <div className="col-6">
              <label className="form-label text-muted mb-1" style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.3px", textTransform: "uppercase" }}>
                Building No.
              </label>
              <input
                className="form-control form-control-sm"
                placeholder="e.g. 25"
                value={address.building_number}
                onChange={(e) =>
                  handleChange("building_number", e.target.value)
                }
              />
            </div>
            <div className="col-12">
              <label className="form-label text-muted mb-1" style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.3px", textTransform: "uppercase" }}>
                Street
              </label>
              <input
                className="form-control form-control-sm"
                placeholder="e.g. King Abdullah II St."
                value={address.street}
                onChange={(e) => handleChange("street", e.target.value)}
              />
            </div>
            <div className="col-12">
              <label className="form-label text-muted mb-1" style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.3px", textTransform: "uppercase" }}>
                Details <span className="fw-normal" style={{ opacity: 0.5 }}>(optional)</span>
              </label>
              <input
                className="form-control form-control-sm"
                placeholder="e.g. 2nd floor, apt 5"
                value={address.details}
                onChange={(e) => handleChange("details", e.target.value)}
              />
            </div>
          </div>
          <div className="mt-2 d-flex gap-2">
            <button
              className="btn btn-sm btn-danger rounded-pill px-3"
              onClick={handleSaveLocal}
            >
              <i className="bi bi-check-lg"></i> Save
            </button>
            <button
              className="btn btn-sm btn-outline-secondary rounded-pill px-3"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="address-display text-muted">
          {hasAddress ? (
            <>
              <span className="fw-medium text-dark">{address.city}</span>
              {address.street && <span>, {address.street}</span>}
              {address.building_number && (
                <span>, {address.building_number}</span>
              )}
              {address.details && (
                <div className="small mt-1" style={{ opacity: 0.7 }}>
                  {address.details}
                </div>
              )}
            </>
          ) : (
            <span className="small" style={{ opacity: 0.6 }}>
              No shipping address set
            </span>
          )}
        </div>
      )}
    </div>
  );
}
