import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { readFileSync, existsSync } from "fs";
import { createPrivateKey } from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Load Firebase Service Account ──────────────────────────────────────────
// Priority:
//   1. FIREBASE_SERVICE_ACCOUNT_BASE64 — base64 of the whole JSON (paste-proof)
//   2. Render Secret File at /etc/secrets/serviceAccountKey.json
//   3. Local dev file server/serviceAccountKey.json
// The base64 route exists because pasting JSON with \n sequences into a
// browser field can introduce invisible characters (NBSP, smart quotes) that
// survive JSON.parse but break OpenSSL's key parser.
import { Buffer } from "buffer";

const tryReadFile = (p) =>
  existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;

let serviceAccount;
let credSource;

if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8")
  );
  credSource = "FIREBASE_SERVICE_ACCOUNT_BASE64 env var";
} else if (existsSync("/etc/secrets/serviceAccountKey.json")) {
  serviceAccount = tryReadFile("/etc/secrets/serviceAccountKey.json");
  credSource = "Render Secret File (/etc/secrets/serviceAccountKey.json)";
} else if (existsSync(join(__dirname, "serviceAccountKey.json"))) {
  serviceAccount = tryReadFile(join(__dirname, "serviceAccountKey.json"));
  credSource = "local serviceAccountKey.json";
}

if (!serviceAccount) {
  console.error("❌ ERROR: No Firebase credentials found!");
  console.error("   Set FIREBASE_SERVICE_ACCOUNT_BASE64, mount a Secret File");
  console.error("   at /etc/secrets/serviceAccountKey.json, or place");
  console.error("   serviceAccountKey.json in: " + __dirname);
  process.exit(1);
}

// Heal double-escaped newlines (raw paste artifacts).
if (
  typeof serviceAccount.private_key === "string" &&
  serviceAccount.private_key.includes("\\n")
) {
  console.warn("⚠️ private_key contained literal \\n — healing automatically.");
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
}

// Fail fast with a precise reason instead of a cryptic OpenSSL error later.
try {
  createPrivateKey(serviceAccount.private_key);
} catch (e) {
  console.error("❌ Private key failed crypto parse:", e.message);
  const pk = String(serviceAccount.private_key || "");
  console.error("   length:", pk.length);
  console.error("   first 40 chars:", JSON.stringify(pk.slice(0, 40)));
  console.error("   last 40 chars:", JSON.stringify(pk.slice(-40)));
  // Show any suspicious invisible characters.
  const bad = [...pk].filter(
    (c) => c.charCodeAt(0) > 126 || (c.charCodeAt(0) < 32 && c !== "\n")
  );
  if (bad.length) {
    console.error(
      "   ⚠️ Found",
      bad.length,
      "invisible/suspicious chars:",
      [...new Set(bad)]
        .map((c) => "U+" + c.charCodeAt(0).toString(16).padStart(4, "0"))
        .join(", ")
    );
  } else {
    console.error("   no invisible characters detected");
  }
  process.exit(1);
}

console.log(`🔑 Firebase credentials loaded from: ${credSource}`);

initializeApp({
  credential: cert(serviceAccount),
});

export const db = getFirestore();
export const auth = getAuth();
export { FieldValue };
