import { useEffect, useState, useMemo } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/firebaseconfig";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const STATUS_COLORS = {
  pending: "#f59e0b",
  processing: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border rounded-2 shadow-sm p-3" style={{ minWidth: 140 }}>
      <p className="mb-1 fw-bold small">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="mb-0 small" style={{ color: entry.color }}>
          {entry.name}:{" "}
          <strong>
            {typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value}
            {entry.name === "Revenue" ? " JD" : ""}
          </strong>
        </p>
      ))}
    </div>
  );
};

export function ChartsSection() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("orderDate", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0), [orders]);
  const formatCurrency = (val) => (val || 0).toFixed(2);

  const revenueOverTime = useMemo(() => {
    const days = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days[d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })] = 0;
    }
    orders.forEach((o) => {
      if (!o.orderDate?.seconds) return;
      const key = new Date(o.orderDate.seconds * 1000).toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
      if (days[key] !== undefined) days[key] += o.totalAmount || 0;
    });
    return Object.entries(days).map(([date, revenue]) => ({ date, revenue }));
  }, [orders]);

  const ordersByStatus = useMemo(() => {
    const counts = {};
    orders.forEach((o) => { const s = o.status || "unknown"; counts[s] = (counts[s] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), value, color: STATUS_COLORS[name] || "#6b7280",
    }));
  }, [orders]);

  const monthlyOrders = useMemo(() => {
    const months = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months[d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })] = 0;
    }
    orders.forEach((o) => {
      if (!o.orderDate?.seconds) return;
      const key = new Date(o.orderDate.seconds * 1000).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (months[key] !== undefined) months[key]++;
    });
    return Object.entries(months).map(([month, count]) => ({ month, count }));
  }, [orders]);

  const topProducts = useMemo(() => {
    const counts = {};
    orders.forEach((o) => {
      (o.items || []).forEach((item) => { counts[item.name || "Unknown"] = (counts[item.name || "Unknown"] || 0) + (item.quantity || 1); });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, sold]) => ({ name, sold }));
  }, [orders]);

  return (
    <>
      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold"><i className="bi bi-graph-up-arrow me-2 text-primary"></i>Revenue (Last 7 Days)</h5>
              <span className="badge bg-success bg-opacity-10 text-success px-3 py-2">+{formatCurrency(totalRevenue)} JD total</span>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueOverTime} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0d6efd" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#adb5bd" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#adb5bd" tickFormatter={(v) => `${v} JD`} />
                  <Tooltip content={<CUSTOM_TOOLTIP />} />
                  <Area type="monotone" dataKey="revenue" stroke="#0d6efd" strokeWidth={2} fill="url(#colorRevenue)" name="Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="mb-0 fw-semibold"><i className="bi bi-pie-chart me-2 text-primary"></i>Orders by Status</h5>
            </div>
            <div className="card-body d-flex flex-column justify-content-center">
              {ordersByStatus.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={ordersByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                        {ordersByStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="d-flex flex-wrap justify-content-center gap-3 mt-2">
                    {ordersByStatus.map((entry, i) => (
                      <div key={i} className="d-flex align-items-center gap-1 small">
                        <span className="d-inline-block rounded-circle" style={{ width: 10, height: 10, backgroundColor: entry.color }}></span>
                        {entry.name}: <strong>{entry.value}</strong>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center text-muted py-4"><i className="bi bi-inbox fs-1 d-block mb-2"></i><p className="mb-0">No orders yet</p></div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="mb-0 fw-semibold"><i className="bi bi-bar-chart-line me-2 text-primary"></i>Monthly Orders</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyOrders} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#adb5bd" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#adb5bd" allowDecimals={false} />
                  <Tooltip content={<CUSTOM_TOOLTIP />} />
                  <Bar dataKey="count" fill="#0d6efd" radius={[4, 4, 0, 0]} name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="mb-0 fw-semibold"><i className="bi bi-trophy me-2 text-primary"></i>Top Selling Products</h5>
            </div>
            <div className="card-body">
              {topProducts.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {topProducts.map((product, i) => {
                    const maxSold = topProducts[0]?.sold || 1;
                    return (
                      <div key={i}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-medium small">{i + 1}. {product.name}</span>
                          <span className="text-muted small">{product.sold} sold</span>
                        </div>
                        <div className="progress" style={{ height: 8 }}>
                          <div className={`progress-bar ${i === 0 ? "bg-primary" : i === 1 ? "bg-success" : i === 2 ? "bg-info" : "bg-secondary"}`}
                            role="progressbar" style={{ width: `${(product.sold / maxSold) * 100}%` }}
                            aria-valuenow={product.sold} aria-valuemin="0" aria-valuemax={maxSold}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-muted py-4"><i className="bi bi-inbox fs-1 d-block mb-2"></i><p className="mb-0">No products sold yet</p></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
