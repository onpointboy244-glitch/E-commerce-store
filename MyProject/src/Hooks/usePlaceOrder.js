import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useCreateNotification } from "./useCreateNotification";
import { auth } from "@/firebaseconfig";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export function usePlaceOrder() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutate: createNotification } = useCreateNotification();

  const mutation = useMutation({
    mutationFn: async ({ cartItems, shippingAddress }) => {
      if (!cartItems || cartItems.length === 0) {
        throw new Error("There are no items to be ordered.");
      }

      // 🔐 Get the Firebase ID token from the current user
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("You must be signed in to place an order.");
      }
      const idToken = await currentUser.getIdToken();

      const loadingToast = toast.loading("Processing your order...");
      try {
        const body = { cartItems };
        if (shippingAddress) body.shippingAddress = shippingAddress;

        const response = await fetch(`${API_URL}/api/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to place order");
        }

        return data;
      } finally {
        toast.dismiss(loadingToast);
      }
    },
    onSuccess: (data) => {
      createNotification({
        title: "Order Confirmed! 🚀",
        message: `Great news! Your order #${data.orderId.slice(0, 8)} has been placed successfully.`,
      });
      toast.success("Your order has been placed successfully! 🎉");

      queryClient.invalidateQueries({ queryKey: ["orders"] });
      navigate("/orders");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to place order.");
    },
  });

  return mutation;
}
