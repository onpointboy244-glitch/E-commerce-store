import { Router } from "express";
import { db, auth, FieldValue } from "../../db.js";
import { verifyAuth } from "../../middleware/auth.js";

const router = Router();

// ✅ Complete signup — saves user to Firestore immediately (email may be unverified)
router.post("/complete-signup", verifyAuth, async (req, res) => {
  try {
    const { userData } = req.body;
    const userId = req.userId;

    if (!userData || !userId) {
      return res.status(400).json({ error: "Invalid request" });
    }

    // Check actual verification status from Firebase Auth
    const userRecord = await auth.getUser(userId);
    const isVerified = userRecord.emailVerified;

    // Double-check no duplicate doc
    const existingDoc = await db.collection("users").doc(userId).get();
    if (existingDoc.exists) {
      return res.json({ success: true, message: "Already registered" });
    }

    // استخراج الحقول المطلوبة فقط لتجنب ثغرة Mass Assignment
    const { email, fullname, phone, address, method } = userData;

    await db
      .collection("users")
      .doc(userId)
      .set({
        uid: userId,
        email: email || "",
        fullname: fullname || "",
        phone: phone || "",
        address: {
          city: address?.city || "",
          street: address?.street || "",
          building_number: address?.building_number || "",
          details: address?.details || "",
        },
        method: method || "",
        role: "customer", // دائماً نفرض دور العميل هنا
        verified: isVerified,
        createdAt: FieldValue.serverTimestamp(),
      });

    console.log(
      `✅ User ${userId} saved to Firestore (${isVerified ? "verified" : "pending verification"})`,
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Complete-signup error:", err.message);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

export default router;
