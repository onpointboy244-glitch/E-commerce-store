import { NavLink } from "react-router-dom";
import { useLogOut } from "../../Hooks/useLogOut";

const NAV_ITEMS = [
  {
    to: "/admin",
    icon: "bi-speedometer2",
    label: "Dashboard",
    end: true,
  },
  {
    to: "/admin/orders",
    icon: "bi-receipt",
    label: "Recent Orders",
    end: false,
  },
  {
    to: "/admin/products",
    icon: "bi-box-seam",
    label: "Products Inventory",
    end: false,
  },
  {
    to: "/admin/users",
    icon: "bi-people",
    label: "Users",
    end: false,
  },
  {
    to: "/admin/delivery-options",
    icon: "bi-truck",
    label: "Delivery Options",
    end: false,
  },
  {
    to: "/admin/products/add",
    icon: "bi-plus-circle",
    label: "Add Product",
    end: false,
  },
];

export function AdminSidebar({ isOpen, onClose }) {
  const { mutate: logout, isPending } = useLogOut();

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-md-none"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1039 }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className="position-fixed top-0 start-0 h-100 bg-dark text-white d-flex flex-column"
        style={{
          width: "260px",
          zIndex: 1040,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease-in-out",
        }}
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom border-secondary">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-shield-lock fs-4 text-primary"></i>
            <span className="fw-bold fs-5">Admin Panel</span>
          </div>
          <button
            className="btn btn-link text-white p-0 text-decoration-none"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-grow-1 overflow-auto py-2">
          <div className="px-3 mb-2">
            <small
              className="text-secondary text-uppercase fw-semibold"
              style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}
            >
              Main
            </small>
          </div>

          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `admin-sidebar-link d-flex align-items-center px-3 py-2 text-decoration-none ${
                  isActive
                    ? "active bg-primary text-white"
                    : "text-white-50"
                }`
              }
              onClick={onClose}
            >
              <i className={`bi ${item.icon} me-3 fs-5`}></i>
              <span className="fs-6">{item.label}</span>
            </NavLink>
          ))}

          <div className="border-top border-secondary my-2 mx-3"></div>

          <div className="px-3 mb-2 mt-3">
            <small
              className="text-secondary text-uppercase fw-semibold"
              style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}
            >
              Links
            </small>
          </div>

          <NavLink
            to="/"
            end
            className="admin-sidebar-link d-flex align-items-center px-3 py-2 text-decoration-none text-white-50"
            onClick={onClose}
          >
            <i className="bi bi-house-door me-3 fs-5"></i>
            <span className="fs-6">View Store</span>
          </NavLink>
        </nav>

        {/* Logout */}
        <div className="border-top border-secondary p-3">
          <button
            className="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={() => logout()}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                ></span>
                Logging out...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-left"></i>
                Logout
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
