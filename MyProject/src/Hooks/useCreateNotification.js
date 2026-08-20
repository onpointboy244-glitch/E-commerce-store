import { useMutation } from "@tanstack/react-query";
import { auth } from "@/firebaseconfig";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

/**
 * Standalone hook to create a notification via the server.
 *
 * The server validates the user's Firebase token and writes the
 * notification to Firestore using the Admin SDK. This prevents
 * userId spoofing and keeps the client lean.
 *
 * Does NOT set up any onSnapshot listener — that lives in useNotifications
 * and should only be used by the Layout's Notifications component.
 */
export function useCreateNotification() {
  return useMutation({
    mutationFn: async ({ title, message }) => {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("You must be signed in to create a notification");

      const idToken = await currentUser.getIdToken();

      const res = await fetch(`${SERVER_URL}/api/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ title, message }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create notification");
      }
    },
  });
}
