/**
 * Amendment review sheet — admin-side approve/reject with required reason.
 */

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { update } from "@/lib/mock/store";
import { pushAudit } from "@/lib/mock/queries";
import { useAuth } from "@/lib/auth-context";
import type { Amendment, IBG } from "@/lib/mock/types";

export function AmendmentReviewSheet({
  open,
  onOpenChange,
  amendment,
  ibg,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  amendment: Amendment | null;
  ibg: IBG | null;
}) {
  const { user } = useAuth();
  const [mode, setMode] = useState<"view" | "rejecting">("view");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setMode("view");
      setReason("");
    }
  }, [open]);

  if (!amendment) return null;

  function decide(decision: "approved" | "rejected", rejectReason?: string) {
    update((d) => {
      const a = d.amendments.find((x) => x.id === amendment!.id);
      if (!a) return;
      a.state = decision;
      a.decidedAt = Date.now();
      a.decidedBy = user.fullName;
      if (rejectReason) a.rejectReason = rejectReason;
      pushAudit(d, "amendment", a.id, user.fullName, decision === "approved" ? "Approved amendment" : "Rejected amendment", rejectReason);
      if (decision === "approved") {
        const i = d.ibgs.find((x) => x.id === a.ibgId);
        if (i) i.state = "amended";
      }
    });
    toast.success(`Amendment ${decision}`);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Review amendment</SheetTitle>
          <SheetDescription>
            {ibg?.ref ?? amendment.ibgId} · field <span className="font-mono">{amendment.field}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 px-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-cat-rose-bg/40 p-3">
              <div className="text-[11px] uppercase text-ink-muted">Current</div>
              <div className="mt-1 text-sm text-foreground">{amendment.oldValue || "—"}</div>
            </div>
            <div className="rounded-xl bg-cat-green-bg/40 p-3">
              <div className="text-[11px] uppercase text-ink-muted">Requested</div>
              <div className="mt-1 text-sm text-foreground">{amendment.newValue}</div>
            </div>
          </div>

          <div className="rounded-xl border bg-surface/40 p-3 text-sm">
            <div className="text-[11px] uppercase text-ink-muted">Installer's reason</div>
            <p className="mt-1 text-foreground">{amendment.reason}</p>
          </div>

          {mode === "rejecting" && (
            <div className="space-y-1.5">
              <Label htmlFor="reject-reason">Reason for rejection (required)</Label>
              <Textarea
                id="reject-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why so the installer can correct it"
                rows={3}
              />
            </div>
          )}
        </div>

        <SheetFooter className="mt-6">
          {mode === "view" && amendment.state === "pending" && (
            <>
              <button
                onClick={() => setMode("rejecting")}
                className="press inline-flex items-center gap-1 rounded-full border bg-background px-3.5 py-2 text-sm"
              >
                <XCircle className="size-3.5" /> Reject
              </button>
              <button
                onClick={() => decide("approved")}
                className="press inline-flex items-center gap-1 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background"
              >
                <CheckCircle2 className="size-3.5" /> Approve
              </button>
            </>
          )}
          {mode === "rejecting" && (
            <>
              <button
                onClick={() => setMode("view")}
                className="press rounded-full border bg-background px-3.5 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!reason.trim()) {
                    toast.error("A reason is required to reject");
                    return;
                  }
                  decide("rejected", reason.trim());
                }}
                className="press inline-flex items-center gap-1 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background"
              >
                <XCircle className="size-3.5" /> Confirm reject
              </button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
