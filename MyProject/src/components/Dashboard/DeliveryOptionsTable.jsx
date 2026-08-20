import { useState } from "react";
import { addDoc, deleteDoc, updateDoc, doc, collection } from "firebase/firestore";
import { db } from "@/firebaseconfig";
import { toast } from "sonner";
import { useDeliveryOptions } from "../../Hooks/useDeliveryOptions";
import { ConfirmModal } from "../utils/ConfirmModal";

const EMPTY_FORM = { deliverydays: "", deliveryprice: "" };

export function DeliveryOptionsTable() {
  const { data: deliveries } = useDeliveryOptions();
  const [activeRow, setActiveRow] = useState(null); // null | "__new__" | docId
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const sorted =
    deliveries?.slice().sort((a, b) => a.deliveryprice - b.deliveryprice) || [];
  const isAdding = activeRow === "__new__";
  const isEditing = (id) => activeRow === id;

  const resetForm = () => {
    setActiveRow(null);
    setForm(EMPTY_FORM);
  };

  const openEdit = (del) => {
    setActiveRow(del.id);
    setForm({
      deliverydays: del.deliverydays ?? "",
      deliveryprice: del.deliveryprice ?? "",
    });
  };

  const openAdd = () => {
    setActiveRow("__new__");
    setForm(EMPTY_FORM);
  };

  return (
    <div className="card border-0 shadow-sm mt-4">
      <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-semibold">
          <i className="bi bi-truck me-2 text-primary"></i>Delivery Options
        </h5>
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-sm btn-success px-3" onClick={openAdd}>
            <i className="bi bi-plus-lg me-1"></i>Add Option
          </button>
          <span className="badge bg-primary rounded-pill">
            {deliveries?.length || 0} options
          </span>
        </div>
      </div>

      {isAdding && (
        <div className="card-body border-bottom bg-light">
          <div className="row g-2 align-items-end">
            <div className="col-6 col-md-4">
              <label className="form-label small fw-medium">Delivery Days</label>
              <input
                type="number"
                className="form-control form-control-sm"
                placeholder="e.g. 3"
                value={form.deliverydays}
                onChange={(e) => setForm((p) => ({ ...p, deliverydays: e.target.value }))}
              />
            </div>
            <div className="col-6 col-md-4">
              <label className="form-label small fw-medium">Price (JD)</label>
              <input
                type="number"
                step="0.01"
                className="form-control form-control-sm"
                placeholder="0.00"
                value={form.deliveryprice}
                onChange={(e) => setForm((p) => ({ ...p, deliveryprice: e.target.value }))}
              />
            </div>
            <div className="col-6 col-md-4 d-flex gap-2">
              <button
                className="btn btn-sm btn-primary"
                onClick={async () => {
                  if (!form.deliverydays || !form.deliveryprice) {
                    toast.error("Please fill in both fields", { duration: 3000 });
                    return;
                  }
                  try {
                    await addDoc(collection(db, "DeliveryOptions"), {
                      deliverydays: String(form.deliverydays),
                      deliveryprice: Number(form.deliveryprice),
                    });
                    toast.success("Delivery option added", { duration: 3000 });
                    resetForm();
                  } catch (error) {
                    console.error("Error adding:", error);
                    toast.error("Failed to add", { duration: 3000 });
                  }
                }}
              >
                <i className="bi bi-check-lg me-1"></i>Save
              </button>
              <button className="btn btn-sm btn-outline-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Delivery Days</th>
              <th>Price</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((del, i) => (
              <tr key={del.id}>
                {isEditing(del.id) ? (
                  <>
                    <td className="text-muted small">{i + 1}</td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        style={{ maxWidth: 100 }}
                        value={form.deliverydays}
                        onChange={(e) => setForm((p) => ({ ...p, deliverydays: e.target.value }))}
                      />
                    </td>
                    <td>
                      <div className="input-group input-group-sm" style={{ maxWidth: 130 }}>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={form.deliveryprice}
                          onChange={(e) => setForm((p) => ({ ...p, deliveryprice: e.target.value }))}
                        />
                        <span className="input-group-text">JD</span>
                      </div>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-success me-1"
                        onClick={async () => {
                          if (!form.deliverydays || !form.deliveryprice) {
                            toast.error("Please fill in both fields", { duration: 3000 });
                            return;
                          }
                          try {
                            await updateDoc(doc(db, "DeliveryOptions", del.id), {
                              deliverydays: String(form.deliverydays),
                              deliveryprice: Number(form.deliveryprice),
                            });
                            toast.success("Delivery option updated", { duration: 3000 });
                            resetForm();
                          } catch (error) {
                            console.error("Error updating:", error);
                            toast.error("Failed to update", { duration: 3000 });
                          }
                        }}
                      >
                        <i className="bi bi-check-lg me-1"></i>Save
                      </button>
                      <button className="btn btn-sm btn-secondary" onClick={resetForm}>
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="text-muted small fw-medium">{i + 1}</td>
                    <td className="fw-medium">
                      <i className="bi bi-calendar me-2 text-muted"></i>
                      {del.deliverydays} day{del.deliverydays > 1 ? "s" : ""}
                      {del.flag === "default" && (
                        <span className="badge bg-info ms-2">
                          <i className="bi bi-check-circle me-1"></i>Default
                        </span>
                      )}
                    </td>
                    <td>
                      {parseFloat(del.deliveryprice) === 0 ? (
                        <span className="text-success fw-bold">
                          <i className="bi bi-gift me-1"></i>FREE
                        </span>
                      ) : (
                        <span className="fw-medium">
                          {parseFloat(del.deliveryprice).toFixed(2)} JD
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => openEdit(del)}
                      >
                        <i className="bi bi-pencil me-1"></i>Edit
                      </button>
                      {del.flag === "default" ? (
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          disabled
                          title="Cannot delete the default delivery option"
                        >
                          <i className="bi bi-lock-fill me-1"></i>Required
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setDeleteTarget(del)}
                        >
                          <i className="bi bi-trash me-1"></i>Delete
                        </button>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
            {(!deliveries || deliveries.length === 0) && (
              <tr>
                <td colSpan="4" className="text-center py-4 text-muted">
                  <i className="bi bi-inbox fs-3 d-block mb-2"></i>
                  No delivery options yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm delete modal */}
      <ConfirmModal
        show={!!deleteTarget}
        title="Delete Delivery Option"
        message={`Are you sure you want to delete the "${deleteTarget?.deliverydays || ""}-day" delivery option? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={async () => {
          if (!deleteTarget) return;
          if (deleteTarget.flag === "default") {
            toast.error("Cannot delete the default delivery option");
            setDeleteTarget(null);
            return;
          }
          setDeleting(true);
          try {
            await deleteDoc(doc(db, "DeliveryOptions", deleteTarget.id));
            toast.success("Delivery option deleted", { duration: 3000 });
          } catch (error) {
            console.error("Error deleting:", error);
            toast.error("Failed to delete", { duration: 3000 });
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

export default DeliveryOptionsTable;
