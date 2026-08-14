import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Align = "left" | "right";

const ALIGN_CLASS: Record<Align, string> = {
  left: "text-left",
  right: "text-right",
};

export function Table({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full border-collapse text-sm", className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-card-tint">
      <tr>{children}</tr>
    </thead>
  );
}

export function TableHead({
  children,
  align = "left",
  className,
}: {
  children: ReactNode;
  align?: Align;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "py-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-text",
        ALIGN_CLASS[align],
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-card-tint">{children}</tbody>;
}

export function TableRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr className={cn("transition-colors hover:bg-page-bg/60", className)}>
      {children}
    </tr>
  );
}

export function TableCell({
  children,
  align = "left",
  className,
}: {
  children: ReactNode;
  align?: Align;
  className?: string;
}) {
  return (
    <td
      className={cn("py-3 text-surface-navy", ALIGN_CLASS[align], className)}
    >
      {children}
    </td>
  );
}

export interface Column<T> {
  key: string;
  header: string;
  align?: Align;
  render: (row: T) => ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  className,
}: DataTableProps<T>) {
  return (
    <Table className={className}>
      <TableHeader>
        {columns.map((column) => (
          <TableHead key={column.key} align={column.align}>
            {column.header}
          </TableHead>
        ))}
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={rowKey(row)}>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                align={column.align}
                className={column.className}
              >
                {column.render(row)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
