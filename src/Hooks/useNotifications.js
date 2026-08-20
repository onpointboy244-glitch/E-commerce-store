import { useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  collection,
  where,
  orderBy,
  query,
  onSnapshot,
  doc,
  updateDoc,
  limit,
} from "firebase/firestore";
import { db } from "@/firebaseconfig";
import { useAuthUser } from "./useAuthUser";

export function useNotifications() {
  const { data: user } = useAuthUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.uid) return;

    // حساب تاريخ قبل 7 أيام من الآن للفلترة
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // المراقبة اللحظية للإشعارات الخاصة بالمستخدم
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", user.uid),
      where("timestamp", ">=", sevenDaysAgo), // جلب فقط الإشعارات الجديدة (آخر 7 أيام)
      orderBy("timestamp", "desc"),
      limit(15), // نقيّد عدد الإشعارات التي نعرضها
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      // تحديث الكاش فوراً عشان الواجهة تتحدث
      queryClient.setQueryData(["notifications", user.uid], notificationsData);
    });

    return () => unsubscribe();
  }, [user?.uid, queryClient]);

  // (موتيشن) لتغيير حالة الإشعار إلى "مقروء"
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, { isRead: true });
    },
  });

  const notificationsResult = useQuery({
    queryKey: ["notifications", user?.uid],
    queryFn: () => queryClient.getQueryData(["notifications", user?.uid]) ?? [],
    enabled: !!user?.uid,
    staleTime: Infinity, // البيانات بتوصلنا لحظياً فما في داعي لعمل (ريفيتش)
  });

  // حساب عدد الإشعارات غير المقروءة للـ (بادج)
  const unreadCount =
    notificationsResult.data?.filter((n) => !n.isRead).length || 0;

  return {
    ...notificationsResult,
    unreadCount,
    markAsRead: markAsReadMutation.mutate,
  };
}
