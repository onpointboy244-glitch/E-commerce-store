import { useMutation, useQueryClient } from "@tanstack/react-query";
import { auth } from "@/firebaseconfig";
import { useCreateNotification } from "./useCreateNotification";
import { toast } from "sonner";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { mutate: createNotification } = useCreateNotification();

  return useMutation({
    mutationFn: async ({ newProfileData }) => {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("You must be signed in to update your profile");

      const idToken = await currentUser.getIdToken();

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
        throw new Error(data.error || "Failed to update profile");
      }
    },
    onSuccess: () => {
      createNotification({
        title: "Profile Updated ✨",
        message: `Your profile information has been updated successfully.`,
      });

      toast.success("Profile updated successfully! ✨");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.message || "Failed to update profile.");
    },
  });
}
