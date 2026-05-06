import { createFileRoute } from "@tanstack/react-router";
import { verifyStripeSignature } from "@/server/stripe.server";

/**
 * Local Stripe-compatible receiver. In production this would persist the
 * event; in the demo we just verify and acknowledge so the retry loop is
 * end-to-end real.
 */
export const Route = createFileRoute("/api/public/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_WEBHOOK_SECRET;
        const body = await request.text();
        const sig = request.headers.get("stripe-signature");

        if (!secret) {
          return new Response(JSON.stringify({ error: "secret_not_configured" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
        if (!verifyStripeSignature(sig, body, secret)) {
          return new Response("invalid signature", { status: 401 });
        }
        let parsed: unknown = null;
        try {
          parsed = JSON.parse(body);
        } catch {
          return new Response("invalid json", { status: 400 });
        }
        const eventId = (parsed as { id?: string })?.id ?? "unknown";
        return Response.json({ received: true, id: eventId, at: Date.now() });
      },
    },
  },
});
