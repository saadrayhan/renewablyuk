import { createFileRoute } from "@tanstack/react-router";
import { Boxes, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { useStore } from "@/lib/mock/store";

export const Route = createFileRoute("/_authed/admin/products")({
  component: ProductsPage,
});

function ProductsPage() {
  const { products } = useStore();
  return (
    <div className="space-y-6 px-6 py-8 md:px-10 md:py-12">
      <div className="flex items-end justify-between gap-4">
        <PageHeader eyebrow="CATALOG" title="Products" />
        <button className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          <Plus className="size-4" /> New product
        </button>
      </div>
      {products.length === 0 ? (
        <EmptyState icon={Boxes} title="No products" />
      ) : (
        <ul className="divide-y rounded-2xl border bg-background">
          {products.map((p) => (
            <li key={p.id} className="grid grid-cols-[1fr_160px_120px_80px] items-center gap-4 px-4 py-3 text-sm">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-ink-muted">{p.description}</div>
              </div>
              <span className="text-xs text-ink-muted">{p.manufacturer}</span>
              <span className="font-mono text-xs text-ink-muted">{p.sku}</span>
              <span className="text-xs text-ink-muted capitalize">{p.category}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
