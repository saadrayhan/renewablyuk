/**
 * Lightweight data table — ElevenLabs-style: borderless, flat header,
 * generous row height, soft hover.
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
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            {columns.map((c) => (
              <th
                key={c.key}
                style={{ width: c.width }}
                className={cn(
                  "px-3 py-2.5 text-[12px] font-medium text-ink-muted",
                  c.align === "right" ? "text-right" : "text-left",
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
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
  if (href) {
    return (
      <tr className="group cursor-pointer transition-colors hover:bg-surface/60">
        {columns.map((c) => (
          <td
            key={c.key}
            className={cn(
              "p-0 text-foreground",
              c.align === "right" ? "text-right" : "text-left",
            )}
          >
            <Link to={href} className="block px-3 py-3.5">{c.render(row)}</Link>
          </td>
        ))}
      </tr>
    );
  }
  return (
    <tr className="hover:bg-surface/60">
      {columns.map((c) => (
        <td
          key={c.key}
          className={cn(
            "px-3 py-3.5 text-foreground",
            c.align === "right" ? "text-right" : "text-left",
          )}
        >
          {c.render(row)}
        </td>
      ))}
    </tr>
  );
}
