import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebaseconfig";

export function useOrders(user) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.uid) return;

    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("userId", "==", user.uid),
      orderBy("orderDate", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      // تحديث الكاش يدوياً لضمان المزامنة اللحظية
      queryClient.setQueryData(["orders", user.uid], ordersData);
    });

    return () => unsubscribe();
  }, [user?.uid, queryClient]);

  return useQuery({
    queryKey: ["orders", user?.uid],
    queryFn: () => queryClient.getQueryData(["orders", user?.uid]) ?? [],
    enabled: !!user?.uid,
    staleTime: Infinity,
  });
}
