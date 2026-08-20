import { Router } from "express";
import { db, FieldValue } from "../../db.js";
import { verifyAuth } from "../../middleware/auth.js";

const router = Router();

// ✅ Complete Google sign-in — saves/reads user from Firestore server-side
router.post("/complete-google-signin", verifyAuth, async (req, res) => {
  try {
    const { email, fullname } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const docRef = db.collection("users").doc(userId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return res.json({
        success: true,
        user: { ...docSnap.data(), uid: userId },
      });
    }

    // New Google user — create doc server-side
    const userData = {
      uid: userId,
      email: email || "",
      fullname: fullname || email?.split("@")[0] || "User",
      role: "customer",
      method: "google",
      createdAt: FieldValue.serverTimestamp(),
    };
    await docRef.set(userData);

    console.log(`✅ Google user ${userId} saved to Firestore`);

    res.json({ success: true, user: userData });
  } catch (err) {
    console.error("❌ Complete-google-signin error:", err.message);
    res.status(500).json({ error: "Sign-in failed. Please try again." });
  }
});

export default router;
