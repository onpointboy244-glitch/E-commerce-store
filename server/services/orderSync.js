import { db, FieldValue } from "../db.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calculateOrderStatus(items) {
  if (!items || items.length === 0) return "pending";
  const statuses = items.map((item) =>
    String(item.status || "pending").toLowerCase()
  );
  if (statuses.every((s) => s === "delivered")) return "delivered";
  if (statuses.some((s) => s !== "pending")) return "processing";
  return "pending";
}

async function sendNotification(userId, title, message) {
  const expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + 7);
  await db.collection("notifications").add({
    userId,
    title,
    message,
    isRead: false,
    timestamp: FieldValue.serverTimestamp(),
    expiresAt: expireDate,
  });
}

async function updatePersistentTracker(orderId, orderData) {
  await db
    .collection("_serverTracker")
    .doc(orderId)
    .set(
      {
        userId: orderData.userId,
        items: orderData.items.map((item) => ({
          productId: item.productId,
          status: item.status || "pending",
          name: item.name,
        })),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
}

// ─── Background Sync ─────────────────────────────────────────────────────────

export function startOrderStatusSync() {
  const ordersRef = db.collection("orders");
  const orderTracker = new Map();

  ordersRef.onSnapshot(async (snapshot) => {
    const changes = snapshot.docChanges();

    async function processChange(change) {
      const orderData = change.doc.data();
      const orderId = change.doc.id;
      const items = orderData.items || [];

      // ── ADDED ────────────────────────────────────────────────────────────────
      if (change.type === "added") {
        orderTracker.set(orderId, {
          status: orderData.status,
          items: items.map((item) => ({
            productId: item.productId,
            status: item.status || "pending",
            name: item.name,
          })),
        });

        if (items.length === 0) return;

        // Read persistent tracker for offline change detection
        let trackerSnapshot = null;
        try {
          const trackerDoc = await db
            .collection("_serverTracker")
            .doc(orderId)
            .get();
          if (trackerDoc.exists) trackerSnapshot = trackerDoc.data();
        } catch (err) {
          console.error(`Failed to read tracker for ${orderId}:`, err.message);
        }

        if (!trackerSnapshot) {
          // First time seeing this order — persist tracker and skip
          try {
            await updatePersistentTracker(orderId, orderData);
          } catch (err) {
            console.error(
              `Failed to create tracker for ${orderId}:`,
              err.message
            );
          }
          return;
        }

        // Tracker exists → detect deltas (offline changes)
        const prevTrackedItems = trackerSnapshot.items || [];
        let hasChanges = false;

        for (const item of items) {
          const currentStatus = String(
            item.status || "pending"
          ).toLowerCase();
          const prevTracked = prevTrackedItems.find(
            (pi) => pi.productId === item.productId
          );
          const prevTrackedStatus = prevTracked
            ? String(prevTracked.status).toLowerCase()
            : "pending";

          if (prevTracked && currentStatus !== prevTrackedStatus) {
            hasChanges = true;
            const actionMsg =
              currentStatus === "shipped"
                ? "has been shipped"
                : currentStatus === "delivered"
                  ? "has been delivered"
                  : currentStatus === "processing"
                    ? "is being processed"
                    : "has been updated";

            try {
              await sendNotification(
                orderData.userId,
                "Item Update 📦",
                `Your item (${item.name || "Unknown"}) in order #${orderId.slice(-5)} ${actionMsg}`
              );
              console.log(
                `🔔 Offline notification: ${orderId} ${item.name} ${prevTrackedStatus} → ${currentStatus}`
              );
            } catch (err) {
              console.error(
                `Failed to create offline notification for ${orderId}:`,
                err.message
              );
            }
          }
        }

        try {
          await updatePersistentTracker(orderId, orderData);
        } catch (err) {
          // tracker write should never block
        }

        if (hasChanges) {
          const targetStatus = calculateOrderStatus(items);
          const currentOrderStatus = String(
            orderData.status || "pending"
          ).toLowerCase();
          if (currentOrderStatus !== targetStatus) {
            try {
              await change.doc.ref.update({ status: targetStatus });
              console.log(
                `📦 Order ${orderId}: ${currentOrderStatus} → ${targetStatus} (offline sync)`
              );

              if (targetStatus === "delivered") {
                await sendNotification(
                  orderData.userId,
                  "Order Completed! 🎉",
                  `Success! Your order #${orderId.slice(-5)} has been fully delivered.`
                );
                console.log(`🔔 Order completed notification for ${orderId}`);
              }
            } catch (err) {
              console.error(
                `Failed to sync order status for ${orderId}:`,
                err.message
              );
            }
          }
        }
        return;
      }

      // ── MODIFIED ──────────────────────────────────────────────────────────────
      if (change.type !== "modified") return;
      if (items.length === 0) return;

      const prevState = orderTracker.get(orderId);
      const prevItems = prevState ? prevState.items : [];

      // 1. Detect item status changes → notifications
      for (const item of items) {
        const itemId = item.productId;
        const currentItemStatus = String(
          item.status || "pending"
        ).toLowerCase();
        const prevItem = prevItems.find((pi) => pi.productId === itemId);
        const prevItemStatus = prevItem
          ? String(prevItem.status).toLowerCase()
          : "pending";

        if (prevItem && currentItemStatus !== prevItemStatus) {
          const actionMsg =
            currentItemStatus === "shipped"
              ? "has been shipped"
              : currentItemStatus === "delivered"
                ? "has been delivered"
                : currentItemStatus === "processing"
                  ? "is being processed"
                  : "has been updated";

          try {
            await sendNotification(
              orderData.userId,
              "Item Update 📦",
              `Your item (${item.name || "Unknown"}) in order #${orderId.slice(-5)} ${actionMsg}`
            );
            console.log(
              `🔔 Notification for order ${orderId}: ${item.name} → ${currentItemStatus}`
            );
          } catch (err) {
            console.error(
              `Failed to create notification for ${orderId}:`,
              err.message
            );
          }
        }
      }

      // 2. Update in-memory tracker + persist
      orderTracker.set(orderId, {
        status: orderData.status,
        items: items.map((item) => ({
          productId: item.productId,
          status: item.status || "pending",
          name: item.name,
        })),
      });

      try {
        await updatePersistentTracker(orderId, orderData);
      } catch (err) {
        // tracker write should never block
      }

      // 3. Sync overall order status
      const currentStatus = String(
        orderData.status || "pending"
      ).toLowerCase();
      const targetStatus = calculateOrderStatus(items);
      const prevOrderStatus = prevState
        ? String(prevState.status || "").toLowerCase()
        : "";

      if (currentStatus !== targetStatus) {
        try {
          await change.doc.ref.update({ status: targetStatus });
          console.log(
            `📦 Order ${orderId}: ${currentStatus} → ${targetStatus} (auto-sync)`
          );

          if (
            targetStatus === "delivered" &&
            prevOrderStatus !== "delivered"
          ) {
            await sendNotification(
              orderData.userId,
              "Order Completed! 🎉",
              `Success! Your order #${orderId.slice(-5)} has been fully delivered.`
            );
            console.log(`🔔 Order completed notification for ${orderId}`);
          } else if (
            targetStatus === "processing" &&
            prevOrderStatus === "delivered"
          ) {
            await sendNotification(
              orderData.userId,
              "Order Status Update 🔄",
              `Order #${orderId.slice(-5)} is back to processing.`
            );
            console.log(`🔔 Order re-processing notification for ${orderId}`);
          }
        } catch (err) {
          console.error(`Failed to update order ${orderId}:`, err.message);
        }
      }
    }

    // Process changes sequentially to avoid races
    for (const change of changes) {
      await processChange(change);
    }
  });

  console.log(
    "👂 Order status sync started — watching for item status changes + notifications"
  );
}
