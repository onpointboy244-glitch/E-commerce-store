import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Load Firebase Service Account ──────────────────────────────────────────
// Local dev: serviceAccountKey.json file in this folder.
// Production (Render etc.): FIREBASE_SERVICE_ACCOUNT env var containing the
// full JSON (newlines of private_key must be escaped as \n).
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  const serviceAccountPath = join(__dirname, "serviceAccountKey.json");

  if (!existsSync(serviceAccountPath)) {
    console.error("❌ ERROR: No Firebase credentials found!");
    console.error(
      "   Set FIREBASE_SERVICE_ACCOUNT env var (production) or place"
    );
    console.error("   serviceAccountKey.json in: " + __dirname);
    process.exit(1);
  }

  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
}

initializeApp({
  credential: cert(serviceAccount),
});

export const db = getFirestore();
export const auth = getAuth();
export { FieldValue };
