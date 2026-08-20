import { Router } from "express";
import { db, FieldValue } from "../db.js";
import { verifyAuth } from "../middleware/auth.js";

const router = Router();

// ─── Admin auth gate ──────────────────────────────────────────────────────
async function verifyAdmin(req, res, next) {
  try {
    const { auth } = await import("../db.js");
    const userRecord = await auth.getUser(req.userId);
    const userDoc = await db.collection("users").doc(req.userId).get();
    if (!userDoc.exists || userDoc.data().role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  } catch (err) {
    return res.status(403).json({ error: "Admin verification failed" });
  }
}

// ─── Products ──────────────────────────────────────────────────────────────

// Add product
router.post("/admin/products", verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { name, price, type, image, description, offer, rating, offerEndsAt } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: "Name and price are required" });
    }

    const docRef = await db.collection("products").add({
      name,
      price: parseFloat(price) || 0,
      type: type || "",
      image: image || "",
      description: description || "",
      offer: offer ? parseFloat(offer) : 0,
      rating: rating ? parseFloat(rating) : 0,
      offerEndsAt: offerEndsAt || null,
      createdAt: FieldValue.serverTimestamp(),
    });

    console.log(`✅ Admin added product: ${docRef.id}`);
    res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("❌ Admin add product error:", err.message);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// Update product
router.put("/admin/products/:id", verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, type, image, description, offer, rating, offerEndsAt } = req.body;

    const docRef = db.collection("products").doc(id);
    const snap = await docRef.get();
    if (!snap.exists) {
      return res.status(404).json({ error: "Product not found" });
    }

    await docRef.update({
      name,
      price: parseFloat(price) || 0,
      type: type || "",
      image: image || "",
      description: description || "",
      offer: offer !== undefined ? parseFloat(offer) : 0,
      rating: rating !== undefined ? parseFloat(rating) : 0,
      offerEndsAt: offerEndsAt || null,
      updatedAt: FieldValue.serverTimestamp(),
    });

    console.log(`✅ Admin updated product: ${id}`);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Admin update product error:", err.message);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Delete product
router.delete("/admin/products/:id", verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("products").doc(id);
    const snap = await docRef.get();
    if (!snap.exists) {
      return res.status(404).json({ error: "Product not found" });
    }
    await docRef.delete();
    console.log(`✅ Admin deleted product: ${id}`);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Admin delete product error:", err.message);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// Delete order
router.delete("/admin/orders/:id", verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("orders").doc(id);
    const snap = await docRef.get();
    if (!snap.exists) {
      return res.status(404).json({ error: "Order not found" });
    }
    await docRef.delete();
    console.log(`✅ Admin deleted order: ${id}`);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Admin delete order error:", err.message);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

export default router;
