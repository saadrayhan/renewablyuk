/**
 * Brand mark — the Renewably logomark loaded from src/assets.
 * Use `<BrandMark className="size-8" />` for square mark spots.
 */
import logoUrl from "@/assets/logo-renewably.svg";

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src={logoUrl}
      alt="Renewably"
      className={className ?? "size-8"}
      draggable={false}
    />
  );
}
