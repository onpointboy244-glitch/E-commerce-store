import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/profile.css";
import { useAuthUser } from "../../Hooks/useAuthUser";
import { useLogOut } from "../../Hooks/useLogOut";
import { toast } from "sonner";
import { EditProfile } from "./EditProfile";
export function Profile() {
  const { data: user, isLoading, error } = useAuthUser();
  const { mutate: logOut, isPending } = useLogOut();
  const [isediting, setIsEditing] = useState(false);
  console.log(user); // Debug log to check user data
  // 1. حالة التحميل الأولية
  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center px-2">
        <div
          className="spinner-border text-danger"
          role="status"
          style={{ width: "1.2rem", height: "1.2rem", borderWidth: "2px" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // 2. حالة الخطأ
  if (error) {
    return (
      <div className="user-profile-container is-logged-in">
        <div
          className="alert alert-danger m-0 py-1 px-2 small d-flex align-items-center gap-2"
          style={{ borderRadius: "10px" }}
        >
          <i className="bi bi-exclamation-circle-fill"></i>
          <span>Error</span>
        </div>
      </div>
    );
  }

  // 3. حالة المستخدم غير المسجل (Guest)
  if (!isLoading && !user) {
    return (
      <div className="user-container">
        <Link to="/user">
          <i
            className="bi bi-person-circle user-icon"
            style={{ fontSize: "1.5rem" }}
          ></i>
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    toast("Are you sure you want to logout?", {
      action: {
        label: "Yes, Logout",
        onClick: () => logOut(),
      },
      cancel: {
        label: "No",
        onClick: () => {
          // لا يفعل شيئاً، فقط يغلق التوست
        },
      },
      duration: 5000, // يبقى ظاهراً لمدة 5 ثواني ليعطي فرصة للاختيار
    });
  };

  return (
    <div id="header-profile-placeholder">
      <div className="user-profile-container is-logged-in">
        <div
          className="d-flex align-items-center gap-2 border-0 bg-transparent p-0"
          style={{ cursor: "pointer" }}
        >
          <div
            className="user-avatar bg-dark text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
            style={{ width: "38px", height: "38px", fontSize: "1.1rem" }}
          >
            {user?.fullname?.trim().charAt(0).toUpperCase() || (
              <i className="bi bi-person-fill"></i>
            )}
          </div>
          <span
            className="user-name d-none d-md-inline fw-semibold text-dark small"
            style={{ minWidth: "auto" }}
          >
            {user?.fullname?.trim()}
          </span>
        </div>
        <ul
          className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-0 p-2"
          style={{ minWidth: "280px", borderRadius: "20px", top: "100%" }}
        >
          <li className="p-3 border-bottom mb-2 bg-light rounded-top-4 d-flex align-items-center justify-content-between">
            <div>
              <div
                className="fw-bold text-dark profile-name-val"
                style={{ fontSize: "1rem" }}
              >
                {user?.fullname}
              </div>
              <div className="text-muted small" style={{ fontSize: "0.75rem" }}>
                Account Member
              </div>
            </div>
            <button
              className="btn btn-sm btn-white border shadow-sm rounded-circle p-2"
              id="open-edit-profile"
              title="Edit Profile"
              onClick={() => setIsEditing(true)}
            >
              <i className="bi bi-pencil text-danger"></i>
            </button>
            {isediting && (
              <EditProfile onClose={() => setIsEditing(false)} profile={user} />
            )}
          </li>
          <li className="dropdown-info-item px-3 py-2 d-flex align-items-center gap-3">
            <i className="bi bi-telephone text-danger fs-5"></i>
            <div className="d-flex flex-column">
              <span
                className="text-muted extra-small"
                style={{ fontSize: "0.7rem" }}
              >
                Phone
              </span>
              <span className="small fw-medium profile-phone-val">
                {user?.phone || "Not provided"}
              </span>
            </div>
          </li>
          <li className="dropdown-info-item px-3 py-2 d-flex align-items-center gap-3">
            <i className="bi bi-envelope text-danger fs-5"></i>
            <div className="d-flex flex-column">
              <span
                className="text-muted extra-small"
                style={{ fontSize: "0.7rem" }}
              >
                Email
              </span>
              <span
                className="small fw-medium text-truncate"
                style={{ maxWidth: "180px" }}
              >
                {user?.email}
              </span>
            </div>
          </li>
          <li className="dropdown-info-item px-3 py-2 d-flex align-items-center gap-3 mb-2">
            <i className="bi bi-geo-alt text-danger fs-5"></i>
            <div className="d-flex flex-column">
              <span
                className="text-muted extra-small"
                style={{ fontSize: "0.7rem" }}
              >
                Address
              </span>
              <span className="small fw-medium profile-address-val text-wrap">
                {user?.address
                  ? `${user?.address.city}, ${user?.address.street || user?.address.Street || ""}`
                  : "No address provided"}
              </span>
            </div>
          </li>
          {user?.role === "admin" && (
            <li className="px-3 py-2 border-top">
              <Link
                to="/admin"
                className="btn btn-outline-primary btn-sm w-100 rounded-pill py-2 d-flex align-items-center justify-content-center gap-2 transition-all"
              >
                <i className="bi bi-speedometer2 text-danger fs-5"></i>
                <span>Admin Dashboard</span>
              </Link>
            </li>
          )}
          <li className="px-3 py-2 border-top">
            <Link
              to="/orders?filter=delivered"
              className="btn btn-outline-secondary btn-sm w-100 rounded-pill py-2 d-flex align-items-center justify-content-center gap-2 transition-all orders-link"
            >
              <i className="bi bi-clock-history text-danger fs-5"></i>
              <span>Previous Orders</span>
            </Link>
          </li>
          <li className="px-2 pt-2 border-top">
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="btn btn-outline-danger btn-sm w-100 rounded-pill py-2 d-flex align-items-center justify-content-center gap-2 transition-all"
            >
              <i className="bi bi-box-arrow-right"></i> Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
