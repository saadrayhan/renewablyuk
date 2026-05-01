import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Library } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { PERMISSIONS, PERMISSION_CATEGORIES, OPERATOR_PRESETS, type Permission, type PermissionCategory } from "@/lib/rbac";
import { UnderlineTabs } from "@/components/app/underline-tabs";

export const Route = createFileRoute("/_authed/admin/permissions")({
  head: () => ({ meta: [{ title: "Permission library — Renewably UK" }] }),
  component: PermissionLibrary,
});

function PermissionLibrary() {
  const [tab, setTab] = useState<"library" | "presets">("library");
  const [cat, setCat] = useState<PermissionCategory>(PERMISSION_CATEGORIES[0]);
  const filtered: { id: Permission; label: string; description: string }[] = PERMISSIONS.filter((p) => p.category === cat);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-8 py-10">
      <PageHeader
        eyebrow="Admin · System"
        title="Permission library"
        subtitle="The full catalogue of capabilities you can grant. Apply individually or via presets."
        actions={<span className="inline-flex items-center gap-1.5 rounded-full bg-cat-purple-bg px-3 py-1.5 text-xs font-medium text-cat-purple"><Library className="size-3.5" /> {PERMISSIONS.length} permissions</span>}
      />

      <div className="mt-6">
        <UnderlineTabs<"library" | "presets">
          value={tab} onChange={setTab}
          options={[{ value: "library", label: "Library" }, { value: "presets", label: "Presets", count: OPERATOR_PRESETS.length }]}
        />
      </div>

      {tab === "library" && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
          <div className="space-y-1">
            {PERMISSION_CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${cat === c ? "bg-foreground text-background" : "text-ink-muted hover:bg-surface hover:text-foreground"}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="rounded-2xl border bg-card">
            <div className="border-b px-5 py-3 text-sm font-medium">{cat}</div>
            <div className="divide-y">
              {filtered.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div>
                    <div className="text-sm font-medium text-foreground">{p.label}</div>
                    <div className="text-xs text-ink-muted">{p.description}</div>
                  </div>
                  <code className="rounded-md bg-tile px-2 py-0.5 text-[11px] text-ink-muted">{p.id}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "presets" && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {OPERATOR_PRESETS.map((p) => (
            <div key={p.id} className="rounded-2xl border bg-card p-5">
              <div className="text-sm font-semibold text-foreground">{p.label}</div>
              <div className="mt-1 text-xs text-ink-muted">{p.description}</div>
              <div className="mt-3 text-[11px] uppercase tracking-wide text-ink-muted">{p.permissions.length} permissions</div>
              <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                {p.permissions.map((perm) => (
                  <li key={perm} className="text-[11px] text-ink-muted">{PERMISSIONS.find((x) => x.id === perm)?.label ?? perm}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
