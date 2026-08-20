import { Router } from "express";
import { db } from "../db.js";

const router = Router();

// Get all products (public)
router.get("/products", async (req, res) => {
  try {
    const snapshot = await db.collection("products").get();
    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json({ success: true, products });
  } catch (error) {
    console.error("Products fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get product by ID
router.get("/products/:id", async (req, res) => {
  try {
    const doc = await db.collection("products").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ success: true, product: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error("Product fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

export default router;
