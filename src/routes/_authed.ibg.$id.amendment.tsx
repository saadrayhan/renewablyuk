import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useStore, update, nid } from "@/lib/mock/store";
import { findIbg, pushAudit } from "@/lib/mock/queries";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authed/ibg/$id/amendment")({
  head: () => ({ meta: [{ title: "Request amendment — Renewably UK" }] }),
  component: Amendment,
});

const FIELDS = ["Customer name", "Property address", "Measure", "Policy type", "Other"];

function Amendment() {
  const { id } = Route.useParams();
  const data = useStore();
  const ibg = findIbg(data, id);
  const { user } = useAuth();
  const [field, setField] = useState(FIELDS[0]);
  const [oldValue, setOldValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const [reason, setReason] = useState("");
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  if (!ibg) throw notFound();

  function submit() {
    if (!newValue.trim() || !reason.trim()) {
      toast.error("Provide the corrected value and a reason");
      return;
    }
    const amdId = nid("amd");
    update((d) => {
      d.amendments.unshift({
        id: amdId, ibgId: id, field, oldValue, newValue, reason,
        state: "pending", createdAt: Date.now(),
      });
      pushAudit(d, "amendment", amdId, user.fullName, `Requested amendment to ${field}`, reason);
    });
    toast.success("Amendment request sent for admin review");
    setSubmittedRef(amdId.toUpperCase().replace("AMD_", "AMD-"));
  }

  if (submittedRef) {
    return (
      <div className="mx-auto w-full max-w-xl px-8 py-16 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-cat-green-bg text-cat-green">
          <CheckCircle2 className="size-8" />
        </span>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-ink">Request submitted</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Reference <span className="font-medium text-foreground">{submittedRef}</span> · sent to compliance review.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Link to="/ibg/$id" params={{ id }} className="press rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">Back to {ibg.ref}</Link>
          <Link to="/ibg/repository" className="press rounded-full border bg-background px-4 py-2 text-sm font-medium">Open repository</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
      <Link to="/ibg/$id" params={{ id }} className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Back to {ibg.ref}
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">Request amendment</h1>
      <p className="mt-1 text-sm text-ink-muted">Submit a correction. Admin will review and approve or reject.</p>

      <div className="mt-6 space-y-4 rounded-2xl border bg-card p-6">
        <Field label="Field to amend">
          <select value={field} onChange={(e) => setField(e.target.value)} className={inputCls}>
            {FIELDS.map((f) => <option key={f}>{f}</option>)}
          </select>
        </Field>
        <Field label="Current value">
          <input value={oldValue} onChange={(e) => setOldValue(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Corrected value *">
          <input value={newValue} onChange={(e) => setNewValue(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Reason for change *">
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className={inputCls} placeholder="Explain why this needs to change." />
        </Field>
        <div className="flex justify-end pt-2">
          <button onClick={submit} className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">
            <Send className="size-3.5" /> Submit request
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><div className="mb-1 text-xs font-medium text-ink-muted">{label}</div>{children}</label>;
}
