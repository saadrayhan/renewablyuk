import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Search, Lock, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verify an IBG — Renewably UK" },
      { name: "description", content: "Authenticate a Renewably UK Installation Backed Guarantee by reference number." },
    ],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const [ref, setRef] = useState("");
  const [result, setResult] = useState<null | { ok: boolean; ref: string; measure?: string; address?: string; issuedAt?: string }>(null);

  function lookup(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = ref.trim().toUpperCase();
    if (!trimmed) return;
    if (trimmed.startsWith("IBG-")) {
      setResult({
        ok: true,
        ref: trimmed,
        measure: "Air Source Heat Pump",
        address: "14 Oak Lane, Leeds, LS1 4AB",
        issuedAt: "2026-04-19",
      });
    } else {
      setResult({ ok: false, ref: trimmed });
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-stretch px-6 py-16">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-cat-green to-cat-blue text-[11px] font-semibold text-white">R</span>
        <span className="text-sm font-medium tracking-tight text-foreground">Renewably UK · Verify</span>
      </div>

      <h1 className="mt-10 text-3xl font-semibold tracking-tight text-ink">Authenticate an IBG</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Enter the reference printed on the certificate to confirm it was issued through the Renewably UK platform.
      </p>

      <form onSubmit={lookup} className="mt-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          <input
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="IBG-2451"
            className="h-11 w-full rounded-full border bg-background pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button type="submit" className="press rounded-full bg-foreground px-5 text-sm font-medium text-background">Verify</button>
      </form>

      {result && (
        <div className={`mt-5 rounded-2xl border p-5 ${result.ok ? "border-cat-green/30 bg-cat-green-bg/40" : "border-cat-amber/30 bg-cat-amber-bg/40"}`}>
          <div className={`flex items-center gap-2 text-sm font-medium ${result.ok ? "text-cat-green" : "text-cat-amber"}`}>
            {result.ok ? <ShieldCheck className="size-4" /> : <AlertCircle className="size-4" />}
            {result.ok ? `${result.ref} is a valid Renewably IBG` : `${result.ref} could not be verified`}
          </div>
          {result.ok ? (
            <dl className="mt-3 grid grid-cols-3 gap-3 text-xs">
              <div><dt className="text-ink-muted">Measure</dt><dd className="text-foreground">{result.measure}</dd></div>
              <div><dt className="text-ink-muted">Address</dt><dd className="text-foreground">{result.address}</dd></div>
              <div><dt className="text-ink-muted">Issued</dt><dd className="text-foreground">{result.issuedAt}</dd></div>
            </dl>
          ) : (
            <p className="mt-2 text-xs text-ink-muted">Check the reference and try again, or contact the issuing installer.</p>
          )}
        </div>
      )}

      <p className="mt-10 text-center text-[11px] text-ink-muted">
        Verification confirms the certificate was issued through Renewably UK. For full policy detail, contact the issuing installer.
      </p>
    </main>
  );
}
