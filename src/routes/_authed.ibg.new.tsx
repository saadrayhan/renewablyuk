import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, FileBadge } from "lucide-react";
import { toast } from "sonner";
import { useStore, update, nid, nref } from "@/lib/mock/store";
import { pushAudit } from "@/lib/mock/queries";
import { useAuth } from "@/lib/auth-context";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { LockedCard } from "@/components/app/locked-card";

export const Route = createFileRoute("/_authed/ibg/new")({
  head: () => ({ meta: [{ title: "New IBG — Renewably UK" }] }),
  component: NewIbg,
});

const MEASURES = ["Air Source Heat Pump", "Solar PV", "Loft Insulation", "Cavity Wall Insulation", "EV Charger"];
const POLICIES = ["10-year IBG", "25-year IBG"];

function NewIbg() {
  const data = useStore();
  const nav = useNavigate();
  const { user } = useAuth();
  const { role, permissions } = useDevRole();
  const isOperate = role === "installer-operate" || role === "operator" || role === "admin";

  if (!can(permissions, "ibg.issue")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-8 py-10">
        <LockedCard title="Issue an IBG" body="You don't currently have permission to issue IBGs." reason={{ kind: "permission", permission: "ibg.issue" }} />
      </div>
    );
  }

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    customerId: isOperate ? data.customers[0]?.id ?? "" : "",
    customerName: "", propertyAddress: "",
    measure: MEASURES[0], policyType: POLICIES[0],
  });
  const [issuedRef, setIssuedRef] = useState<string | null>(null);
  const [issuedId, setIssuedId] = useState<string | null>(null);

  const props = data.properties.filter((p) => p.customerId === form.customerId);
  const [propertyId, setPropertyId] = useState("");

  function next() {
    if (step === 0) {
      if (isOperate) {
        if (!form.customerId || !propertyId) { toast.error("Pick a customer and property"); return; }
      } else {
        if (!form.customerName || !form.propertyAddress) { toast.error("Customer and address required"); return; }
      }
    }
    setStep((s) => s + 1);
  }

  function issue() {
    const id = nid("ibg");
    const ref = nref("IBG");
    const customer = data.customers.find((c) => c.id === form.customerId);
    const prop = data.properties.find((p) => p.id === propertyId);
    update((d) => {
      d.ibgs.unshift({
        id, ref,
        customerId: form.customerId || undefined,
        propertyId: propertyId || undefined,
        customerName: customer?.name ?? form.customerName,
        propertyAddress: prop ? `${prop.address}, ${prop.postcode}` : form.propertyAddress,
        measure: form.measure, policyType: form.policyType,
        state: "issued",
        issuedAt: Date.now(), createdAt: Date.now(),
        issuedBy: user.fullName,
      });
      pushAudit(d, "ibg", id, user.fullName, `Issued IBG ${ref}`);
    });
    setIssuedRef(ref);
    setIssuedId(id);
    toast.success(`IBG ${ref} issued`);
  }

  function download() {
    const blob = new Blob([`Renewably UK\nIBG Certificate\nReference: ${issuedRef}\nIssued by: ${user.fullName}\nMeasure: ${form.measure}\nPolicy: ${form.policyType}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${issuedRef}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  if (issuedRef) {
    return (
      <div className="mx-auto w-full max-w-xl px-8 py-16 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-cat-green-bg text-cat-green">
          <CheckCircle2 className="size-8" />
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-ink">{issuedRef} issued</h1>
        <p className="mt-2 text-sm text-ink-muted">Certificate and policy generated. Download the PDF below or open the record.</p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <button onClick={download} className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">
            <Download className="size-4" /> Download certificate
          </button>
          <Link to="/ibg/$id" params={{ id: issuedId! }} className="press rounded-full border bg-background px-4 py-2 text-sm font-medium">Open IBG</Link>
        </div>
        <div className="mt-4">
          <button onClick={() => nav({ to: "/ibg/repository" })} className="text-xs text-ink-muted hover:text-foreground">Back to repository</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-8 py-10">
      <Link to="/ibg/repository" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Repository
      </Link>

      <div className="mt-3 flex items-center gap-2">
        <div className="grid size-10 place-items-center rounded-xl bg-cat-green-bg text-cat-green">
          <FileBadge className="size-5" />
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">IBG Generator</div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Issue a new IBG</h1>
        </div>
      </div>

      <Stepper step={step} total={3} labels={["Subject", "Cover", "Review"]} />

      <div className="mt-6 rounded-2xl border bg-card p-6">
        {step === 0 && (
          <div className="space-y-4">
            <div className="text-sm font-medium text-foreground">Subject of the guarantee</div>
            {isOperate ? (
              <>
                <Field label="Customer">
                  <select value={form.customerId} onChange={(e) => { setForm({ ...form, customerId: e.target.value }); setPropertyId(""); }} className={inputCls}>
                    {data.customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.ref})</option>)}
                  </select>
                </Field>
                <Field label="Property">
                  <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className={inputCls}>
                    <option value="">Select…</option>
                    {props.map((p) => <option key={p.id} value={p.id}>{p.address} · {p.postcode}</option>)}
                  </select>
                </Field>
              </>
            ) : (
              <>
                <Field label="Customer name"><input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className={inputCls} /></Field>
                <Field label="Property address"><input value={form.propertyAddress} onChange={(e) => setForm({ ...form, propertyAddress: e.target.value })} className={inputCls} placeholder="14 Oak Lane, Leeds, LS1 4AB" /></Field>
              </>
            )}
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-sm font-medium text-foreground">Cover</div>
            <Field label="Measure">
              <select value={form.measure} onChange={(e) => setForm({ ...form, measure: e.target.value })} className={inputCls}>
                {MEASURES.map((m) => <option key={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Policy type">
              <select value={form.policyType} onChange={(e) => setForm({ ...form, policyType: e.target.value })} className={inputCls}>
                {POLICIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-foreground">Review</div>
            <Row label="Customer" value={isOperate ? data.customers.find((c) => c.id === form.customerId)?.name : form.customerName} />
            <Row label="Property" value={isOperate ? data.properties.find((p) => p.id === propertyId)?.address : form.propertyAddress} />
            <Row label="Measure" value={form.measure} />
            <Row label="Policy" value={form.policyType} />
            <Row label="Issued by" value={user.fullName} />
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-sm font-medium disabled:opacity-40">
            <ArrowLeft className="size-3.5" /> Back
          </button>
          {step < 2 ? (
            <button onClick={next} className="press inline-flex items-center gap-1 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">
              Next <ArrowRight className="size-3.5" />
            </button>
          ) : (
            <button onClick={issue} className="press rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background">Issue IBG</button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({ step, total, labels }: { step: number; total: number; labels: string[] }) {
  return (
    <div className="mt-6 flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex flex-1 items-center gap-2">
          <div className={`grid size-6 place-items-center rounded-full text-[11px] font-semibold ${i <= step ? "bg-foreground text-background" : "bg-tile text-ink-muted"}`}>{i + 1}</div>
          <div className={`text-xs font-medium ${i === step ? "text-foreground" : "text-ink-muted"}`}>{labels[i]}</div>
          {i < total - 1 && <div className={`h-px flex-1 ${i < step ? "bg-foreground" : "bg-border"}`} />}
        </div>
      ))}
    </div>
  );
}

const inputCls = "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><div className="mb-1 text-xs font-medium text-ink-muted">{label}</div>{children}</label>;
}
function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b py-2 last:border-b-0">
      <div className="text-xs uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="text-sm font-medium text-foreground">{value || "—"}</div>
    </div>
  );
}
