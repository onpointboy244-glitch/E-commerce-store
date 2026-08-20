import { Router } from "express";
import { db, FieldValue } from "../../db.js";
import { verifyAuth } from "../../middleware/auth.js";

const router = Router();

// 📊 Report a failed verification attempt (authenticated)
router.post("/report-verify-failed", verifyAuth, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const ref = db.collection("_signupAttempts").doc(email);
    await ref.set(
      {
        count: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const snap = await ref.get();
    const count = snap.data()?.count || 0;
    console.log(`📊 Verify attempt for ${email}: ${count}/3`);

    return res.json({ blocked: count >= 3 });
  } catch (err) {
    console.error("❌ Report-verify-failed error:", err.message);
    res.json({ blocked: false });
  }
});

export default router;
