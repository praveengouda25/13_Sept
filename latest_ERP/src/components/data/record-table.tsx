import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { deleteRecord } from "@/lib/ops-extra.functions";
import { useSession } from "@/hooks/use-session";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
};

export function RecordTable<T extends { id: string }>({
  columns,
  rows,
  onRowClick,
  onDelete,
  deleteLabel = "this record",
  deleteTable,
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  onDelete?: (row: T) => Promise<void>;
  deleteLabel?: string;
  deleteTable?:
    | "students"
    | "admissions"
    | "hostels"
    | "buildings"
    | "floors"
    | "rooms"
    | "beds"
    | "student_gate_passes"
    | "visitors"
    | "medical_records"
    | "medicines"
    | "vendors"
    | "mess_menus"
    | "food_stock"
    | "assets"
    | "donations"
    | "expenses"
    | "inventory_items"
    | "issues"
    | "complaints"
    | "maintenance_requests"
    | "staff"
    | "attendance"
    | "leave_requests";
}) {
  const { roles } = useSession();
  const qc = useQueryClient();
  const remove = useServerFn(deleteRecord);
  const autoDelete = useMutation({
    mutationFn: (row: T) => remove({ data: { table: deleteTable!, id: row.id } }),
    onSuccess: () => void qc.invalidateQueries(),
  });
  const canAutoDelete = Boolean(deleteTable) && roles.some((role) => ["super_admin", "trust_admin", "branch_admin"].includes(role));
  const deleteHandler = onDelete ?? (canAutoDelete ? async (row: T) => { await autoDelete.mutateAsync(row); } : undefined);
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((c) => (
              <TableHead key={c.key} className={c.className}>
                {c.header}
              </TableHead>
            ))}
            {deleteHandler && <TableHead className="w-24 text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              className={onRowClick ? "cursor-pointer" : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((c) => (
                <TableCell key={c.key} className={c.className}>
                  {c.cell(row)}
                </TableCell>
              ))}
              {deleteHandler && <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                <DeleteCell row={row} onDelete={deleteHandler} label={deleteLabel} />
              </TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function DeleteCell<T extends { id: string }>({
  row,
  onDelete,
  label,
}: {
  row: T;
  onDelete: (row: T) => Promise<void>;
  label: string;
}) {
  const [pending, setPending] = useState(false);
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive" disabled={pending} aria-label={`Delete ${label}`}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {label}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will archive the record and remove it from normal lists. Related records are preserved.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              setPending(true);
              try {
                await onDelete(row);
                toast.success(`${label} deleted successfully`);
              } catch (error) {
                toast.error(error instanceof Error ? error.message : `Unable to delete ${label}`);
              } finally {
                setPending(false);
              }
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const TONES: Record<string, string> = {
  present: "bg-success/15 text-success border-success/30",
  active: "bg-success/15 text-success border-success/30",
  approved: "bg-success/15 text-success border-success/30",
  resolved: "bg-success/15 text-success border-success/30",
  enrolled: "bg-success/15 text-success border-success/30",
  pending: "bg-accent/15 text-accent border-accent/30",
  submitted: "bg-accent/15 text-accent border-accent/30",
  under_review: "bg-accent/15 text-accent border-accent/30",
  in_progress: "bg-accent/15 text-accent border-accent/30",
  on_leave: "bg-accent/15 text-accent border-accent/30",
  late: "bg-accent/15 text-accent border-accent/30",
  leave: "bg-accent/15 text-accent border-accent/30",
  absent: "bg-destructive/15 text-destructive border-destructive/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
  urgent: "bg-destructive/15 text-destructive border-destructive/30",
  high: "bg-destructive/15 text-destructive border-destructive/30",
  open: "bg-info/15 text-info border-info/30",
};

export function StatusBadge({ value }: { value: string | null | undefined }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  return (
    <Badge variant="outline" className={TONES[value] ?? ""}>
      {value.replace(/_/g, " ")}
    </Badge>
  );
}

export function money(value: number | string | null | undefined, currency = "INR") {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}
