/**
 * Lightweight data table — ElevenLabs-style: no heavy borders, hover row,
 * subtle column headers, optional row link.
 */
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  width?: string;
  align?: "left" | "right";
};

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  rowHref,
  empty,
}: {
  rows: T[];
  columns: Column<T>[];
  rowHref?: (row: T) => string;
  empty?: ReactNode;
}) {
  if (rows.length === 0 && empty) return <>{empty}</>;
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-surface/40">
            {columns.map((c) => (
              <th
                key={c.key}
                style={{ width: c.width }}
                className={cn(
                  "px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted",
                  c.align === "right" ? "text-right" : "text-left",
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <Row key={row.id} row={row} columns={columns} href={rowHref?.(row)} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row<T extends { id: string }>({
  row, columns, href,
}: { row: T; columns: Column<T>[]; href?: string }) {
  const cells = columns.map((c) => (
    <td
      key={c.key}
      className={cn(
        "px-4 py-3 text-foreground",
        c.align === "right" ? "text-right" : "text-left",
      )}
    >
      {c.render(row)}
    </td>
  ));
  if (href) {
    return (
      <tr className="group cursor-pointer border-b last:border-b-0 transition-colors hover:bg-surface/60">
        {columns.map((c) => (
          <td
            key={c.key}
            className={cn(
              "p-0 text-foreground",
              c.align === "right" ? "text-right" : "text-left",
            )}
          >
            <Link to={href} className="block px-4 py-3">{c.render(row)}</Link>
          </td>
        ))}
      </tr>
    );
  }
  return (
    <tr className="border-b last:border-b-0 hover:bg-surface/60">{cells}</tr>
  );
}
