import { useMutation, useQueryClient } from "@tanstack/react-query";
import { auth } from "@/firebaseconfig";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

/**
 * Save just the address to the user's profile via the server endpoint.
 * Reads existing fullname/phone from the react-query cache so it
 * doesn't need the component to pass them — keeps the interface lean.
 */
export function useSaveProfileAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ address }) => {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("You must be signed in");

      // Read existing profile fields from cache (so we don't overwrite with blanks)
      const cachedUser = queryClient.getQueryData(["user"]);
      const idToken = await currentUser.getIdToken();

      const newProfileData = {
        fullname: cachedUser?.fullname || currentUser.displayName || "Update Name",
        phone: cachedUser?.phone || currentUser.phoneNumber || "0790000000",
        address: {
          city: address.city || "",
          street: address.street || "",
          building_number: address.building_number || "",
        },
      };

      const res = await fetch(`${SERVER_URL}/api/update-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ newProfileData }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save address");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}
