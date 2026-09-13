import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, ArrowDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PageHeader,
  LoadingState,
  ErrorState,
  EmptyState,
  StatCard,
} from "@/components/data/states";
import { RecordTable } from "@/components/data/record-table";
import { QrButton, recordUrl } from "@/components/data/qr";
import { RecordDialog, clean, today, type FormValues } from "@/components/data/record-dialog";
import { useSession } from "@/hooks/use-session";
import { listInventory, saveInventoryItem, recordStockMovement } from "@/lib/operations.functions";

export const Route = createFileRoute("/_authenticated/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory | VISTARX Hostel360" },
      {
        name: "description",
        content: "Track hostel stock with in, out and adjustment movements plus low-stock alerts.",
      },
      { property: "og:title", content: "Inventory | VISTARX Hostel360" },
      {
        property: "og:description",
        content: "Track hostel stock with in, out and adjustment movements plus low-stock alerts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  const { branchId } = useSession();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [moveItem, setMoveItem] = useState<string | null>(null);

  const fetchList = useServerFn(listInventory);
  const save = useServerFn(saveInventoryItem);
  const move = useServerFn(recordStockMovement);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["inventory", branchId],
    queryFn: () => fetchList({ data: { branchId } }),
  });

  const createMut = useMutation({
    mutationFn: (v: FormValues) =>
      save({
        data: clean({
          branch_id: branchId!,
          name: v.name,
          category: v.category || null,
          unit: v.unit || "pcs",
          quantity: Number(v.quantity || 0),
          min_quantity: Number(v.min_quantity || 0),
          location: v.location || null,
          notes: v.notes || null,
        }),
      }),
    onSuccess: () => {
      toast.success("Item saved");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const moveMut = useMutation({
    mutationFn: (v: FormValues) =>
      move({
        data: {
          branch_id: branchId!,
          item_id: moveItem!,
          txn_type: v.txn_type as "in" | "out" | "adjustment",
          quantity: Number(v.quantity || 0),
          reason: v.reason || null,
          occurred_on: v.occurred_on || today(),
        },
      }),
    onSuccess: () => {
      toast.success("Stock updated");
      setMoveItem(null);
      void qc.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = data?.items ?? [];
  const low = rows.filter((r) => Number(r.quantity) <= Number(r.min_quantity));

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Stock of provisions, furniture and supplies with low-stock alerts."
        actions={
          <Button disabled={!branchId} onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Add item
          </Button>
        }
      />

      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        title="Add inventory item"
        fields={[
          { name: "name", label: "Item name", type: "text", required: true },
          { name: "category", label: "Category", type: "text" },
          { name: "quantity", label: "Quantity", type: "number", required: true },
          { name: "unit", label: "Unit", type: "text", placeholder: "pcs, kg, litre" },
          { name: "min_quantity", label: "Minimum stock", type: "number" },
          { name: "location", label: "Storage location", type: "text" },
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
        initial={{ unit: "pcs", quantity: "0", min_quantity: "0" }}
        pending={createMut.isPending}
        onSubmit={(v) => createMut.mutate(v)}
      />

      <RecordDialog
        open={!!moveItem}
        onOpenChange={(o) => !o && setMoveItem(null)}
        title="Stock movement"
        description="Record stock coming in, going out or a correction."
        submitLabel="Apply"
        fields={[
          {
            name: "txn_type",
            label: "Type",
            type: "select",
            required: true,
            options: [
              { value: "in", label: "Stock in" },
              { value: "out", label: "Stock out" },
              { value: "adjustment", label: "Set exact quantity" },
            ],
          },
          { name: "quantity", label: "Quantity", type: "number", required: true },
          { name: "occurred_on", label: "Date", type: "date" },
          { name: "reason", label: "Reason", type: "textarea" },
        ]}
        initial={{ txn_type: "in", occurred_on: today() }}
        pending={moveMut.isPending}
        onSubmit={(v) => moveMut.mutate(v)}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Items tracked" value={rows.length} />
        <StatCard label="Low stock" value={low.length} tone={low.length ? "accent" : "default"} />
        <StatCard label="Categories" value={new Set(rows.map((r) => r.category ?? "—")).size} />
      </div>

      {!branchId && <EmptyState title="Select a branch" description="Inventory is per branch." />}
      {isPending && <LoadingState />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {data && rows.length === 0 && (
        <EmptyState title="No stock items" description="Add the items you want to track." />
      )}

      {rows.length > 0 && (
        <RecordTable
          rows={rows}
          deleteTable="inventory_items"
          deleteLabel="inventory item"
          columns={[
            { key: "name", header: "Item", cell: (r) => r.name },
            { key: "category", header: "Category", cell: (r) => r.category ?? "—" },
            {
              key: "qty",
              header: "In stock",
              className: "font-mono tabular-nums",
              cell: (r) => (
                <span>
                  {Number(r.quantity)} {r.unit}
                  {Number(r.quantity) <= Number(r.min_quantity) ? (
                    <Badge
                      variant="outline"
                      className="ml-2 border-accent/30 bg-accent/15 text-accent"
                    >
                      low
                    </Badge>
                  ) : null}
                </span>
              ),
            },
            { key: "min", header: "Min", cell: (r) => Number(r.min_quantity) },
            { key: "loc", header: "Location", cell: (r) => r.location ?? "—" },
            {
              key: "actions",
              header: "",
              className: "text-right",
              cell: (r) => (
                <div className="flex items-center justify-end gap-1">
                  <QrButton
                    value={recordUrl(`/inventory?id=${r.id}`)}
                    title={r.name}
                    subtitle={r.category ?? "Inventory item"}
                  />
                  <Button size="sm" variant="outline" onClick={() => setMoveItem(r.id)}>
                    <ArrowDownUp className="mr-1 h-3.5 w-3.5" /> Move
                  </Button>
                </div>
              ),
            },
          ]}
        />
      )}
    </>
  );
}
