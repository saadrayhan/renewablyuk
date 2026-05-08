import { createFileRoute } from "@tanstack/react-router";
import { FileText, Upload } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { SectionHeader } from "@/components/app/section-header";
import { EmptyState } from "@/components/app/empty-state";
import { useStore } from "@/lib/mock/store";

export const Route = createFileRoute("/_authed/documents")({
  component: DocumentsPage,
});

function DocumentsPage() {
  const { evidenceItems } = useStore();
  const docs = evidenceItems;

  return (
    <div className="space-y-6 px-6 py-8 md:px-10 md:py-12">
      <div className="flex items-end justify-between gap-4">
        <PageHeader eyebrow="LIBRARY" title="Documents" />
        <button className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          <Upload className="size-4" /> Upload
        </button>
      </div>

      <SectionHeader title="All documents" />
      {docs.length === 0 ? (
        <EmptyState icon={FileText} title="No documents uploaded" body="Upload your first evidence file." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((d) => (
            <div key={d.id} className="rounded-2xl border bg-background p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="grid size-9 place-items-center rounded-lg bg-surface text-ink-muted">
                  <FileText className="size-4" />
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">
                  {d.fileType}
                </span>
              </div>
              <div className="truncate text-sm font-medium text-foreground">{d.fileName}</div>
              <div className="text-xs text-ink-muted">{d.category} · {d.certificateRef}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
