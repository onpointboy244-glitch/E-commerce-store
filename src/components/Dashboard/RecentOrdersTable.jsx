import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebaseconfig";
import { toast } from "sonner";
import { deleteOrder } from "../../utilsFunctions/adminApi";
import { ConfirmModal } from "../utils/ConfirmModal";

export function RecentOrdersTable({ maxItems = 10 }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("orderDate", "desc"));
    const unsubOrders = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => {
      unsubOrders();
      unsubUsers();
    };
  }, []);

  const formatCurrency = (val) => (val || 0).toFixed(2);

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-semibold">
          <i className="bi bi-receipt me-2 text-primary"></i>Recent Orders
        </h5>
        <span className="badge bg-primary rounded-pill">
          {orders.length} total
        </span>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, maxItems).map((order) => (
              <tr key={order.id}>
                <td className="font-monospace small">
                  #{order.id.slice(0, 8)}
                </td>
                <td>
                  {(() => {
                    const uid = order.userId || order.userid;
                    const u = users.find((x) => x.id === uid);
                    const name =
                      u?.fullname || order.fullname || order.email || "Guest";
                    return (
                      <>
                        {name}
                        {u?.role && (
                          <span
                            className={`badge bg-${u.role === "admin" ? "danger" : "info"} ms-1`}
                          >
                            {u.role}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </td>
                <td className="small text-muted">
                  {order.orderDate
                    ? new Date(
                        order.orderDate.seconds * 1000,
                      ).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="fw-medium">
                  {formatCurrency(order.totalAmount)} JD
                </td>
                <td>
                  <span
                    className={`badge bg-${order.status === "delivered" ? "success" : order.status === "pending" ? "warning" : order.status === "cancelled" ? "danger" : "secondary"} rounded-pill`}
                  >
                    {order.status
                      ? order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)
                      : "N/A"}
                  </span>
                </td>
                <td className="text-end">
                  <button
                    className="btn btn-sm btn-outline-primary me-1"
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                  >
                    <i className="bi bi-eye me-1"></i>View
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setDeleteTarget(order)}
                  >
                    <i className="bi bi-trash me-1"></i>Delete
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">
                  <i className="bi bi-inbox fs-3 d-block mb-2"></i>
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm delete modal */}
      <ConfirmModal
        show={!!deleteTarget}
        title="Delete Order"
        message={`Are you sure you want to delete order #${deleteTarget?.id?.slice(-8) || ""}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setDeleting(true);
          try {
            await deleteOrder(deleteTarget.id);
            toast.success("Order deleted", { duration: 3000 });
          } catch (error) {
            console.error("Error deleting order:", error.message);
            toast.error(error.message || "Failed to delete order", { duration: 3000 });
          } finally {
            setDeleting(false);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
