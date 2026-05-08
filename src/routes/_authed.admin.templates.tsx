import { createFileRoute } from "@tanstack/react-router";
import { PanelsTopLeft, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { useStore } from "@/lib/mock/store";

export const Route = createFileRoute("/_authed/admin/templates")({
  component: TemplatesPage,
});

function TemplatesPage() {
  const { certificateTemplates } = useStore();
  return (
    <div className="space-y-6 px-6 py-8 md:px-10 md:py-12">
      <div className="flex items-end justify-between gap-4">
        <PageHeader eyebrow="LIBRARY" title="Certificate templates" />
        <button className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          <Plus className="size-4" /> New template
        </button>
      </div>
      {certificateTemplates.length === 0 ? (
        <EmptyState icon={PanelsTopLeft} title="No templates" />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {certificateTemplates.map((t) => (
            <div key={t.id} className="rounded-2xl border bg-background p-5">
              <div className="size-8 rounded-lg" style={{ backgroundColor: t.brandColor }} />
              <div className="mt-3 text-sm font-semibold">{t.name}</div>
              <div className="text-xs text-ink-muted">{t.category}</div>
              <div className="mt-2 text-xs text-ink-muted">{t.description}</div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-ink-muted">
                <span>{t.fields.length} fields · {t.evidenceRequired.length} evidence</span>
                <span>{t.active ? "Active" : "Draft"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
