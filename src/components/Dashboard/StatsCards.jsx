import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebaseconfig";

export function StatsCards() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const ordersSnap = await getDocs(collection(db, "orders"));
      const ordersList = ordersSnap.docs.map((d) => d.data());
      const totalRevenue = ordersList.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const pendingOrders = ordersList.filter((o) => o.status === "pending").length;
      const deliveredOrders = ordersList.filter((o) => o.status === "delivered").length;
      const cancelledOrders = ordersList.filter((o) => o.status === "cancelled").length;

      const usersSnap = await getDocs(collection(db, "users"));
      const productsSnap = await getDocs(collection(db, "products"));

      setStats({
        totalOrders: ordersList.length,
        totalRevenue,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        totalUsers: usersSnap.size,
        totalProducts: productsSnap.size,
      });
    };
    fetchStats();
  }, []);

  const formatCurrency = (val) => (val || 0).toFixed(2);

  const cards = [
    { label: "Total Orders", value: stats.totalOrders, icon: "bi-cart-fill", color: "primary" },
    { label: "Total Revenue", value: `${formatCurrency(stats.totalRevenue)} JD`, icon: "bi-currency-dollar", color: "success" },
    { label: "Pending", value: stats.pendingOrders, icon: "bi-clock-history", color: "warning" },
    { label: "Delivered", value: stats.deliveredOrders, icon: "bi-check-circle", color: "info" },
    { label: "Cancelled", value: stats.cancelledOrders, icon: "bi-x-circle", color: "danger" },
    { label: "Total Users", value: stats.totalUsers, icon: "bi-people", color: "secondary" },
    { label: "Products", value: stats.totalProducts, icon: "bi-box", color: "dark" },
  ];

  return (
    <div className="row g-3 mb-4">
      {cards.map((card) => (
        <div className="col-xl col-md-3 col-6" key={card.label}>
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1 text-uppercase fw-semibold">{card.label}</p>
                  <h3 className="fw-bold mb-0">{card.value}</h3>
                </div>
                <div className={`rounded-3 p-3 bg-${card.color} bg-opacity-10`}>
                  <i className={`bi ${card.icon} fs-3 text-${card.color}`}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
