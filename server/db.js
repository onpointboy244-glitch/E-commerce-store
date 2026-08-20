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
// Production (Render etc.): either
//   - FIREBASE_SERVICE_ACCOUNT env var with the full JSON (private_key \n's
//     escaped), or
//   - a Secret File mounted at /etc/secrets/serviceAccountKey.json (Render)
//     — byte-for-byte copy of the file, nothing gets mangled in transit.
let serviceAccount;

const tryReadFile = (p) =>
  existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;

serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : tryReadFile("/etc/secrets/serviceAccountKey.json") ??
    tryReadFile(join(__dirname, "serviceAccountKey.json"));

if (!serviceAccount) {
  console.error("❌ ERROR: No Firebase credentials found!");
  console.error("   Set FIREBASE_SERVICE_ACCOUNT env var, or mount a Secret");
  console.error("   File at /etc/secrets/serviceAccountKey.json, or place");
  console.error("   serviceAccountKey.json in: " + __dirname);
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount),
});

export const db = getFirestore();
export const auth = getAuth();
export { FieldValue };
