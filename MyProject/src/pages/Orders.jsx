import { useAuthUser } from "../Hooks/useAuthUser";
import { useOrders } from "../Hooks/useOrders";
import { Link, useSearchParams } from "react-router-dom";
import { Header } from "../components/Layout/Header";

export function Orders() {
  const [searchParams] = useSearchParams();
  const { data: authUser, isLoading: isAuthLoading } = useAuthUser();
  const {
    data: orders,
    isLoading,
    isError,
    error,
    isFetching,
  } = useOrders(authUser);

  // جلب قيمة الـ (فلتر) من الـ (يو آر إل)
  const filterType = searchParams.get("filter");

  // (اللوجيك) الجديد: إذا الفلتر (ديليفيرد) اعرض المكتمل، غير هيك اعرض فقط الطلبات اللي لسا ما اكتملت
  const filteredOrders =
    filterType === "delivered"
      ? orders?.filter((order) => order.status === "delivered")
      : orders?.filter((order) => order.status !== "delivered");

  return (
    <>
      <Header />

      <div className="container pb-5">
        <h2 className="fw-bold text-dark mb-4 border-bottom pb-3 tx">
          {filterType === "delivered" ? "Completed" : "Current"} Orders
        </h2>
        {isAuthLoading ? (
          <div className="text-center p-5">
            <div className="spinner-border text-danger"></div>
          </div>
        ) : !authUser ? (
          /* هذا الفحص مكانه هنا مثالي للتحكم في رسالة الـ UI */
          <div className="text-center p-5 text-muted">
            Please log in to view your orders.
          </div>
        ) : isLoading || (orders === null && isFetching) ? (
          <div className="text-center p-5">
            <div className="spinner-border text-danger"></div>
          </div>
        ) : isError ? (
          <div className="alert alert-danger">something went wrong:{error}</div>
        ) : filteredOrders?.length === 0 ? (
          <div className="col-12 text-center py-5">
            <i
              className="bi bi-cart-x text-muted"
              style={{ fontSize: "5rem" }}
            ></i>
            <h4 className="mt-3 text-secondary">
              {filterType === "delivered"
                ? "No completed orders found"
                : "order list is empty"}
            </h4>
            <p className="text-muted">
              Looks like you haven't placed any orders yet. Start shopping to
              see
            </p>
            <Link to="/" className="btn btn-danger rounded-pill px-4 mt-2">
              <i className="bi bi-cart-plus me-2"></i> Start Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-container row g-4">
            {filteredOrders?.map((order) => {
              // (لوجيك) تجميع المنتجات بناءً على تاريخ التوصيل
              const groupedItems = order.items.reduce((acc, item) => {
                // تحويل التايم ستامب لـ ديت قبل استخدامه
                const deliveryDate = item.estimatedDeliveryDate?.toDate
                  ? item.estimatedDeliveryDate.toDate()
                  : new Date(item.estimatedDeliveryDate);
                const dateKey = deliveryDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
                if (!acc[dateKey]) acc[dateKey] = [];
                acc[dateKey].push(item);
                return acc;
              }, {});

              return (
                <div key={order.id} className="col-12">
                  <div
                    className="card shadow-sm border-0 mb-4 overflow-hidden"
                    style={{ borderRadius: "15px" }}
                  >
                    <div className="card-header bg-white py-3 border-bottom-0">
                      <div className="row g-3 small fw-bold text-muted text-uppercase">
                        <div className="col-6 col-md-3">
                          Order Placed
                          <br />
                          <span className="text-dark">
                            {order.orderDate?.toDate
                              ? order.orderDate.toDate().toLocaleString()
                              : order.orderDate
                                ? new Date(order.orderDate).toLocaleString()
                                : "N/A"}
                          </span>
                        </div>
                        <div className="col-6 col-md-2">
                          Tax
                          <br />
                          <span className="text-dark">
                            {order.taxAmount?.toFixed(2)} JD
                          </span>
                        </div>
                        <div className="col-6 col-md-2">
                          Total
                          <br />
                          <span className="text-dark text-danger">
                            {order.totalAmount?.toFixed(2)} JD
                          </span>
                        </div>
                        <div className="col-6 col-md-5 text-md-end">
                          Order ID
                          <br />
                          <span className="text-dark">
                            #{order.id.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="card-body p-0">
                      {Object.entries(groupedItems).map(([date, items]) => {
                        const firstItemDeliveryOptionId =
                          items[0].deliveryOptionId;
                        const isFree = firstItemDeliveryOptionId === "1";
                        const showDiscount = items.length > 1 && !isFree;

                        return (
                          <div
                            key={date}
                            className="shipment-group border-top p-3 bg-white"
                          >
                            {/* الهيدر هون بفضل يعتمد على حالة أول (آيتم) في المجموعة أو حالة الـ (أوردير) */}
                            <div
                              className={`fw-bold mb-3 ${items[0]?.status === "delivered" || order.status === "delivered" ? "text-success" : "text-danger"}`}
                            >
                              <i
                                className={`bi ${items[0]?.status === "delivered" || order.status === "delivered" ? "bi-check-circle" : "bi-truck"} me-2`}
                              ></i>
                              {items[0]?.status === "delivered" ||
                              order.status === "delivered"
                                ? "Delivered on: "
                                : "Arrives on: "}{" "}
                              {date}
                              {showDiscount && (
                                <span
                                  style={{
                                    color: "#0a8f27",
                                    fontSize: "0.85rem",
                                    marginLeft: "8px",
                                    fontWeight: "500",
                                  }}
                                >
                                  (Discount applied for shipping: Included
                                  costs)
                                </span>
                              )}
                            </div>

                            {items.map((item, index) => (
                              <div
                                key={index}
                                className="row align-items-center mb-3 g-3 "
                              >
                                <div className="col-4 col-md-2">
                                  <img
                                    src={item.image}
                                    className="img-fluid rounded border"
                                    alt={item.name}
                                    style={{
                                      maxHeight: "100px",
                                      objectFit: "cover",
                                    }}
                                  />
                                </div>
                                <div className="col-8 col-md-7">
                                  <div className="fw-bold">{item.name}</div>
                                  <div className="text-muted small">
                                    Quantity: {item.quantity} | Price:{" "}
                                    {item.price} JD | Subtotal:{" "}
                                    {(item.price * item.quantity).toFixed(2)} JD
                                  </div>
                                  <div className="text-success small fw-bold">
                                    Delivery:{" "}
                                    {Number(item.deliveryPrice) === 0
                                      ? "Free Delivery"
                                      : `${item.deliveryPrice} JD`}
                                  </div>
                                  {item.status === "delivered" && (
                                    <div className="badge bg-success mt-1 fw-normal">
                                      Completed
                                    </div>
                                  )}
                                </div>
                                {filterType !== "delivered" && (
                                  <div className="col-12 col-md-3 text-md-end">
                                    <Link
                                      to={`/tracking?orderId=${order.id}&productId=${item.productId}`}
                                      className="btn btn-danger btn-sm rounded-2 px-3 py-2 d-block mx-auto w-md-auto shadow-sm track-item-mobile-btn"
                                      style={{ maxWidth: "130px" }}
                                    >
                                      <i className="bi bi-geo-alt me-1"></i>{" "}
                                      Track Item
                                    </Link>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
