import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Settings, Palette, Database, Mail, Shield, Server, AlertTriangle,
  Copy, RotateCw,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { LockedCard } from "@/components/app/locked-card";
import { UnderlineTabs } from "@/components/app/underline-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";

export const Route = createFileRoute("/_authed/admin/system-settings")({
  head: () => ({ meta: [{ title: "System Settings — Renewably UK" }] }),
  component: SystemSettingsPage,
});

type Tab = "general" | "branding" | "retention" | "email" | "security" | "environment" | "danger";

const TABS = [
  { value: "general" as const, label: "General", icon: Settings },
  { value: "branding" as const, label: "Branding", icon: Palette },
  { value: "retention" as const, label: "Retention", icon: Database },
  { value: "email" as const, label: "Email", icon: Mail },
  { value: "security" as const, label: "Security", icon: Shield },
  { value: "environment" as const, label: "Environment", icon: Server },
  { value: "danger" as const, label: "Danger zone", icon: AlertTriangle },
];

function SystemSettingsPage() {
  const { permissions } = useDevRole();
  const [tab, setTab] = useState<Tab>("general");

  if (!can(permissions, "config.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <LockedCard title="System Settings" reason={{ kind: "permission", permission: "config.read" }} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[960px] space-y-6 px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Admin · System"
        title="System Settings"
        subtitle="Platform-wide defaults, retention, security, and environment controls."
      />
      <UnderlineTabs<Tab> value={tab} onChange={setTab} options={TABS} />
      <div className="space-y-4">
        {tab === "general" && <GeneralTab />}
        {tab === "branding" && <BrandingTab />}
        {tab === "retention" && <RetentionTab />}
        {tab === "email" && <EmailTab />}
        {tab === "security" && <SecurityTab />}
        {tab === "environment" && <EnvironmentTab />}
        {tab === "danger" && <DangerTab />}
      </div>
    </div>
  );
}

/* ────────── shared shells ────────── */

function Card({ title, desc, children, footer }: {
  title: string; desc?: string; children: React.ReactNode; footer?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-card">
      <header className="border-b px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {desc && <p className="mt-0.5 text-[12px] text-ink-muted">{desc}</p>}
      </header>
      <div className="space-y-4 px-5 py-5">{children}</div>
      {footer && <div className="flex items-center justify-end gap-2 border-t bg-surface/50 px-5 py-3">{footer}</div>}
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-[12px] font-medium text-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-ink-muted">{hint}</p>}
    </div>
  );
}

function SaveFooter({ onSave, onDiscard }: { onSave: () => void; onDiscard: () => void }) {
  return (
    <>
      <Button variant="ghost" size="sm" onClick={onDiscard}>Discard</Button>
      <Button variant="primary" size="sm" onClick={onSave}>Save changes</Button>
    </>
  );
}

/* ────────── tabs ────────── */

function GeneralTab() {
  const [s, setS] = useState({
    name: "Renewably UK",
    support: "support@renewably.uk",
    tz: "Europe/London",
    locale: "en-GB",
    hours: "Mon–Fri · 09:00–17:30",
  });
  const save = () => toast.success("General settings saved");
  return (
    <Card title="General" desc="Platform defaults shown to all workspaces."
      footer={<SaveFooter onSave={save} onDiscard={() => toast("Reverted")} />}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Platform name"><Input value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} /></Field>
        <Field label="Support email"><Input value={s.support} onChange={(e) => setS({ ...s, support: e.target.value })} /></Field>
        <Field label="Default timezone">
          <Select value={s.tz} onValueChange={(v) => setS({ ...s, tz: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Europe/London">Europe/London</SelectItem>
              <SelectItem value="Europe/Dublin">Europe/Dublin</SelectItem>
              <SelectItem value="UTC">UTC</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Default locale">
          <Select value={s.locale} onValueChange={(v) => setS({ ...s, locale: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en-GB">English (UK)</SelectItem>
              <SelectItem value="en-US">English (US)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Business hours" hint="Used in SLA calculations."><Input value={s.hours} onChange={(e) => setS({ ...s, hours: e.target.value })} /></Field>
      </div>
    </Card>
  );
}

function BrandingTab() {
  const [accent, setAccent] = useState(true);
  const save = () => toast.success("Branding saved");
  return (
    <Card title="Branding" desc="Logo, accent and login hero shown across the platform."
      footer={<SaveFooter onSave={save} onDiscard={() => toast("Reverted")} />}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Logo (SVG / PNG)" hint="Recommended 240×60. Used in sidebar and emails.">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-24 place-items-center rounded-md border bg-surface text-[10px] text-ink-muted">PREVIEW</div>
            <Button variant="secondary" size="sm">Upload…</Button>
          </div>
        </Field>
        <Field label="Favicon" hint="32×32 PNG.">
          <Button variant="secondary" size="sm">Upload…</Button>
        </Field>
        <Field label="Login page hero">
          <Input placeholder="Tagline shown beside the sign-in form" />
        </Field>
        <div className="flex items-center justify-between rounded-xl border bg-surface/40 px-4 py-3">
          <div>
            <div className="text-sm font-medium text-foreground">Use brand accent</div>
            <div className="text-[11px] text-ink-muted">Toggle off for monochrome-only UI.</div>
          </div>
          <Switch checked={accent} onCheckedChange={setAccent} />
        </div>
      </div>
    </Card>
  );
}

function RetentionTab() {
  const [audit, setAudit] = useState("365");
  const [ibg, setIbg] = useState("forever");
  const [trash, setTrash] = useState("30");
  const save = () => toast.success("Retention policies saved");
  return (
    <Card title="Retention & data" desc="How long records and PDFs stay accessible."
      footer={<SaveFooter onSave={save} onDiscard={() => toast("Reverted")} />}>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Audit log retention">
          <Select value={audit} onValueChange={setAudit}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["30","90","365","forever"].map((v) => <SelectItem key={v} value={v}>{v === "forever" ? "Forever" : `${v} days`}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="IBG PDF retention">
          <Select value={ibg} onValueChange={setIbg}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["365","1825","forever"].map((v) => <SelectItem key={v} value={v}>{v === "forever" ? "Forever" : `${v} days`}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Soft-delete window">
          <Select value={trash} onValueChange={setTrash}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["7","14","30","90"].map((v) => <SelectItem key={v} value={v}>{v} days</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <div className="flex items-center justify-between rounded-xl border bg-surface/40 px-4 py-3">
        <div>
          <div className="text-sm font-medium text-foreground">Export everything</div>
          <div className="text-[11px] text-ink-muted">Generate a zip with all records, attachments and audit history.</div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => toast.success("Export queued — you'll be emailed when ready")}>Start export</Button>
      </div>
    </Card>
  );
}

function EmailTab() {
  const save = () => toast.success("Email settings saved");
  return (
    <Card title="Email" desc="Sender identity and shared template footer."
      footer={<SaveFooter onSave={save} onDiscard={() => toast("Reverted")} />}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Sender name"><Input defaultValue="Renewably UK" /></Field>
        <Field label="Reply-to address"><Input defaultValue="noreply@renewably.uk" /></Field>
      </div>
      <Field label="Footer (markdown)">
        <Textarea rows={5} defaultValue="Renewably UK · 1 Energy Square, London EC2A 4AB · Company No. 12345678" />
      </Field>
      <div className="grid gap-2 md:grid-cols-2">
        {["IBG issued","Amendment requested","Funding approved","Onboarding welcome"].map((t) => (
          <div key={t} className="flex items-center justify-between rounded-xl border bg-surface/40 px-4 py-2.5">
            <span className="text-sm text-foreground">{t}</span>
            <Button variant="ghost" size="sm">Edit template</Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SecurityTab() {
  const [forceMfa, setForceMfa] = useState(true);
  const save = () => toast.success("Security policy saved");
  return (
    <Card title="Security" desc="Password, sessions and access controls."
      footer={<SaveFooter onSave={save} onDiscard={() => toast("Reverted")} />}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Minimum password length"><Input type="number" defaultValue={12} min={8} max={64} /></Field>
        <Field label="Session timeout (minutes)"><Input type="number" defaultValue={60} min={5} max={1440} /></Field>
        <Field label="Allowed MFA methods" hint="Hold ⌘ to multi-select.">
          <Select defaultValue="totp">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="totp">TOTP only</SelectItem>
              <SelectItem value="totp+webauthn">TOTP + WebAuthn</SelectItem>
              <SelectItem value="any">All methods</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <div className="flex items-center justify-between rounded-xl border bg-surface/40 px-4 py-3">
          <div>
            <div className="text-sm font-medium text-foreground">Force MFA for admins</div>
            <div className="text-[11px] text-ink-muted">Internal Renewably staff cannot sign in without 2FA.</div>
          </div>
          <Switch checked={forceMfa} onCheckedChange={setForceMfa} />
        </div>
      </div>
      <Field label="IP allowlist" hint="One CIDR per line. Leave empty to allow all.">
        <Textarea rows={4} placeholder="10.0.0.0/8&#10;192.168.1.0/24" />
      </Field>
    </Card>
  );
}

function EnvironmentTab() {
  const [maint, setMaint] = useState(false);
  const [pendingMaint, setPendingMaint] = useState(false);
  const apply = () => { setMaint(true); setPendingMaint(false); toast.success("Maintenance mode enabled"); };
  return (
    <>
      <Card title="Environment" desc="Active environment and platform-wide notices."
        footer={<SaveFooter onSave={() => toast.success("Environment saved")} onDiscard={() => toast("Reverted")} />}>
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-muted">Active environment</span>
          <span className="rounded-full border bg-brand-blue-tint px-2.5 py-0.5 text-[11px] font-medium text-brand-blue">Test</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border bg-surface/40 px-4 py-3">
          <div>
            <div className="text-sm font-medium text-foreground">Maintenance mode</div>
            <div className="text-[11px] text-ink-muted">Blocks all non-admin sign-ins and shows the banner below.</div>
          </div>
          <Switch checked={maint} onCheckedChange={(v) => v ? setPendingMaint(true) : setMaint(false)} />
        </div>
        <Field label="Banner message" hint="Shown across the app when maintenance mode is on.">
          <Textarea rows={3} placeholder="We're performing scheduled maintenance — back at 21:00 UTC." />
        </Field>
      </Card>

      <AlertDialog open={pendingMaint} onOpenChange={setPendingMaint}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enable maintenance mode?</AlertDialogTitle>
            <AlertDialogDescription>
              All non-admin sessions will be signed out. New sign-ins will be blocked until maintenance is disabled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={apply}>Enable</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function DangerTab() {
  const [showKey, setShowKey] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmPurge, setConfirmPurge] = useState(false);

  const rotate = () => {
    const k = "rk_live_" + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
    setShowKey(k);
    toast.success("Platform API key rotated. Old key will stop working in 24h.");
  };

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-destructive/30 bg-card">
        <header className="border-b border-destructive/30 bg-destructive/5 px-5 py-4">
          <h2 className="text-sm font-semibold text-destructive">Danger zone</h2>
          <p className="mt-0.5 text-[12px] text-ink-muted">Irreversible operations. Double-check before proceeding.</p>
        </header>
        <div className="divide-y">
          <Row title="Reset demo data" desc="Wipe all mock records and reseed the platform."
            cta={<Button variant="secondary" size="sm" onClick={() => setConfirmReset(true)}>Reset…</Button>} />
          <Row title="Rotate platform API key" desc="Issue a new key and revoke the old one in 24h."
            cta={<Button variant="secondary" size="sm" onClick={rotate}><RotateCw className="size-4" /> Rotate</Button>} />
          <Row title="Purge soft-deleted records" desc="Permanently delete everything currently in trash."
            cta={<Button variant="secondary" size="sm" onClick={() => setConfirmPurge(true)}>Purge…</Button>} />
        </div>
      </section>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Reset all demo data?</AlertDialogTitle>
            <AlertDialogDescription>This wipes every mock record and reseeds. It cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { localStorage.removeItem("renewably:mock-store:v2"); location.reload(); }}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmPurge} onOpenChange={setConfirmPurge}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Purge soft-deleted records?</AlertDialogTitle>
            <AlertDialogDescription>Permanently deletes everything currently in trash. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => toast.success("Purge complete")}>Purge</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!showKey} onOpenChange={(o) => !o && setShowKey(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>New platform API key</AlertDialogTitle>
            <AlertDialogDescription>Copy and store this key now — it won't be shown again.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center gap-2 rounded-md border bg-surface px-3 py-2 font-mono text-[12px]">
            <span className="grow break-all">{showKey}</span>
            <Button variant="icon" size="icon" onClick={() => { navigator.clipboard.writeText(showKey ?? ""); toast.success("Copied"); }}><Copy className="size-4" /></Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowKey(null)}>I've saved it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Row({ title, desc, cta }: { title: string; desc: string; cta: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div>
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="mt-0.5 text-[12px] text-ink-muted">{desc}</div>
      </div>
      {cta}
    </div>
  );
}
