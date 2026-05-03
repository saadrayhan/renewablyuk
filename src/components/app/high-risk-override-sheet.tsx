import { useState } from "react";
import { ShieldAlert } from "lucide-react";
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
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "30", label: "30 days" },
  { value: "60", label: "60 days" },
  { value: "indef", label: "Indefinite — requires review" },
];

export function HighRiskOverrideSheet({
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
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("14");
  const [ack, setAck] = useState(false);

  const valid = reason.trim().length >= 20 && ack;
  const day = 86400000;

  function reset() {
    setReason("");
    setDuration("14");
    setAck(false);
  }

  function apply() {
    if (!valid) return;
    const dur = DURATIONS.find((d) => d.value === duration);
    const expiresAt = duration === "indef" ? undefined : Date.now() + parseInt(duration, 10) * day;
    update((d) => {
      d.riskOverrides.unshift({
        id: nid("ro"),
        organisationId,
        riskLevel: "high",
        reason: reason.trim(),
        createdBy: user.fullName,
        createdAt: Date.now(),
        expiresAt,
        active: true,
      });
      pushAudit(d, "user", organisationId, user.fullName, `HIGH risk override applied by ${user.fullName}`, reason.trim());
    });
    toast.success(`Override applied. IBG access restored for ${dur?.label}.`);
    reset();
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <SheetContent side="right" className="w-full sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Apply HIGH Risk Override</SheetTitle>
          <SheetDescription>
            Override will temporarily restore IBG access for {organisationName}. All actions are audited.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 flex items-start gap-2 rounded-xl border border-cat-amber/40 bg-cat-amber-bg/60 px-3 py-2.5 text-xs text-cat-amber">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <div>
            This override bypasses the current risk restriction. Ensure you have reviewed the account history before proceeding.
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ovr-reason">Override reason</Label>
            <Textarea
              id="ovr-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
              placeholder="Explain the business justification for this override..."
            />
            <p className="text-[11px] text-ink-muted">{reason.trim().length} / 20 characters minimum</p>
          </div>

          <div className="space-y-1.5">
            <Label>Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DURATIONS.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <label className="flex items-start gap-2 rounded-xl border bg-surface/40 p-3 text-xs">
            <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-0.5 size-3.5 accent-foreground" />
            <span className="text-foreground">I confirm I have reviewed the account risk history and accept responsibility for this override.</span>
          </label>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={() => onOpenChange(false)} className="press rounded-full border bg-background px-3.5 py-2 text-sm">Cancel</button>
          <button
            disabled={!valid}
            onClick={apply}
            className="press inline-flex items-center gap-1.5 rounded-full bg-cat-amber px-3.5 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            <ShieldAlert className="size-3.5" /> Apply Override
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
