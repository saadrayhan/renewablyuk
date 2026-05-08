/**
 * Certificate issuance wizard — 4 steps in the editorial card pattern.
 *   1. Pick template (grid)
 *   2. Fill fields (form card)
 *   3. Upload evidence (checklist)
 *   4. Preview & issue (summary + CTA)
 *
 * Mocks: writes a new Certificate to the store on issue, then routes to
 * /certificates. Sticky footer with Back / Continue / Issue.
 */

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, Award, Check, Upload, FileCheck2,
  AlertCircle, Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore, update, nid, nref } from "@/lib/mock/store";
import type { Certificate, CertificateTemplate } from "@/lib/mock/types";
import { useActivationGate } from "@/lib/membership";

export const Route = createFileRoute("/_authed/certificates/new")({
  head: () => ({ meta: [{ title: "New certificate — Renewably UK" }] }),
  component: NewCertificatePage,
});

type Step = 1 | 2 | 3 | 4;

function NewCertificatePage() {
  const navigate = useNavigate();
  const { certificateTemplates } = useStore();
  const { isBlocked } = useActivationGate();

  const [step, setStep] = useState<Step>(1);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [evidenceUploaded, setEvidenceUploaded] = useState<Record<string, boolean>>({});

  const template: CertificateTemplate | undefined = useMemo(
    () => certificateTemplates.find((t) => t.id === templateId),
    [certificateTemplates, templateId],
  );

  const canStep2 = !!template;
  const canStep3 =
    canStep2 &&
    customerName.trim().length > 1 &&
    propertyAddress.trim().length > 4 &&
    template!.fields.every((f) => (fields[f.id] ?? "").trim().length > 0);
  const canStep4 =
    canStep3 && template!.evidenceRequired.every((e) => evidenceUploaded[e.id]);

  function next() {
    if (step === 1 && canStep2) setStep(2);
    else if (step === 2 && canStep3) setStep(3);
    else if (step === 3 && canStep4) setStep(4);
  }
  function back() {
    if (step > 1) setStep((s) => (s - 1) as Step);
  }

  function issue() {
    if (!template) return;
    const now = Date.now();
    const cert: Certificate = {
      id: nid("cert"),
      ref: nref("RC"),
      templateId: template.id,
      templateName: template.name,
      contractorId: "contractor.operate@demo",
      contractorName: "Evergreen Installs",
      customerName,
      propertyAddress,
      measure: template.category,
      state: "pending_review",
      createdAt: now,
      issuedAt: undefined,
      expiresAt: now + 365 * 24 * 60 * 60 * 1000 * 10,
      fields,
    };
    update((d) => {
      d.certificates = [cert, ...d.certificates];
    });
    navigate({ to: "/certificates" });
  }

  if (isBlocked) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-6 py-10 md:px-10 md:py-16">
        <PageHeader eyebrow="COMPLIANCE" title="New certificate" />
        <div className="rounded-2xl border border-cat-amber-bg bg-cat-amber-bg/40 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 shrink-0 text-cat-amber" />
            <div>
              <div className="font-medium">Activation required</div>
              <p className="mt-0.5 text-sm text-ink-muted">
                Finish activating your account to issue certificates.
              </p>
              <Link
                to="/dashboard"
                className="mt-3 inline-flex items-center gap-1 rounded-full bg-foreground px-3.5 py-1.5 text-[12px] font-medium text-background"
              >
                Back to dashboard <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pb-32 pt-10 md:px-10 md:pt-12">
      <div className="flex items-center justify-between">
        <PageHeader eyebrow="COMPLIANCE" title="New certificate" />
        <Link to="/certificates" className="text-[12px] text-ink-muted hover:text-foreground">Cancel</Link>
      </div>

      <Stepper step={step} />

      {step === 1 && (
        <Section title="Pick a template" hint="Choose the guarantee that matches the installation.">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {certificateTemplates.filter((t) => t.active).map((t) => {
              const selected = templateId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplateId(t.id)}
                  className={`group rounded-2xl border p-4 text-left transition ${
                    selected ? "border-foreground ring-2 ring-foreground/10" : "border-border hover:border-foreground/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="grid size-9 place-items-center rounded-xl text-white"
                      style={{ backgroundColor: t.brandColor }}
                    >
                      <Award className="size-4" />
                    </div>
                    <span className="rounded-full bg-tile px-2 py-0.5 text-[11px] text-ink-muted">{t.category}</span>
                    {selected && <Check className="ml-auto size-4 text-cat-green" />}
                  </div>
                  <div className="mt-3 text-[14px] font-medium">{t.name}</div>
                  <p className="mt-1 line-clamp-2 text-[12px] text-ink-muted">{t.description}</p>
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {step === 2 && template && (
        <Section title="Installation details" hint="These fields appear on the issued certificate.">
          <FieldRow label="Customer name">
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Jane Smith"
              className="input"
            />
          </FieldRow>
          <FieldRow label="Property address">
            <input
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
              placeholder="12 Acacia Avenue, Manchester, M1 1AA"
              className="input"
            />
          </FieldRow>
          {template.fields.map((f) => (
            <FieldRow key={f.id} label={f.label}>
              <input
                type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                value={fields[f.id] ?? ""}
                onChange={(e) => setFields((s) => ({ ...s, [f.id]: e.target.value }))}
                className="input"
              />
            </FieldRow>
          ))}
        </Section>
      )}

      {step === 3 && template && (
        <Section title="Upload evidence" hint="All required items must be attached before submission.">
          <ul className="divide-y rounded-xl border bg-background">
            {template.evidenceRequired.map((e) => {
              const ok = !!evidenceUploaded[e.id];
              return (
                <li key={e.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={`grid size-9 place-items-center rounded-xl ${ok ? "bg-cat-green-bg text-cat-green" : "bg-tile text-ink-muted"}`}>
                    {ok ? <FileCheck2 className="size-4" /> : <Upload className="size-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium">{e.label}</div>
                    <div className="text-[12px] text-ink-muted">{e.description}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEvidenceUploaded((s) => ({ ...s, [e.id]: !s[e.id] }))}
                    className={`press rounded-full px-3 py-1.5 text-[12px] font-medium ${
                      ok ? "border bg-background text-foreground" : "bg-foreground text-background"
                    }`}
                  >
                    {ok ? "Replace" : "Upload"}
                  </button>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      {step === 4 && template && (
        <Section title="Review & submit" hint="Submitting sends this for evidence review.">
          <div className="rounded-2xl border bg-background p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl text-white" style={{ backgroundColor: template.brandColor }}>
                <Award className="size-5" />
              </div>
              <div>
                <div className="text-[15px] font-medium">{template.name}</div>
                <div className="text-[12px] text-ink-muted">{template.category}</div>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-1 gap-3 text-[13px] md:grid-cols-2">
              <Summary label="Customer" value={customerName} />
              <Summary label="Address" value={propertyAddress} />
              {template.fields.map((f) => (
                <Summary key={f.id} label={f.label} value={fields[f.id] ?? "—"} />
              ))}
            </dl>
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-cat-blue-bg/40 px-3 py-2 text-[12px] text-foreground">
              <Sparkles className="size-3.5 text-cat-blue" />
              You can revoke or amend after issuance.
            </div>
          </div>
        </Section>
      )}

      {/* Sticky footer */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-6 py-3 md:px-10">
          <button
            type="button"
            onClick={back}
            disabled={step === 1}
            className="press inline-flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-[12px] font-medium disabled:opacity-40"
          >
            <ArrowLeft className="size-3.5" /> Back
          </button>
          <div className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">Step {step} of 4</div>
          {step < 4 ? (
            <button
              type="button"
              onClick={next}
              disabled={(step === 1 && !canStep2) || (step === 2 && !canStep3) || (step === 3 && !canStep4)}
              className="press inline-flex items-center gap-1 rounded-full bg-foreground px-4 py-1.5 text-[12px] font-medium text-background disabled:opacity-40"
            >
              Continue <ArrowRight className="size-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={issue}
              className="press inline-flex items-center gap-1 rounded-full bg-cat-green px-4 py-1.5 text-[12px] font-medium text-white"
            >
              Submit certificate <Check className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const labels = ["Template", "Details", "Evidence", "Review"];
  return (
    <ol className="mt-6 flex items-center gap-2">
      {labels.map((l, i) => {
        const idx = (i + 1) as Step;
        const active = idx === step;
        const done = idx < step;
        return (
          <li key={l} className="flex flex-1 items-center gap-2">
            <span
              className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${
                done ? "bg-cat-green text-white" : active ? "bg-foreground text-background" : "bg-tile text-ink-muted"
              }`}
            >
              {done ? <Check className="size-3" /> : idx}
            </span>
            <span className={`text-[12px] ${active ? "font-medium text-foreground" : "text-ink-muted"}`}>{l}</span>
            {i < labels.length - 1 && <span className="ml-1 h-px flex-1 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 space-y-4">
      <div>
        <h2 className="text-[15px] font-medium">{title}</h2>
        {hint && <p className="text-[12px] text-ink-muted">{hint}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block rounded-xl border bg-background p-3">
      <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-ink-muted">{label}</div>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.1em] text-ink-muted">{label}</dt>
      <dd className="mt-0.5 text-[13px] font-medium">{value || "—"}</dd>
    </div>
  );
}
