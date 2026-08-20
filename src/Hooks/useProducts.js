import { useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "@/firebaseconfig";
import { collection, onSnapshot } from "firebase/firestore";

export function useProducts(filterType = "all") {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const isFirstLoad = useRef(true);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    const productsCollectionRef = collection(db, "products");

    const unsubscribe = onSnapshot(productsCollectionRef, (snapshot) => {
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (isFirstLoad.current) {
        queryClient.setQueryData(["products"], productsData);
        isFirstLoad.current = false;
      } else {
        // Update data immediately so the UI reflects the latest state
        queryClient.setQueryData(["products"], productsData);
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
    queryKey: ["products"],
    queryFn: () => queryClient.getQueryData(["products"]) || [],

    select: (data) => {
      if (!filterType || filterType === "all") return data;
      return data.filter((product) => product.type === filterType);
    },
    staleTime: Infinity,
  });

  return {
    ...query,
    isUpdating,
    message: "Products are being updated, please wait",
  };
}
