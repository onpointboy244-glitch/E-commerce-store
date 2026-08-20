import { Router } from "express";
import { db, FieldValue } from "../db.js";
import { verifyAuth } from "../middleware/auth.js";

const router = Router();

// ✅ Create a notification for the authenticated user
router.post("/notifications", verifyAuth, async (req, res) => {
  try {
    const { title, message } = req.body;
    const userId = req.userId;

    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 7);

    const docRef = await db.collection("notifications").add({
      userId,
      title,
      message,
      isRead: false,
      timestamp: FieldValue.serverTimestamp(),
      expiresAt: expireDate,
    });

    console.log(`✅ Notification ${docRef.id} created for user ${userId}`);

    res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("❌ Notification error:", err.message);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

export default router;
