import { Routes, Route } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { HomePage } from "./pages/HomePage";
import { Orders } from "./pages/Orders";
import { Tracking } from "./pages/Tracking";
import { User } from "./pages/User";
import { Checkout } from "./pages/Checkout";
import { AdminLayout } from "./components/Dashboard/AdminLayout";
import { MobileBottomNav } from "./components/utils/MobileBottomNav";
import { Banner } from "./components/utils/Banner";
import { UnauthenticatedRouteWrapper } from "./components/utils/UnauthenticatedRouteWrapper";
import { AdminRouteWrapper } from "./components/utils/AdminRouteWrapper";
import { Toaster } from "sonner";
import "./App.css";

// Lazy-loaded admin pages — only loaded when visiting /admin/*
const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard"));
const AdminOrdersPage = lazy(() => import("./pages/dashboard/AdminOrdersPage"));
const AdminProductsPage = lazy(() => import("./pages/dashboard/AdminProductsPage"));
const AdminUsersPage = lazy(() => import("./pages/dashboard/AdminUsersPage"));
const AdminDeliveryOptionsPage = lazy(() => import("./pages/dashboard/AdminDeliveryOptionsPage"));
const AddProduct = lazy(() => import("./pages/dashboard/AddProduct"));
const EditProduct = lazy(() => import("./pages/dashboard/EditProduct"));
const OrderView = lazy(() => import("./pages/dashboard/OrderView"));

const adminFallback = (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
    <div className="text-center">
      <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted mt-2">Loading...</p>
    </div>
  </div>
);

function App() {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("cartItems");
    return saved ? JSON.parse(saved) : [];
  });

  // استدعاء الهوك هنا يجعله يعمل في الخلفية طوال وقت استخدام التطبيق

  // حفظ السلة تلقائياً عند أي تغيير (إضافة، حذف، أو تعديل كمية)
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  return (
    <>
      <Banner />
      <Routes>
        {/* المسار الرئيسي "/" يعرض الصفحة الرئيسية */}
        <Route
          path="/"
          element={
            <HomePage cartItems={cartItems} setCartItems={setCartItems} />
          }
        />
        <Route path="/orders" element={<Orders />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/user" element={<UnauthenticatedRouteWrapper />}>
          <Route index element={<User />} />
        </Route>
        <Route
          path="/checkout"
          element={
            <Checkout cartItems={cartItems} setCartItems={setCartItems} />
          }
        />
        {/* Admin routes wrapped in auth guard + layout with sidebar */}
        <Route element={<AdminRouteWrapper />}>
          <Route
            element={
              <Suspense fallback={adminFallback}>
                <AdminLayout />
              </Suspense>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route
              path="/admin/delivery-options"
              element={<AdminDeliveryOptionsPage />}
            />
            <Route path="/admin/products/add" element={<AddProduct />} />
            <Route path="/admin/products/:id" element={<EditProduct />} />
            <Route path="/admin/orders/:id" element={<OrderView />} />
          </Route>
        </Route>
      </Routes>
      {/* القائمة السفلية تظهر هنا لتكون ثابتة في كل الصفحات */}
      <MobileBottomNav cartItems={cartItems} />
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;
