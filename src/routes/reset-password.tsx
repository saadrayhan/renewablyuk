import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "Reset password — Renewably UK" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [email, setEmail] = useState("");

  const onRequest = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Backend disabled — pretend a reset link was sent to " + (email || "you") + ".");
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll email you a link to reset it."
      footer={
        <Link
          to="/sign-in"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={onRequest} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="press inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground"
        >
          Send reset link
        </button>
      </form>
    </AuthLayout>
  );
}
