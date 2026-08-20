import { useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "@/firebaseconfig";
import { collection, onSnapshot } from "firebase/firestore";

export function useDeliveryOptions() {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const isFirstLoad = useRef(true);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    const deliveryOptionsCollectionRef = collection(db, "DeliveryOptions");

    const unsubscribe = onSnapshot(deliveryOptionsCollectionRef, (snapshot) => {
      const deliveryOptionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (isFirstLoad.current) {
        queryClient.setQueryData(["deliveryOptions"], deliveryOptionsData);
        isFirstLoad.current = false;
      } else {
        // Update data immediately so the UI reflects the latest state
        queryClient.setQueryData(["deliveryOptions"], deliveryOptionsData);
        setIsUpdating(true);

        // Clear any existing timer so rapid updates extend the banner window
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

        hideTimerRef.current = setTimeout(() => {
          setIsUpdating(false);
          hideTimerRef.current = null;
        }, 5000);
      }
    });

    return () => {
      unsubscribe();
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [queryClient]);

  const query = useQuery({
    queryKey: ["deliveryOptions"],
    queryFn: () => queryClient.getQueryData(["deliveryOptions"]) || [],
    staleTime: Infinity,
  });

  return {
    ...query,
    isUpdating,
    message: "Shipping methods are being updated, please wait",
  };
}
