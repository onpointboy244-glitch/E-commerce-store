import { Router } from "express";
import { createRequire } from "module";
import isemail from "isemail";
import { db } from "../../db.js";

const require = createRequire(import.meta.url);
const disposableDomains = require("disposable-email-domains");

const router = Router();

function abort(res, reason) {
  return res.json({ valid: false, reason });
}

// 🔍 Check signup — validate email + phone before creating Auth account
router.post("/check-signup", async (req, res) => {
  try {
    const { email, phone, password, confirmPassword } = req.body;
    if (!email || !phone) return abort(res, "blocked");

    // 0.a Server-side password validation
    if (!password || password.length < 8) {
      return abort(res, "weak-password");
    }
    if (!confirmPassword || password !== confirmPassword) {
      return abort(res, "password-mismatch");
    }

    // 0. Check verification attempt limit
    const attemptDoc = await db.collection("_signupAttempts").doc(email).get();
    if (attemptDoc.exists && (attemptDoc.data().count || 0) >= 3) {
      return abort(res, "max-attempts");
    }

    // 0.b Validate email format + TLD
    if (!isemail.validate(email)) {
      return abort(res, "blocked");
    }

    // 1. Check if email domain is disposable (generic error — no clues)
    const domain = email.split("@")[1]?.toLowerCase();
    if (domain && disposableDomains.includes(domain)) {
      return abort(res, "blocked");
    }

    // 2. Check if phone already exists
    const usersRef = db.collection("users");
    const phoneQuery = usersRef.where("phone", "==", phone);
    const phoneSnapshot = await phoneQuery.get();
    if (!phoneSnapshot.empty) {
      return abort(res, "phone-taken");
    }

    // 3. Check if email already exists
    const emailQuery = usersRef.where("email", "==", email);
    const emailSnapshot = await emailQuery.get();
    if (!emailSnapshot.empty) {
      const existingUser = emailSnapshot.docs[0].data();
      if (existingUser.method === "google") {
        return abort(res, "method-google");
      }
      return abort(res, "email-taken");
    }

    return res.json({ valid: true });
  } catch (err) {
    console.error("❌ Check-signup error:", err.message);
    return abort(res, "blocked");
  }
});

export default router;
