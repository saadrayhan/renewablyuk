import { useState } from "react";
import { ShieldAlert, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { update, nid } from "@/lib/mock/store";
import { pushAudit } from "@/lib/mock/queries";
import { useAuth } from "@/lib/auth-context";

const DURATIONS = [
  { value: "3", label: "3 days" },
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
];

const REASONS = [
  "Active legal proceedings — funder requires continued issuance",
  "Strategic customer commitment under existing SLA",
  "Regulatory remediation in flight — paused issuance would harm consumer",
  "Other (detail in justification)",
];

export function CriticalRiskOverrideSheet({
  open,
  onOpenChange,
  organisationId,
  organisationName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  organisationId: string;
  organisationName: string;
}) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [reasonCategory, setReasonCategory] = useState(REASONS[0]);
  const [justification, setJustification] = useState("");
  const [duration, setDuration] = useState("7");
  const [secondApprover, setSecondApprover] = useState("");
  const [ack1, setAck1] = useState(false);
  const [ack2, setAck2] = useState(false);

  const day = 86400000;

  function reset() {
    setStep(0);
    setReasonCategory(REASONS[0]);
    setJustification("");
    setDuration("7");
    setSecondApprover("");
    setAck1(false);
    setAck2(false);
  }

  const step1Valid = justification.trim().length >= 40;
  const step2Valid = secondApprover.trim().length >= 4 && ack1 && ack2;

  function apply() {
    if (!step2Valid) return;
    const dur = DURATIONS.find((d) => d.value === duration);
    const expiresAt = Date.now() + parseInt(duration, 10) * day;
    update((d) => {
      d.riskOverrides.unshift({
        id: nid("ro"),
        organisationId,
        riskLevel: "critical",
        reason: reasonCategory,
        justification: justification.trim(),
        createdBy: `${user.fullName} + ${secondApprover.trim()}`,
        createdAt: Date.now(),
        expiresAt,
        active: true,
      });
      pushAudit(
        d,
        "user",
        organisationId,
        user.fullName,
        `CRITICAL risk override applied (co-signed by ${secondApprover.trim()})`,
        `${reasonCategory} — ${justification.trim()}`,
      );
    });
    toast.success(`CRITICAL override applied for ${dur?.label}. Co-signed by ${secondApprover.trim()}.`);
    reset();
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <SheetContent side="right" className="w-full sm:max-w-[520px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Apply CRITICAL Risk Override</SheetTitle>
          <SheetDescription>
            Restoring issuance for a suspended account requires dual approval. This action is permanently audited.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 flex items-start gap-2 rounded-xl border border-cat-rose/40 bg-cat-rose-bg/60 px-3 py-2.5 text-xs text-cat-rose">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <div>
            {organisationName} is currently <span className="font-semibold">suspended</span>. Override will restore IBG issuance temporarily and will be reviewed weekly.
          </div>
        </div>

        {/* Step indicator */}
        <div className="mt-5 flex items-center gap-2 text-[11px] text-ink-muted">
          <span className={`grid size-5 place-items-center rounded-full ${step >= 0 ? "bg-foreground text-background" : "bg-tile"}`}>1</span>
          <span className="text-foreground">Justification</span>
          <span className="h-px flex-1 bg-border" />
          <span className={`grid size-5 place-items-center rounded-full ${step >= 1 ? "bg-foreground text-background" : "bg-tile"}`}>2</span>
          <span className={step >= 1 ? "text-foreground" : ""}>Co-sign & confirm</span>
        </div>

        {step === 0 && (
          <div className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label>Reason category</Label>
              <Select value={reasonCategory} onValueChange={setReasonCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="crit-just">Detailed justification</Label>
              <Textarea
                id="crit-just"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={6}
                placeholder="Explain why suspension protections must be lifted. Include references to incident IDs, SLAs, or correspondence."
              />
              <p className="text-[11px] text-ink-muted">{justification.trim().length} / 40 characters minimum</p>
            </div>
            <div className="space-y-1.5">
              <Label>Override window</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-ink-muted">CRITICAL overrides cannot be indefinite.</p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border bg-surface/40 p-3 text-xs">
              <div className="font-medium text-foreground">Summary</div>
              <div className="mt-1 text-ink-muted"><span className="text-foreground">Account:</span> {organisationName}</div>
              <div className="text-ink-muted"><span className="text-foreground">Reason:</span> {reasonCategory}</div>
              <div className="text-ink-muted"><span className="text-foreground">Window:</span> {DURATIONS.find((d) => d.value === duration)?.label}</div>
              <div className="mt-2 line-clamp-3 text-ink-muted">{justification}</div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="crit-cosign">Second approver name</Label>
              <Input id="crit-cosign" value={secondApprover} onChange={(e) => setSecondApprover(e.target.value)} placeholder="e.g. Compliance Director" />
              <p className="text-[11px] text-ink-muted">Name of the second admin co-signing this override.</p>
            </div>

            <label className="flex items-start gap-2 rounded-xl border bg-surface/40 p-3 text-xs">
              <input type="checkbox" checked={ack1} onChange={(e) => setAck1(e.target.checked)} className="mt-0.5 size-3.5 accent-foreground" />
              <span className="text-foreground">I confirm the second approver named above has reviewed this override and agreed to co-sign.</span>
            </label>
            <label className="flex items-start gap-2 rounded-xl border bg-surface/40 p-3 text-xs">
              <input type="checkbox" checked={ack2} onChange={(e) => setAck2(e.target.checked)} className="mt-0.5 size-3.5 accent-foreground" />
              <span className="text-foreground">I accept that this CRITICAL override bypasses suspension protections and will appear in the next compliance review.</span>
            </label>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-2">
          {step === 0 ? (
            <button onClick={() => onOpenChange(false)} className="press rounded-full border bg-background px-3.5 py-2 text-sm">Cancel</button>
          ) : (
            <button onClick={() => setStep(0)} className="press inline-flex items-center gap-1 rounded-full border bg-background px-3.5 py-2 text-sm">
              <ChevronLeft className="size-3.5" /> Back
            </button>
          )}
          {step === 0 ? (
            <button
              disabled={!step1Valid}
              onClick={() => setStep(1)}
              className="press inline-flex items-center gap-1 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background disabled:opacity-50"
            >
              Continue <ChevronRight className="size-3.5" />
            </button>
          ) : (
            <button
              disabled={!step2Valid}
              onClick={apply}
              className="press inline-flex items-center gap-1.5 rounded-full bg-cat-rose px-3.5 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              <ShieldAlert className="size-3.5" /> Apply CRITICAL Override
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
