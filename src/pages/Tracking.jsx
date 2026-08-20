import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseconfig";
import { Header } from "../components/Layout/Header";
import { useAuthUser } from "../Hooks/useAuthUser";

export function Tracking() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const productId = searchParams.get("productId");
  const { data: user, isLoading: isUserLoading } = useAuthUser();
  // جلب بيانات الطلب بناءً على الآي دي
  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const docRef = doc(db, "orders", orderId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      throw new Error("Order not found");
    },
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-danger"></div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="alert alert-danger m-5">
        An error occurred while loading tracking data
      </div>
    );
  }

  // البحث عن المنتج المحدد داخل الطلب
  const item = order.items.find((i) => i.productId === productId);

  // تحديد مراحل التتبع بناءً على حالة الطلب
  const steps = [
    { label: "Order Received", status: "pending", icon: "bi-bag-check" },
    { label: "Processing", status: "processing", icon: "bi-gear" },
    { label: "Shipped", status: "shipped", icon: "bi-truck" },
    { label: "Delivered", status: "delivered", icon: "bi-house-check" },
  ];

  // هون بنخلي الـ (إنديكس) يعتمد على حالة الـ (آيتم) نفسه، ولو مش موجودة بنرجع لحالة الـ (أوردير) كاحتياط
  const currentStatusIndex = steps.findIndex(
    (s) => s.status === (item?.status || order.status),
  );

  return (
    <>
      <Header />
      <div className="container py-5">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/orders" className="text-danger">
                My Orders
              </Link>
            </li>
            <li className="breadcrumb-item active">Track Item</li>
          </ol>
        </nav>

        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-header bg-white py-4 border-0">
            <h4 className="fw-bold mb-0">
              Track Shipment #{order.id.slice(0, 8)}
            </h4>
          </div>
          <div className="card-body p-4">
            {item && (
              <div className="row align-items-center mb-5">
                <div className="col-md-2 text-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="img-fluid rounded-3 border"
                    style={{ maxHeight: "120px" }}
                  />
                </div>
                <div className="col-md-10">
                  <h5 className="fw-bold">{item.name}</h5>
                  <p className="text-muted mb-0">
                    Quantity: {item.quantity} | Price: {item.price} JD
                  </p>
                  <div className="badge bg-light text-danger mt-2 border border-danger-subtle">
                    Estimated Delivery Date:{" "}
                    {new Date(
                      item.estimatedDeliveryDate?.toDate
                        ? item.estimatedDeliveryDate.toDate()
                        : item.estimatedDeliveryDate,
                    ).toLocaleDateString("en-US")}
                  </div>
                </div>
              </div>
            )}

            {/* شريط التقدم اللحظي */}
            <div className="tracking-steps position-relative mt-5 pt-3">
              <div className="progress" style={{ height: "4px" }}>
                <div
                  className="progress-bar bg-danger"
                  style={{
                    width: `${(currentStatusIndex / (steps.length - 1)) * 100}%`,
                  }}
                ></div>
              </div>
              <div
                className="d-flex justify-content-between position-absolute top-0 w-100"
                style={{ marginTop: "-15px" }}
              >
                {steps.map((step, index) => {
                  const isActive = index <= currentStatusIndex;
                  return (
                    <div
                      key={index}
                      className="text-center"
                      style={{ width: "10%" }}
                    >
                      <div
                        className={`rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm mb-2 ${isActive ? "bg-danger text-white" : "bg-white text-muted border"}`}
                        style={{
                          width: "35px",
                          height: "35px",
                          zIndex: 2,
                          position: "relative",
                        }}
                      >
                        <i className={`bi ${step.icon}`}></i>
                      </div>
                      <div
                        className={`small fw-bold d-none d-md-block ${isActive ? "text-dark" : "text-muted"}`}
                      >
                        {step.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 p-4 bg-light rounded-4 border-0">
              <h6 className="fw-bold mb-3">
                <i
                  className="bi bi-info-circle me-2"
                  title="you can change/add address in profile section"
                ></i>
                Delivery Details
              </h6>
              <div className="row">
                <div className="col-md-6">
                  <p className="small text-muted mb-1">Shipping Address:</p>
                  {isUserLoading ? (
                    <div className="d-flex align-items-center">
                      <div
                        className="spinner-border text-primary me-3"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    (() => {
                      const sa = order.shippingAddress;
                      const hasOrderAddr =
                        sa?.city || sa?.street || sa?.building_number;
                      const addr = hasOrderAddr ? sa : user?.address;
                      return (
                        <p className="fw-bold">
                          {addr?.city || "—"}
                          {addr?.street ? `, ${addr.street}` : ""}
                          {addr?.building_number
                            ? `, Building ${addr.building_number}`
                            : ""}
                          {addr?.details ? <br /> : null}
                          {addr?.details && (
                            <span className="small fw-normal text-muted">
                              {addr.details}
                            </span>
                          )}
                        </p>
                      );
                    })()
                  )}
                </div>
                <div className="col-md-6">
                  <p className="small text-muted mb-1">Payment Method:</p>
                  <p className="fw-bold">Cash on Delivery</p>
                </div>
              </div>
            </div>
          </div>
          <div className="card-footer bg-white py-3 border-0 text-center">
            <Link
              to="/orders"
              className="btn btn-outline-dark rounded-pill px-4"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
