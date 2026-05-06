import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play, CheckCircle2, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { LockedCard } from "@/components/app/locked-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/admin/cron")({
  head: () => ({ meta: [{ title: "Cron Jobs — Renewably UK" }] }),
  component: CronPage,
});

type Job = {
  id: string;
  name: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  duration: string;
  status: "Healthy" | "Warning";
  paused: boolean;
  detail: string;
};

const SEED: Job[] = [
  { id: "risk", name: "Risk Checks", schedule: "Daily · 03:00 UTC", lastRun: "Today 03:00", nextRun: "Tomorrow 03:00", duration: "42s", status: "Healthy", paused: false, detail: "Companies House verification for all Limited Company accounts." },
  { id: "stripe", name: "Stripe Sync", schedule: "Hourly", lastRun: "09:00", nextRun: "10:00", duration: "8s", status: "Healthy", paused: false, detail: "Reconcile payment and subscription status updates." },
  { id: "email", name: "Email Retry", schedule: "Every 4 hours", lastRun: "08:00", nextRun: "12:00", duration: "1m 12s", status: "Warning", paused: false, detail: "Retry failed IBG email deliveries (max 3 attempts)." },
  { id: "health", name: "API Health Check", schedule: "Every 15 min", lastRun: "09:30", nextRun: "09:45", duration: "3s", status: "Healthy", paused: false, detail: "Test connections to all external APIs." },
];

function CronPage() {
  const { permissions } = useDevRole();
  const [jobs, setJobs] = useState(SEED);
  const [logFor, setLogFor] = useState<Job | null>(null);

  if (!can(permissions, "config.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <LockedCard title="Cron Jobs" reason={{ kind: "permission", permission: "config.read" }} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Admin · Integrations"
        title="Cron jobs"
        subtitle="Monitor and control scheduled background processes."
        actions={<Button variant="secondary" size="sm">Refresh statuses</Button>}
      />

      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-[12px] font-medium text-ink-muted">
              <th className="px-3 py-2.5 text-left">Job</th>
              <th className="px-3 py-2.5 text-left">Schedule</th>
              <th className="px-3 py-2.5 text-left">Last run</th>
              <th className="px-3 py-2.5 text-left">Next run</th>
              <th className="px-3 py-2.5 text-left">Duration</th>
              <th className="px-3 py-2.5 text-left">Status</th>
              <th className="px-3 py-2.5 text-left">Enabled</th>
              <th className="px-3 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="border-b last:border-b-0 hover:bg-surface/60">
                <td className="px-3 py-3.5 font-medium text-foreground">{j.name}</td>
                <td className="px-3 py-3.5 text-ink-muted">{j.schedule}</td>
                <td className="px-3 py-3.5 text-ink-muted">{j.lastRun}</td>
                <td className="px-3 py-3.5 text-ink-muted">{j.nextRun}</td>
                <td className="px-3 py-3.5 text-ink-muted">{j.duration}</td>
                <td className="px-3 py-3.5">
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                    j.status === "Healthy" ? "bg-cat-green-bg text-cat-green" : "bg-cat-amber-bg text-cat-amber",
                  )}>
                    {j.status === "Healthy" ? <CheckCircle2 className="size-3" /> : <AlertTriangle className="size-3" />}
                    {j.status}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <Switch
                    checked={!j.paused}
                    onCheckedChange={(v) => setJobs((xs) => xs.map((x) => x.id === j.id ? { ...x, paused: !v } : x))}
                  />
                </td>
                <td className="px-2 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setLogFor(j)}>View log</Button>
                    <Button size="sm" onClick={() => toast.success(`${j.name} triggered`)}>
                      <Play className="size-3.5" /> Run now
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={!!logFor} onOpenChange={(v) => !v && setLogFor(null)}>
        <SheetContent className="w-[520px] sm:max-w-[520px]">
          <SheetHeader>
            <SheetTitle>{logFor?.name} — execution log</SheetTitle>
          </SheetHeader>
          {logFor && (
            <div className="mt-6 space-y-3 text-sm">
              <p className="text-ink-muted">{logFor.detail}</p>
              <pre className="overflow-auto rounded-lg bg-surface p-3 font-mono text-[11px]">
{`[${logFor.lastRun}] start
[${logFor.lastRun}] processed: 247 records
[${logFor.lastRun}] duration: ${logFor.duration}
[${logFor.lastRun}] status: ${logFor.status === "Healthy" ? "ok" : "completed with warnings"}`}
              </pre>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default CronPage;
