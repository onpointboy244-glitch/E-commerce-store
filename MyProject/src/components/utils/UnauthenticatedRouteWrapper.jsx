import { useAuthUser } from "../../Hooks/useAuthUser";
import { Navigate, Outlet } from "react-router-dom";

export function UnauthenticatedRouteWrapper() {
  const { data: authUser, isLoading: isAuthLoading } = useAuthUser();

  // إذا كان لا يزال يتم تحميل حالة المصادقة، يمكن عرض مؤشر تحميل
  if (isAuthLoading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-danger"></div>
      </div>
    );
  }

  // إذا كان المستخدم مسجلاً دخوله، أعد توجيهه إلى الصفحة الرئيسية
  if (authUser) {
    return <Navigate to="/" replace />;
  }

  // إذا لم يكن المستخدم مسجلاً دخوله، اسمح بعرض المسارات الفرعية
  return <Outlet />;
}
