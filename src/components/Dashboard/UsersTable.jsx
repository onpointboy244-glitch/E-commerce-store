import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebaseconfig";

export function UsersTable() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  return (
    <div className="card border-0 shadow-sm mt-4">
      <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-semibold"><i className="bi bi-people me-2 text-primary"></i>Users</h5>
        <span className="badge bg-primary rounded-pill">{users.length} total</span>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Method</th><th>Joined</th></tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="fw-medium">
                  <div className="d-flex align-items-center gap-2">
                    <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center text-primary fw-bold"
                      style={{ width: 36, height: 36, fontSize: 14 }}>
                      {(user.fullname || user.email || "?").charAt(0).toUpperCase()}
                    </div>
                    {user.fullname || "N/A"}
                  </div>
                </td>
                <td className="small text-muted">{user.email || "N/A"}</td>
                <td className="small">{user.phone || "—"}</td>
                <td>
                  <span className={`badge bg-${user.role === "admin" ? "danger" : user.role === "customer" ? "info" : "secondary"} bg-opacity-10 text-${user.role === "admin" ? "danger" : user.role === "customer" ? "info" : "secondary"} rounded-pill`}>
                    {user.role === "admin" && <i className="bi bi-shield-fill-check me-1"></i>}
                    {user.role === "customer" && <i className="bi bi-person me-1"></i>}
                    {user.role || "N/A"}
                  </span>
                </td>
                <td>
                  <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill">
                    {user.method === "google" ? <><i className="bi bi-google me-1"></i>Google</> : user.method === "form" ? <><i className="bi bi-envelope me-1"></i>Email</> : "—"}
                  </span>
                </td>
                <td className="small text-muted">
                  {user.createdAt?.seconds ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan="6" className="text-center py-4 text-muted"><i className="bi bi-inbox fs-3 d-block mb-2"></i>No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
