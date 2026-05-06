import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";

/**
 * Compute a Stripe-style signature header for a webhook payload.
 * Format mirrors Stripe: `t=<timestamp>,v1=<hmac_sha256_hex>`.
 */
export function computeStripeSignature(payload: string, secret: string, timestamp = Math.floor(Date.now() / 1000)) {
  const signed = `${timestamp}.${payload}`;
  const sig = createHmac("sha256", secret).update(signed, "utf8").digest("hex");
  return { header: `t=${timestamp},v1=${sig}`, timestamp, sig };
}

export function verifyStripeSignature(header: string | null, payload: string, secret: string): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${payload}`, "utf8").digest("hex");
  try {
    return timingSafeEqual(Buffer.from(v1, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export function newAttemptId() {
  return `att_${randomBytes(6).toString("hex")}`;
}
