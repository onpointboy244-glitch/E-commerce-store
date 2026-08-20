import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "@/firebaseconfig";
import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { useCreateNotification } from "./useCreateNotification";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export function useSignUp(dispatch) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const timer = useRef(null);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const { mutate: createNotification } = useCreateNotification();

  // تنظيف التايمر لو انفصل الكومبوننت
  useEffect(() => () => clearTimeout(timer.current), []);

  const signupMutation = useMutation({
    mutationFn: async ({
      email,
      password,
      confirmPassword,
      firstname,
      lastname,
      phone,
      city,
      street,
      building,
    }) => {
      // 0. 🚨 Server-side gate — checks disposable email + existing phone
      //     Disposable email → generic "blocked" error (no clues for bots)
      //     Existing phone   → specific "phone-taken" error (user needs to know)
      try {
        const checkRes = await fetch(`${SERVER_URL}/api/check-signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, phone, password, confirmPassword }),
        });
        const checkData = await checkRes.json();
        function abort(reason, message) {
          const err = new Error(message);
          err.reason = reason;
          throw err;
        }

        if (checkData.reason === "phone-taken")
          abort("phone-taken", "This phone number is already registered.");
        if (checkData.reason === "email-taken")
          abort(
            "email-taken",
            "This email is already registered. Please log in instead.",
          );
        if (checkData.reason === "method-google")
          abort(
            "method-google",
            "This email is registered with Google. Please log in using Google.",
          );
        if (checkData.reason === "max-attempts")
          abort(
            "max-attempts",
            "Too many verification attempts. Please try again later.",
          );
        if (checkData.reason === "weak-password")
          abort("weak-password", "Password must be at least 8 characters.");
        if (checkData.reason === "password-mismatch")
          abort("password-mismatch", "Passwords do not match.");
        if (checkData.valid === false)
          abort(
            "blocked",
            "Unable to complete registration. Please try again.",
          );
      } catch (err) {
        if (err.reason) throw err; // known reason → pass through
        throw new Error("Unable to complete registration. Please try again.");
      }

      // إنشاء الحساب في (فايربيز أوث)
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // 3.b إرسال إيميل التحقق والانتظار 60 ثانية
      await sendEmailVerification(user);
      setVerifyingEmail(true);

      const deadline = Date.now() + 60000; // زيادة المهلة إلى 60 ثانية لتجربة مستخدم أفضل
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 2000));
        await user.reload();
        if (user.emailVerified) break;
      }

      setVerifyingEmail(false);

      if (!user.emailVerified) {
        // أخبر السيرفر أن هذا الإيميل فشل بالتحقق (لزيادة العداد)
        const failedToken = await user.getIdToken().catch(() => null);
        if (failedToken) {
          await fetch(`${SERVER_URL}/api/report-verify-failed`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${failedToken}`,
            },
            body: JSON.stringify({ email }),
          }).catch(() => {});
        }

        // حذف الحساب نهائياً من (أوث) عشان ما يضل معلق بدون ما يحفظ بالـ Firestore
        await user.delete();
        throw new Error("verification-timeout");
      }

      // 4. تجهيز بيانات المستخدم للإرسال إلى السيرفر
      const userData = {
        email: email,
        fullname: `${firstname} ${lastname}`,
        phone: phone,
        address: { city: city, street: street, building_number: building },
        method: "form",
      };
      return { userCredential, userData };
    },
    onSuccess: async ({ userCredential, userData }) => {
      const user = userCredential.user;

      // 🔐 السيرفر هو اللي بحفظ بالـ Firestore بعد ما يتأكد من الإيميل
      const idToken = await user.getIdToken();
      const saveRes = await fetch(`${SERVER_URL}/api/complete-signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ userData }),
      });

      if (!saveRes.ok) {
        const errData = await saveRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to complete registration");
      }

      // تحديث الكاش لضمان مزامنة البيانات فوراً
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      createNotification({
        title: "Registration Successful! 🎉",
        message: `Welcome aboard, ${userData.fullname}!`,
      });
      navigate("/");
    },
    onError: (err) => {
      if (timer.current) clearTimeout(timer.current);
      setVerifyingEmail(false);

      const errorMessage =
        err.message === "verification-timeout"
          ? "Verification email expired. Please request a new one and make sure to check your inbox within 60 seconds."
          : err.code === "auth/email-already-in-use"
            ? "This email is already registered. Please log in instead."
            : err.code === "auth/weak-password"
              ? "Password is too weak."
              : err.message ||
                "An unexpected error occurred. Please try again.";

      // التأكد من أن رسالة الخطأ لا تتجاوز طول معين إذا كانت من (فايربيز) مباشرة
      // if (errorMessage.length > 100) errorMessage = "An error occurred. Please try again.";
      dispatch({ type: "SET_ERROR", payload: errorMessage });

      // تصفير رسالة الخطأ بعد ٤ ثواني
      timer.current = setTimeout(
        () => dispatch({ type: "SET_ERROR", payload: "" }),
        4000,
      );
    },
  });

  return {
    signUp: signupMutation.mutate,
    isSigningUp: signupMutation.isPending || verifyingEmail,
    verifyingEmail,
  };
}
