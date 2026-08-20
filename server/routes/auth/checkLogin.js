import { Router } from "express";
import { db } from "../../db.js";

const router = Router();

// 🔍 Check login — tells client if account uses Google or form
router.post("/check-login", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.json({ exists: false });

    const usersRef = db.collection("users");
    const q = usersRef.where("email", "==", email);
    const snap = await q.get();

    if (snap.empty) return res.json({ exists: false });

    const method = snap.docs[0].data().method;
    return res.json({ exists: true, method });
  } catch (err) {
    console.error("❌ Check-login error:", err.message);
    return res.json({ exists: false });
  }
});

export default router;
