import { Router } from "express";
import { db, FieldValue } from "../db.js";
import { verifyAuth } from "../middleware/auth.js";

const router = Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build an order server-side — fetches real prices from DB,
 * applies offers, calculates shipping/tax/total. Never trust client prices.
 */
async function buildOrder(userId, cartItems, shippingAddress) {
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error("No items provided");
  }

  let subtotal = 0;
  let shipping = 0;
  const shippingOptionIds = new Set();
  const items = [];

  // 1. Build items array with real DB prices
  for (const item of cartItems) {
    if (!item.productId) throw new Error("Each item must have a productId");

    const quantity = Math.max(1, parseInt(item.quantity) || 1);
    const deliveryOptionId = item.deliveryOptionId || "1";

    const productDoc = await db
      .collection("products")
      .doc(item.productId)
      .get();
    if (!productDoc.exists) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    const product = productDoc.data();
    const unitPrice = product.price;

    const hasOffer = product.offer && product.offer > 0;
    const offerExpired =
      hasOffer &&
      product.offerEndsAt &&
      new Date() > new Date(product.offerEndsAt);
    const effectivePrice =
      hasOffer && !offerExpired
        ? unitPrice * (1 - product.offer / 100)
        : unitPrice;

    if (typeof unitPrice !== "number" || unitPrice < 0) {
      throw new Error(
        `Invalid price for product: ${product.name || item.productId}`,
      );
    }

    const itemTotal = effectivePrice * quantity;
    subtotal += itemTotal;
    shippingOptionIds.add(deliveryOptionId);

    items.push({
      productId: item.productId,
      name: product.name,
      image: product.image || "",
      price: effectivePrice,
      quantity,
      itemTotal,
      deliveryOptionId,
      deliveryPrice: 0,
      status: "pending",
      estimatedDeliveryDate: null,
    });
  }

  // 2. Calculate shipping from DB delivery options
  for (const optionId of shippingOptionIds) {
    const optionDoc = await db
      .collection("DeliveryOptions")
      .doc(optionId)
      .get();
    if (optionDoc.exists) {
      shipping += parseFloat(optionDoc.data().deliveryprice) || 0;
    }
  }

  // 3. Calculate tax and total
  const totalBeforeTax = subtotal + shipping;
  const tax = totalBeforeTax * 0.1;
  const orderTotal = totalBeforeTax + tax;

  // 4. Fill delivery price and estimated date per item
  for (const item of items) {
    const optionDoc = await db
      .collection("DeliveryOptions")
      .doc(item.deliveryOptionId)
      .get();
    if (optionDoc.exists) {
      const option = optionDoc.data();
      item.deliveryPrice = parseFloat(option.deliveryprice) || 0;

      const days = parseInt(option.deliverydays) || 1;
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + days);
      item.estimatedDeliveryDate = deliveryDate;
    }
  }

  return {
    userId,
    items,
    subtotal: Math.round(subtotal * 100) / 100,
    shippingPrice: Math.round(shipping * 100) / 100,
    totalBeforeTax: Math.round(totalBeforeTax * 100) / 100,
    taxAmount: Math.round(tax * 100) / 100,
    totalAmount: parseFloat(orderTotal.toFixed(2)),
    status: "pending",
    orderDate: FieldValue.serverTimestamp(),
    serverVerified: true,
    shippingAddress: shippingAddress || null,
  };
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// 🔒 Place Order — server does all calculations, client sends only cartItems
router.post("/orders", verifyAuth, async (req, res) => {
  try {
    const { cartItems, shippingAddress } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart items are required" });
    }

    const orderData = await buildOrder(userId, cartItems, shippingAddress);
    const orderRef = await db.collection("orders").add(orderData);

    console.log(
      `✅ Order ${orderRef.id} placed by user ${userId}` +
        ` | Items: ${orderData.items.length} | Total: ${orderData.totalAmount} JD`,
    );

    res.json({
      success: true,
      orderId: orderRef.id,
      totalAmount: orderData.totalAmount,
      message: "Order placed successfully",
    });
  } catch (error) {
    console.error("❌ Order error:", error.message);
    res.status(400).json({ error: error.message });
  }
});

export default router;
