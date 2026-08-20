import { Router } from "express";
import { db, FieldValue } from "../db.js";
import { verifyAuth } from "../middleware/auth.js";
import { z } from "zod";

const profileSchema = z.object({
  fullname: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .regex(
      /^[a-zA-Z؀-ۿ]{2,}\s+[a-zA-Z؀-ۿ\s]{2,}$/,
      "Invalid full name - please enter at least two names separated by a space",
    ),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(/^(07[789]\d{7})$/, "Invalid phone number - must be a valid Jordanian phone number"),
  address: z.object({
    city: z
      .string()
      .trim()
      .min(1, "City is required")
      .regex(
        /^(amman|irbid|zarqa|zarga|aqaba|madaba|salt|jarash|ajloun|mafraq|ma'an|tafilah|karak|maan)$/i,
        "Invalid city - must be a valid Jordanian city",
      ),
    street: z.string().trim().min(1, "Street is required"),
    building_number: z
      .string()
      .trim()
      .min(1, "Building number is required")
      .regex(/^[\d٠-٩]+$/, "Invalid building number - must contain only digits"),
  }),
});

const router = Router();

// ✅ Update authenticated user's profile
router.post("/update-profile", verifyAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { newProfileData } = req.body;

    if (!newProfileData) {
      return res.status(400).json({ error: "Profile data is required" });
    }

    // Validate with Zod server-side
    const parsed = profileSchema.safeParse(newProfileData);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return res.status(400).json({ error: firstError.message });
    }

    const { fullname, phone, address } = parsed.data;

    const userRef = db.collection("users").doc(userId);
    const docSnap = await userRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    await userRef.update({
      fullname,
      phone,
      address: {
        city: address.city,
        street: address.street,
        building_number: address.building_number,
      },
      updatedAt: FieldValue.serverTimestamp(),
    });

    console.log(`✅ Profile updated for user ${userId}`);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Update-profile error:", err.message);
    res.status(500).json({ error: "Failed to update profile. Please try again." });
  }
});

export default router;
