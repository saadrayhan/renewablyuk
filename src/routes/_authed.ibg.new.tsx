import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, FileBadge, Check, AlertCircle, ShieldAlert } from "lucide-react";
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

const POLICIES = ["10-year IBG", "25-year IBG"];

function NewIbg() {
  const data = useStore();
  const nav = useNavigate();
  const { user } = useAuth();
  const { role, permissions } = useDevRole();
  const isOperate = role === "installer-operate" || role === "operator" || role === "admin";

  if (!can(permissions, "ibg.issue")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <LockedCard title="Issue an IBG" body="You don't currently have permission to issue IBGs." reason={{ kind: "permission", permission: "ibg.issue" }} />
      </div>
    );
  }

  // Acting org — use the dev-switched user as proxy organisation
  const actingUser = data.users.find((u) => u.role === role && u.accountRiskState) ?? data.users.find((u) => u.role === role) ?? data.users[0];
  const accountState = actingUser?.accountRiskState ?? "active";
  const activeOverride = data.riskOverrides.find((o) => o.organisationId === actingUser?.id && o.active && (!o.expiresAt || o.expiresAt > Date.now()));
  const accountAllowsIssue = accountState === "active" || !!activeOverride;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    customerId: isOperate ? data.customers[0]?.id ?? "" : "",
    customerName: "",
    propertyAddress: "",
    jobId: "",
    installationTypeId: "",
    systemTypeId: "",
    policyType: POLICIES[0],
  });
  const [propertyId, setPropertyId] = useState("");
  const [issuedRef, setIssuedRef] = useState<string | null>(null);
  const [issuedId, setIssuedId] = useState<string | null>(null);

  const props = data.properties.filter((p) => p.customerId === form.customerId);
  const customerJobs = data.jobs.filter((j) => j.customerId === form.customerId);
  const linkedJob = data.jobs.find((j) => j.id === form.jobId);
  const fundingForJob = data.fundingProjects.find((p) => p.jobId === form.jobId);
  const evidenceCount = fundingForJob?.evidence.length ?? 0;

  const installationTypes = data.installationTypes.filter((t) => t.status === "active");
  const systemTypes = useMemo(
    () => data.systemTypes.filter((s) => s.status === "active" && s.installationTypeId === form.installationTypeId),
    [data.systemTypes, form.installationTypeId],
  );

  const readinessChecks = [
    { key: "account", label: "Account in good standing", ok: accountAllowsIssue, hint: accountAllowsIssue ? (activeOverride ? "Active HIGH override applied" : "Account active") : `Account is ${accountState} — issuance blocked` },
    { key: "subject", label: isOperate ? "Customer & property selected" : "Customer & address provided", ok: isOperate ? !!(form.customerId && propertyId) : !!(form.customerName && form.propertyAddress), hint: "Select the subject of the guarantee" },
    { key: "job", label: "Linked to a job", ok: isOperate ? !!form.jobId : true, hint: isOperate ? (form.jobId ? `Linked to ${linkedJob?.ref}` : "Pick the job this IBG covers") : "Standalone (Access tier)" },
    { key: "evidence", label: "Supporting evidence on file", ok: isOperate ? evidenceCount > 0 : true, hint: isOperate ? (evidenceCount > 0 ? `${evidenceCount} file${evidenceCount === 1 ? "" : "s"}` : "No evidence linked yet — review before issue") : "Not required" },
    { key: "system", label: "Installation & system type set", ok: !!form.installationTypeId && !!form.systemTypeId, hint: "Required for cover" },
  ];
  const readinessOk = readinessChecks.every((c) => c.ok);

  function next() {
    setStep((s) => Math.min(3, s + 1));
  }

  function issue() {
    const id = nid("ibg");
    const ref = nref("IBG");
    const customer = data.customers.find((c) => c.id === form.customerId);
    const prop = data.properties.find((p) => p.id === propertyId);
    const installation = data.installationTypes.find((t) => t.id === form.installationTypeId);
    const system = data.systemTypes.find((s) => s.id === form.systemTypeId);
    const measure = `${installation?.name ?? "—"} · ${system?.name ?? "—"}`;
    update((d) => {
      d.ibgs.unshift({
        id, ref,
        customerId: form.customerId || undefined,
        propertyId: propertyId || undefined,
        jobId: form.jobId || undefined,
        customerName: customer?.name ?? form.customerName,
        propertyAddress: prop ? `${prop.address}, ${prop.postcode}` : form.propertyAddress,
        measure,
        policyType: form.policyType,
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
    const blob = new Blob([`Renewably UK\nIBG Certificate\nReference: ${issuedRef}\nIssued by: ${user.fullName}\nPolicy: ${form.policyType}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${issuedRef}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  if (issuedRef) {
    return (
      <div className="mx-auto w-full max-w-xl px-8 py-16 text-center">
        <div className="relative mx-auto grid size-16 place-items-center">
          <span className="ibg-burst ibg-burst-1" />
          <span className="ibg-burst ibg-burst-2" />
          <span className="ibg-burst ibg-burst-3" />
          <span className="ibg-burst ibg-burst-4" />
          <span className="ibg-pop grid size-16 place-items-center rounded-2xl bg-cat-green-bg text-cat-green">
            <CheckCircle2 className="size-8" />
          </span>
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
          <button onClick={() => nav({ to: isOperate ? "/ibg/repository" : "/ibg/history" })} className="text-xs text-ink-muted hover:text-foreground">
            {isOperate ? "Back to repository" : "Back to IBG History"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
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

      {activeOverride && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-cat-amber/40 bg-cat-amber-bg/50 px-4 py-3 text-xs text-cat-amber">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <div>
            <div className="font-medium">HIGH risk override active</div>
            <div className="opacity-90">{activeOverride.reason} — applied by {activeOverride.createdBy}</div>
          </div>
        </div>
      )}

      <Stepper step={step} total={4} labels={["Readiness", "Subject", "Cover", "Review"]} />

      <div className="mt-6 rounded-2xl border bg-card p-6">
        {step === 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-foreground">Readiness preview</div>
            <p className="text-xs text-ink-muted">Informational only — fill in the form on the next steps. The final Issue button is gated on these checks.</p>
            <ul className="mt-2 space-y-2">
              {readinessChecks.map((c) => {
                const Icon = c.ok ? Check : c.key === "account" && !accountAllowsIssue ? ShieldAlert : AlertCircle;
                const tone = c.ok ? "text-cat-green bg-cat-green-bg" : c.key === "account" && !accountAllowsIssue ? "text-cat-rose bg-cat-rose-bg" : "text-cat-amber bg-cat-amber-bg";
                return (
                  <li key={c.key} className="flex items-center justify-between rounded-xl bg-surface/40 px-3 py-2">
                    <div className="flex items-center gap-3">
                      <span className={`grid size-6 place-items-center rounded-full ${tone}`}>
                        <Icon className="size-3.5" />
                      </span>
                      <div>
                        <div className="text-sm font-medium text-foreground">{c.label}</div>
                        <div className="text-xs text-ink-muted">{c.hint}</div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="text-sm font-medium text-foreground">Subject of the guarantee</div>
            {isOperate ? (
              <>
                <Field label="Customer">
                  <select value={form.customerId} onChange={(e) => { setForm({ ...form, customerId: e.target.value, jobId: "" }); setPropertyId(""); }} className={inputCls}>
                    {data.customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.ref})</option>)}
                  </select>
                </Field>
                <Field label="Property">
                  <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className={inputCls}>
                    <option value="">Select…</option>
                    {props.map((p) => <option key={p.id} value={p.id}>{p.address} · {p.postcode}</option>)}
                  </select>
                </Field>
                <Field label="Linked job">
                  <select value={form.jobId} onChange={(e) => setForm({ ...form, jobId: e.target.value })} className={inputCls}>
                    <option value="">Select…</option>
                    {customerJobs.map((j) => <option key={j.id} value={j.id}>{j.ref} · {j.measure}</option>)}
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

        {step === 2 && (
          <div className="space-y-4">
            <div className="text-sm font-medium text-foreground">Cover</div>
            <Field label="Installation type">
              <select value={form.installationTypeId} onChange={(e) => setForm({ ...form, installationTypeId: e.target.value, systemTypeId: "" })} className={inputCls}>
                <option value="">Select…</option>
                {installationTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="System type">
              <select value={form.systemTypeId} onChange={(e) => setForm({ ...form, systemTypeId: e.target.value })} disabled={!form.installationTypeId} className={inputCls + " disabled:opacity-50"}>
                <option value="">{form.installationTypeId ? "Select…" : "Pick installation type first"}</option>
                {systemTypes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Policy duration">
              <select value={form.policyType} onChange={(e) => setForm({ ...form, policyType: e.target.value })} className={inputCls}>
                {POLICIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-foreground">Review</div>
            <Row label="Customer" value={isOperate ? data.customers.find((c) => c.id === form.customerId)?.name : form.customerName} />
            <Row label="Property" value={isOperate ? data.properties.find((p) => p.id === propertyId)?.address : form.propertyAddress} />
            <Row label="Linked job" value={linkedJob ? `${linkedJob.ref} · ${linkedJob.measure}` : "—"} />
            <Row label="Installation type" value={data.installationTypes.find((t) => t.id === form.installationTypeId)?.name} />
            <Row label="System type" value={data.systemTypes.find((s) => s.id === form.systemTypeId)?.name} />
            <Row label="Policy" value={form.policyType} />
            <Row label="Issued by" value={user.fullName} />
            {!readinessOk && (
              <div className="mt-2 flex items-start gap-2 rounded-xl border border-cat-rose/40 bg-cat-rose-bg/50 px-3 py-2 text-xs text-cat-rose">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                <div>
                  <div className="font-medium">Readiness checks must pass before issuing</div>
                  <ul className="mt-1 list-disc pl-4">
                    {readinessChecks.filter((c) => !c.ok).map((c) => (<li key={c.key}>{c.label}: {c.hint}</li>))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-sm font-medium disabled:opacity-40">
            <ArrowLeft className="size-3.5" /> Back
          </button>
          {step < 3 ? (
            <button onClick={next} className="press inline-flex items-center gap-1 rounded-full bg-[var(--brand-blue)] px-4 py-2 text-sm font-medium text-[var(--brand-blue-foreground)]">
              Continue <ArrowRight className="size-3.5" />
            </button>
          ) : (
            <button onClick={issue} disabled={!readinessOk} className="press rounded-full bg-[var(--brand-blue)] px-5 py-2 text-sm font-medium text-[var(--brand-blue-foreground)] disabled:opacity-50">Issue IBG</button>
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
