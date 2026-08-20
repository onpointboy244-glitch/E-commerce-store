import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "firebase/auth";
import { auth } from "@/firebaseconfig";
import { useNavigate } from "react-router-dom";
export function useLogOut() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => signOut(auth),
    onSuccess: () => {
      // تنظيف الكاش الموحد والـ localStorage عند تسجيل الخروج
      queryClient.removeQueries({ queryKey: ["user"] });
      localStorage.removeItem("user");
      navigate("/");
    },
    onError: (error) => {
      console.log(error);
    },
  });
}
