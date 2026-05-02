/**
 * Two-Factor Authentication setup dialog.
 * 3-step wizard: scan QR → verify code → backup codes.
 * Persists `renewably:2fa` flag in localStorage.
 */

import { useState } from "react";
import { ShieldCheck, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BACKUP_CODES = [
  "K9Q4-7M2X", "P8L3-N5RW", "C1Y6-V2HB", "T4D8-F3JZ",
  "M7E2-W6QK", "B5R9-Y1PX", "G3N7-H4LD", "S2V8-A6CT",
];

export function TwoFactorDialog({
  open,
  onOpenChange,
  onEnabled,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onEnabled: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  function reset() {
    setStep(1);
    setCode("");
    setCopied(false);
  }

  function verify() {
    if (code.length !== 6) {
      toast.error("Enter the 6-digit code from your app");
      return;
    }
    setStep(3);
  }

  function finish() {
    try {
      localStorage.setItem("renewably:2fa", "true");
    } catch { /* noop */ }
    toast.success("Two-factor authentication enabled");
    onEnabled();
    reset();
    onOpenChange(false);
  }

  function copyAll() {
    navigator.clipboard.writeText(BACKUP_CODES.join("\n")).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-cat-green" />
            Set up two-factor authentication
          </DialogTitle>
          <DialogDescription>
            Step {step} of 3 · Adds an extra layer of security to your account.
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-ink-muted">
              Scan this code with Google Authenticator, 1Password, Authy or any TOTP app.
            </p>
            <div className="mx-auto grid size-44 place-items-center rounded-2xl border bg-background">
              {/* mock QR pattern */}
              <div className="grid size-32 grid-cols-8 grid-rows-8 gap-0.5">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className={(i * 37 + 11) % 3 === 0 ? "bg-foreground" : "bg-tile"} />
                ))}
              </div>
            </div>
            <div className="rounded-xl border bg-surface/60 p-3 text-center font-mono text-xs tracking-widest text-ink-muted">
              JBSW Y3DP EHPK 3PXP
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-ink-muted">
              Enter the 6-digit code shown in your authenticator app.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="totp-code">Verification code</Label>
              <Input
                id="totp-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                placeholder="123456"
                className="text-center font-mono text-lg tracking-[0.5em]"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-ink-muted">
              Save these one-time backup codes somewhere safe. Each can be used once if you lose access to your authenticator app.
            </p>
            <div className="rounded-xl border bg-surface/60 p-4">
              <div className="grid grid-cols-2 gap-y-1 gap-x-4 font-mono text-sm">
                {BACKUP_CODES.map((c) => <div key={c}>{c}</div>)}
              </div>
            </div>
            <button
              type="button"
              onClick={copyAll}
              className="press inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs"
            >
              {copied ? <Check className="size-3.5 text-cat-green" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy all codes"}
            </button>
          </div>
        )}

        <DialogFooter>
          {step > 1 && step < 3 && (
            <button
              onClick={() => setStep((s) => (s - 1) as 1 | 2)}
              className="press rounded-full border bg-background px-3.5 py-2 text-sm"
            >
              Back
            </button>
          )}
          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              className="press rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background"
            >
              I've scanned it
            </button>
          )}
          {step === 2 && (
            <button
              onClick={verify}
              className="press rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background"
            >
              Verify
            </button>
          )}
          {step === 3 && (
            <button
              onClick={finish}
              className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background"
            >
              <ShieldCheck className="size-3.5" /> Done
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
