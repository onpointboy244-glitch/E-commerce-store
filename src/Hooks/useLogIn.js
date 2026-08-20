import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "@/firebaseconfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useRef, useEffect } from "react";
import { useCreateNotification } from "./useCreateNotification";
import { toast } from "sonner";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export function useLogIn(dispatch) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const timer = useRef(null);
  const { mutate: createNotification } = useCreateNotification();

  // تنظيف التايمر لو انفصل الكومبوننت
  useEffect(() => () => clearTimeout(timer.current), []);

  const formMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      try {
        // السيرفر يفحص إذا الإيميل موجود وطريقة التسجيل (جوجل أو فورم)
        const checkRes = await fetch(`${SERVER_URL}/api/check-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const checkData = await checkRes.json();

        if (checkData.exists && checkData.method === "google") {
          throw new Error("google-account-exists");
        }

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const user = userCredential.user;

        // جلب بيانات المستخدم كاملة من (فايرستور) فوراً لإرجاعها للـ (كومبوننت)
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          return { ...docSnap.data(), uid: user.uid };
        }

        // 🚨 حساب موجود في (أوث) لكن ما في دوك في (فايرستور) = حساب غير مُفعّل
        // نمسحه ونطلب منه يسجل من جديد
        if (!user.emailVerified) {
          await user.delete().catch(() => {});
          await signOut(auth);
          throw new Error(
            "This account was not verified. Please sign up again.",
          );
        }

        return {
          uid: user.uid,
          email: user.email,
          fullname: (user.email || "User").split("@")[0],
        };
      } catch (err) {
        if (err.message === "google-account-exists") {
          throw new Error(
            "this account is registered with Google, please use Google sign-in instead.",
          );
        }
        throw err;
      }
    },
    onSuccess: async (userData) => {
      // تحديث الكاش الموحد
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      createNotification({
        title: "Login Successful! 🎉",
        message: `Welcome back, ${userData.fullname}!`,
      });
      navigate("/");
      toast.success(`Login successful! Welcome back, ${userData.fullname}! `);
    },
    onError: (err) => {
      const errorMessage =
        err.code === "auth/invalid-credential"
          ? "Invalid email or password."
          : err.code === "auth/too-many-requests"
            ? "Too many attempts. Please try again later."
            : err.message || err.code || "Login failed.";

      if (timer.current) clearTimeout(timer.current);
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      timer.current = setTimeout(
        () => dispatch({ type: "SET_ERROR", payload: "" }),
        3000,
      );
    },
  });

  const googleMutation = useMutation({
    mutationFn: async () => {
      const provider = new GoogleAuthProvider();
      provider.addScope("email");
      provider.addScope("profile");
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // جلب الإيميل بطريقة أكثر أماناً لضمان عدم وجود قيمة (نل)
      const userEmail =
        user.email || (user.providerData && user.providerData[0]?.email);

      // إذا كان الإيميل غير موجود نهائياً، فهذه مشكلة في استجابة جوجل
      if (!userEmail) {
        await auth.signOut(); // تسجيل خروج المستخدم فوراً من الجلسة الحالية
        const customError = new Error(
          "Failed to sign in with Google: please try again later",
        );
        customError.code = "custom/no-email-from-google";
        throw customError;
      }

      // السيرفر يفحص إذا الإيميل مسجل بطريقة (فورم) — يمنع تسجيل الدخول عبر جوجل
      const checkRes = await fetch(`${SERVER_URL}/api/check-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      const checkData = await checkRes.json();

      const isNewUser = !checkData.exists;

      if (checkData.exists && checkData.method === "form") {
        // حذف الحساب من الـ (أوث) فوراً لتجنب تراكم الحسابات الفارغة في قائمة المستخدمين
        await user.delete().catch(() => {});

        // بنرمي (إيرور) مخصص عشان الـ (أون إيرور) تمسكه
        const customError = new Error(
          "Please log in using your email and password.",
        );
        customError.code = "custom/use-password";
        throw customError;
      }

      return { userResult: result, isNewUser };
    },
    onSuccess: async ({ userResult, isNewUser }) => {
      const user = userResult.user;
      const userEmail = user.email || user.providerData?.[0]?.email;

      // 🔐 Server handles the read/creat of Firestore doc
      const idToken = await user.getIdToken();
      const saveRes = await fetch(`${SERVER_URL}/api/complete-google-signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          email: userEmail,
          fullname: user.displayName,
        }),
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok || !saveData.success) {
        throw new Error(saveData.error || "Failed to complete sign-in");
      }

      const dataToStore = saveData.user;

      // تحديث الكاش الموحد
      await queryClient.invalidateQueries({ queryKey: ["user"] });

      const title = isNewUser
        ? "Registration Successful! 🎉"
        : "Login Successful! 🎉";
      const message = isNewUser
        ? `Welcome aboard, ${dataToStore.fullname}!`
        : `Welcome back, ${dataToStore.fullname}!`;

      createNotification({
        title,
        message,
      });

      navigate("/");
      toast.success(message);
    },
    onError: (err) => {
      if (
        err.code === "custom/use-password" ||
        err.message === "Please log in using your email and password."
      ) {
        dispatch({
          type: "SET_ERROR",
          payload:
            "this account is registered with a password, please use email sign-in instead.",
        });
      } else if (err.code === "custom/no-email-from-google") {
        dispatch({
          type: "SET_ERROR",
          payload: err.message,
        });
      } else if (err.code !== "auth/popup-closed-by-user") {
        dispatch({
          type: "SET_ERROR",
          payload: "failed to login with Google please try again later",
        });
      } else {
        dispatch({ type: "SET_ERROR", payload: "Sign-in was cancelled" });
      }

      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(
        () => dispatch({ type: "SET_ERROR", payload: "" }),
        3000,
      );
    },
  });

  return {
    loginWithEmailAndPassword: formMutation.mutate,
    loginWithGoogle: googleMutation.mutate,
    isLoggingIn: formMutation.isPending || googleMutation.isPending,
  };
}
