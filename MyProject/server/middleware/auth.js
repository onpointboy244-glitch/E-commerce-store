import { auth } from "../db.js";

export async function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split("Bearer ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ error: "Authorization token is required" });
  }

  try {
    const decoded = await auth.verifyIdToken(token);

    // Verify user is not disabled
    const userRecord = await auth.getUser(decoded.uid);
    if (userRecord.disabled) {
      console.error("❌ Auth verification failed: account disabled");
      return res.status(403).json({ error: "Account has been disabled" });
    }

    req.userId = decoded.uid; // trusted userId from the signed token
    next();
  } catch (err) {
    console.error("❌ Auth verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
