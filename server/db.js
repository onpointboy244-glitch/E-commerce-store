import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Load Firebase Service Account ──────────────────────────────────────────
// Priority: FIREBASE_SERVICE_ACCOUNT env var → Render Secret File → local file.
const tryReadFile = (p) =>
  existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;

let serviceAccount;
let credSource;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  credSource = "FIREBASE_SERVICE_ACCOUNT env var";
} else if (existsSync("/etc/secrets/serviceAccountKey.json")) {
  serviceAccount = tryReadFile("/etc/secrets/serviceAccountKey.json");
  credSource = "Render Secret File (/etc/secrets/serviceAccountKey.json)";
} else if (existsSync(join(__dirname, "serviceAccountKey.json"))) {
  serviceAccount = tryReadFile(join(__dirname, "serviceAccountKey.json"));
  credSource = "local serviceAccountKey.json";
}

if (!serviceAccount) {
  console.error("❌ ERROR: No Firebase credentials found!");
  console.error("   Set FIREBASE_SERVICE_ACCOUNT env var, or mount a Secret");
  console.error("   File at /etc/secrets/serviceAccountKey.json, or place");
  console.error("   serviceAccountKey.json in: " + __dirname);
  process.exit(1);
}

// Heal double-escaped newlines (happens when the JSON is pasted into a
// dashboard field and \n survives as literal backslash-n).
if (
  typeof serviceAccount.private_key === "string" &&
  serviceAccount.private_key.includes("\\n")
) {
  console.warn("⚠️ private_key contained literal \\n — healing automatically.");
  serviceAccount.private_key = serviceAccount.private_key.replace(
    /\\n/g,
    "\n"
  );
}

console.log(`🔑 Firebase credentials loaded from: ${credSource}`);

initializeApp({
  credential: cert(serviceAccount),
});

export const db = getFirestore();
export const auth = getAuth();
export { FieldValue };
