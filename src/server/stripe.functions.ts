import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { computeStripeSignature, newAttemptId } from "./stripe.server";

const RetryInput = z.object({ eventId: z.string().min(1).max(120) });

export type RetryAttempt = {
  id: string;
  at: number;
  status: number;
  ok: boolean;
  latencyMs: number;
  responseExcerpt: string;
  error?: string;
};

/**
 * Retry a Stripe webhook by re-POSTing the original payload to our public
 * receiver with a freshly computed signature header. Returns a structured
 * result the UI can append to the event's attempts[] log.
 */
export const retryStripeWebhook = createServerFn({ method: "POST" })
  .inputValidator((input) => RetryInput.parse(input))
  .handler(async ({ data }): Promise<{ ok: boolean; attempt: RetryAttempt; needsSecret?: boolean }> => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const baseUrl = process.env.PUBLIC_APP_URL ?? "";

    // Reconstruct the canonical Stripe event payload. In a real backend
    // we would load it from the events table; with the mock store the
    // client passes id-only and we synthesise a representative payload.
    const payload = JSON.stringify({
      id: `evt_${data.eventId}`,
      type: "invoice.payment_succeeded",
      created: Math.floor(Date.now() / 1000),
      data: { object: { id: `in_${data.eventId}`, status: "paid" } },
    });

    if (!secret) {
      return {
        ok: false,
        needsSecret: true,
        attempt: {
          id: newAttemptId(),
          at: Date.now(),
          status: 0,
          ok: false,
          latencyMs: 0,
          responseExcerpt: "STRIPE_WEBHOOK_SECRET is not configured.",
          error: "missing_secret",
        },
      };
    }

    const { header } = computeStripeSignature(payload, secret);
    const url = `${baseUrl || "http://localhost:8080"}/api/public/stripe/webhook`;

    const startedAt = Date.now();
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Stripe-Signature": header },
        body: payload,
      });
      const text = await res.text();
      return {
        ok: res.ok,
        attempt: {
          id: newAttemptId(),
          at: Date.now(),
          status: res.status,
          ok: res.ok,
          latencyMs: Date.now() - startedAt,
          responseExcerpt: text.slice(0, 240),
        },
      };
    } catch (err) {
      return {
        ok: false,
        attempt: {
          id: newAttemptId(),
          at: Date.now(),
          status: 0,
          ok: false,
          latencyMs: Date.now() - startedAt,
          responseExcerpt: err instanceof Error ? err.message : "Unknown network error",
          error: "network",
        },
      };
    }
  });
