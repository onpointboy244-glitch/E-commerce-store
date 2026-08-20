import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseconfig";
import { toast } from "sonner";

function formatDate(timestamp) {
  if (!timestamp?.seconds) return "N/A";
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function capitalize(str) {
  if (!str) return "N/A";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function StatusBadge({ status }) {
  const colors = {
    pending: "warning",
    delivered: "success",
    cancelled: "danger",
    processing: "info",
    shipped: "primary",
  };
  const color = colors[status] || "secondary";
  return (
    <span className={`badge bg-${color} fs-6 px-3 py-2`}>
      {capitalize(status)}
    </span>
  );
}

export function OrderView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState({});
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, "orders", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const orderData = { id: snap.id, ...snap.data() };
          setOrder(orderData);

          // Fetch user info if userId/userid exists
          const uid = orderData.userId || orderData.userid;
          if (uid) {
            const userDocRef = doc(db, "users", uid);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
              setUserInfo({ id: userSnap.id, ...userSnap.data() });
            }
          }
        } else {
          toast.error("Order not found", { duration: 3000 });
          navigate("/admin");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order", { duration: 3000 });
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 className="mb-1 fw-bold">Order Details</h2>
            <p className="text-muted mb-0">
              Viewing order #{order?.id?.slice(-8) || "N/A"}
            </p>
          </div>
          <button
            className="btn btn-outline-secondary px-4"
            onClick={() => navigate("/admin")}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Dashboard
          </button>
        </div>

        <div className="row g-4">
          {/* Left Column */}
          <div className="col-lg-8">
            {/* Order Items Card */}
            <div className="card shadow-sm border-0 rounded-3 mb-4">
              <div className="card-header bg-white py-3 border-bottom">
                <h5 className="mb-0 fw-semibold">
                  <i className="bi bi-box-seam me-2 text-primary"></i>
                  Order Items
                </h5>
              </div>
              <div className="card-body p-0">
                {order.items && order.items.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "50%" }}>Product</th>
                          <th className="text-center">Status</th>
                          <th className="text-center">Price</th>
                          <th className="text-center">Qty</th>
                          <th className="text-end">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, i) => (
                          <tr key={i}>
                            <td>
                              <div className="d-flex align-items-center gap-3">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="rounded"
                                    width="48"
                                    height="48"
                                    style={{ objectFit: "cover" }}
                                  />
                                )}
                                <div>
                                  <span className="fw-medium">{item.name}</span>
                                  {item.category && (
                                    <small className="d-block text-muted">
                                      {item.category}
                                    </small>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="text-center">
                              {item.status && (
                                <span
                                  className={`badge bg-${item.status === "pending" ? "warning" : item.status === "delivered" ? "success" : "secondary"} rounded-pill`}
                                >
                                  {capitalize(item.status)}
                                </span>
                              )}
                            </td>
                            <td className="text-center">
                              {item.price?.toFixed(2)} JD
                            </td>

                            <td className="text-center">
                              <span className="badge bg-secondary rounded-pill px-2">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="text-end fw-semibold">
                              {(item.itemTotal ?? item.totalPrice)?.toFixed(2)}{" "}
                              JD
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      {order.totalBeforeTax !== undefined && (
                        <tfoot className="table-light">
                          <tr>
                            <td colSpan="4" className="text-end fw-medium">
                              Subtotal
                            </td>
                            <td className="text-end fw-bold">
                              {order.subtotal?.toFixed(2)} JD
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                    <p className="mb-0">No items in this order</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Details Card */}
            {(order.address || order.phone || order.city) && (
              <div className="card shadow-sm border-0 rounded-3 mb-4">
                <div className="card-header bg-white py-3 border-bottom">
                  <h5 className="mb-0 fw-semibold">
                    <i className="bi bi-geo-alt me-2 text-primary"></i>
                    Shipping Details
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    {order.address && (
                      <div className="col-md-6">
                        <small className="text-muted d-block">Address</small>
                        <span className="fw-medium">{order.address}</span>
                      </div>
                    )}
                    {order.city && (
                      <div className="col-md-6">
                        <small className="text-muted d-block">City</small>
                        <span className="fw-medium">{order.city}</span>
                      </div>
                    )}
                    {order.phone && (
                      <div className="col-md-6">
                        <small className="text-muted d-block">Phone</small>
                        <span className="fw-medium">{order.phone}</span>
                      </div>
                    )}
                    {order.addressNotes && (
                      <div className="col-12">
                        <small className="text-muted d-block">Notes</small>
                        <span className="fw-medium">{order.addressNotes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="col-lg-4">
            {/* Order Summary Card */}
            <div className="card shadow-sm border-0 rounded-3 mb-4">
              <div className="card-header bg-white py-3 border-bottom">
                <h5 className="mb-0 fw-semibold">
                  <i className="bi bi-receipt me-2 text-primary"></i>
                  Order Summary
                </h5>
              </div>
              <div className="card-body">
                <dl className="row mb-0 g-3">
                  <dt className="col-5 text-muted">Order ID</dt>
                  <dd className="col-7 text-end mb-0 fw-medium font-monospace">
                    #{order?.id?.slice(-8) || "N/A"}
                  </dd>
                  <dt className="col-5 text-muted">Customer</dt>
                  <dd className="col-7 text-end mb-0 fw-medium">
                    {userInfo?.fullname ||
                      order.fullname ||
                      order.email ||
                      "Guest"}
                  </dd>
                  <dt className="col-5 text-muted">Email</dt>
                  <dd className="col-7 text-end mb-0">
                    {userInfo?.email || order.email || "N/A"}
                  </dd>
                  {userInfo?.phone && order.phone !== userInfo.phone && (
                    <>
                      <dt className="col-5 text-muted">User Phone</dt>
                      <dd className="col-7 text-end mb-0">{userInfo.phone}</dd>
                    </>
                  )}
                  <dt className="col-5 text-muted">Date</dt>
                  <dd className="col-7 text-end mb-0">
                    {order.orderDate?.seconds
                      ? formatDate(order.orderDate)
                      : "N/A"}
                  </dd>
                  <dt className="col-5 text-muted">Status</dt>
                  <dd className="col-7 text-end mb-0">
                    <StatusBadge status={order.status} />
                  </dd>
                  {order.paymentMethod && (
                    <>
                      <dt className="col-5 text-muted">Payment</dt>
                      <dd className="col-7 text-end mb-0 fw-medium">
                        {order.paymentMethod}
                      </dd>
                    </>
                  )}
                  <hr className="my-2" />

                  {/* Price Breakdown */}
                  {order.totalBeforeTax !== undefined && (
                    <>
                      <dt className="col-5 text-muted small">Subtotal</dt>
                      <dd className="col-7 text-end mb-0 small">
                        {order.subtotal?.toFixed(2)} JD
                      </dd>
                    </>
                  )}

                  {(order.shippingPrice ?? order.deliveryFee) !== undefined && (
                    <>
                      <dt className="col-5 text-muted small">Delivery Fee</dt>
                      <dd className="col-7 text-end mb-0 small">
                        +{" "}
                        {(order.shippingPrice ?? order.deliveryFee)?.toFixed(2)}{" "}
                        JD
                      </dd>
                    </>
                  )}

                  {order.taxAmount !== undefined && (
                    <>
                      <dt className="col-5 text-muted small">Tax</dt>
                      <dd className="col-7 text-end mb-0 small">
                        + {order.taxAmount?.toFixed(2)} JD
                      </dd>
                    </>
                  )}

                  <div className="border-top pt-2 mt-1">
                    <dl className="row mb-0">
                      <dt className="col-5 fw-bold">Total</dt>
                      <dd className="col-7 text-end mb-0 fs-4 fw-bold text-primary">
                        {order.totalAmount?.toFixed(2) || "0.00"} JD
                      </dd>
                    </dl>
                  </div>
                </dl>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="card shadow-sm border-0 rounded-3">
              <div className="card-header bg-white py-3 border-bottom">
                <h5 className="mb-0 fw-semibold">
                  <i className="bi bi-lightning me-2 text-primary"></i>
                  Quick Actions
                </h5>
              </div>
              <div className="card-body d-flex flex-column gap-2">
                <button
                  className="btn btn-primary w-100"
                  onClick={() => navigate("/admin")}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Dashboard
                </button>
                <button
                  className="btn btn-outline-primary w-100"
                  onClick={() => {
                    const text = `Order #${order?.id?.slice(-8)}\nCustomer: ${order.fullname || "Guest"}\nTotal: ${order.totalAmount?.toFixed(2)} JD\nStatus: ${capitalize(order.status)}`;
                    navigator.clipboard.writeText(text);
                    toast.success("Order summary copied", { duration: 2000 });
                  }}
                >
                  <i className="bi bi-clipboard me-2"></i>
                  Copy Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderView;
