import { useQuery } from "@tanstack/react-query";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebaseconfig";
import { doc, getDoc } from "firebase/firestore";

export function useAuthUser() {
  return useQuery({
    queryKey: ["user"], // تغيير المفتاح ليكون عاماً
    queryFn: async () => {
      // 1. الحصول على مستخدم الـ Auth بطريقة Promise لضمان انتظار النتيجة قبل إغلاق التحميل
      const firebaseUser = await new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(
          auth,
          (user) => {
            unsubscribe();
            resolve(user);
          },
          reject,
        );
      });

      if (!firebaseUser) return null;

      // 2. جلب بيانات المستخدم كاملة من (فايرستور) فوراً
      const docRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { ...firebaseUser, ...docSnap.data() };
      }
      return firebaseUser;
    },

    staleTime: Infinity,
    gcTime: Infinity,
  });
}
