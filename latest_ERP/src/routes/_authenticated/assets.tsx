import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  LoadingState,
  ErrorState,
  EmptyState,
  StatCard,
} from "@/components/data/states";
import { RecordTable, StatusBadge, money } from "@/components/data/record-table";
import { RecordDialog, clean, type FormValues } from "@/components/data/record-dialog";
import { QrButton, recordUrl } from "@/components/data/qr";
import { useSession } from "@/hooks/use-session";
import { listAssets, saveAsset } from "@/lib/modules.functions";
import { exportTablePdf } from "@/lib/pdf";

export const Route = createFileRoute("/_authenticated/assets")({
  head: () => ({
    meta: [
      { title: "Asset management | VISTARX Hostel360" },
      {
        name: "description",
        content:
          "Track computers, fans, beds, tables and other hostel assets with condition, location and value.",
      },
      { property: "og:title", content: "Asset management | VISTARX Hostel360" },
      {
        property: "og:description",
        content:
          "Track computers, fans, beds, tables and other hostel assets with condition, location and value.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssetsPage,
});

type AssetRow = {
  id: string;
  name: string;
  category: string | null;
  asset_code: string | null;
  serial_number: string | null;
  location: string | null;
  condition: string;
  quantity: number;
  purchase_date: string | null;
  purchase_cost: number | null;
};

function AssetsPage() {
  const { branchId } = useSession();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const fetchList = useServerFn(listAssets);
  const save = useServerFn(saveAsset);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["assets", branchId],
    queryFn: () => fetchList({ data: { branchId } }),
  });

  const saveMut = useMutation({
    mutationFn: (v: FormValues) =>
      save({
        data: clean({
          branch_id: branchId!,
          name: v.name,
          category: v.category || null,
          asset_code: v.asset_code || null,
          serial_number: v.serial_number || null,
          location: v.location || null,
          condition: (v.condition || "good") as never,
          quantity: Number(v.quantity || 1),
          purchase_date: v.purchase_date || null,
          purchase_cost: v.purchase_cost ? Number(v.purchase_cost) : null,
          notes: v.notes || null,
        }),
      }),
    onSuccess: () => {
      toast.success("Asset saved");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (data?.assets ?? []) as AssetRow[];
  const totalValue = rows.reduce(
    (a, r) => a + Number(r.purchase_cost ?? 0) * Number(r.quantity ?? 1),
    0,
  );

  return (
    <>
      <PageHeader
        title="Assets"
        description="Computers, fans, beds, tables and every other fixed item in the hostels."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={rows.length === 0}
              onClick={() =>
                exportTablePdf({
                  title: "Asset register",
                  columns: ["Asset", "Category", "Code", "Location", "Condition", "Qty", "Cost"],
                  rows: rows.map((r) => [
                    r.name,
                    r.category ?? "—",
                    r.asset_code ?? "—",
                    r.location ?? "—",
                    r.condition,
                    r.quantity,
                    r.purchase_cost ?? 0,
                  ]),
                  fileName: "asset-register.pdf",
                })
              }
            >
              <FileDown className="mr-1 h-4 w-4" /> PDF
            </Button>
            <Button disabled={!branchId} onClick={() => setOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Add asset
            </Button>
          </div>
        }
      />

      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        title="Add asset"
        fields={[
          { name: "name", label: "Asset name", type: "text", required: true },
          { name: "category", label: "Category", type: "text", placeholder: "Computer, Fan, Bed…" },
          { name: "asset_code", label: "Asset code", type: "text" },
          { name: "serial_number", label: "Serial number", type: "text" },
          { name: "location", label: "Location", type: "text" },
          {
            name: "condition",
            label: "Condition",
            type: "select",
            options: ["new", "good", "fair", "poor", "damaged", "disposed"].map((v) => ({
              value: v,
              label: v,
            })),
          },
          { name: "quantity", label: "Quantity", type: "number" },
          { name: "purchase_date", label: "Purchase date", type: "date" },
          { name: "purchase_cost", label: "Purchase cost", type: "number" },
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
        initial={{ condition: "good", quantity: "1" }}
        pending={saveMut.isPending}
        onSubmit={(v) => saveMut.mutate(v)}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Assets" value={rows.length} />
        <StatCard label="Units" value={rows.reduce((a, r) => a + Number(r.quantity ?? 1), 0)} />
        <StatCard
          label="Needs repair"
          value={rows.filter((r) => ["poor", "damaged"].includes(r.condition)).length}
          tone="accent"
        />
        <StatCard label="Book value" value={money(totalValue)} tone="info" />
      </div>

      {!branchId && (
        <EmptyState title="Select a branch" description="Assets are tracked per branch." />
      )}
      {isPending && <LoadingState />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {data && rows.length === 0 && branchId && (
        <EmptyState
          title="No assets yet"
          description="Add the first computer, fan, bed or table."
        />
      )}

      {rows.length > 0 && (
        <RecordTable
          rows={rows}
          deleteTable="assets"
          deleteLabel="asset"
          columns={[
            { key: "name", header: "Asset", cell: (r) => r.name },
            { key: "cat", header: "Category", cell: (r) => r.category ?? "—" },
            { key: "code", header: "Code", cell: (r) => r.asset_code ?? "—" },
            { key: "loc", header: "Location", cell: (r) => r.location ?? "—" },
            { key: "cond", header: "Condition", cell: (r) => <StatusBadge value={r.condition} /> },
            { key: "qty", header: "Qty", cell: (r) => r.quantity },
            {
              key: "cost",
              header: "Cost",
              cell: (r) => (r.purchase_cost ? money(r.purchase_cost) : "—"),
            },
            {
              key: "qr",
              header: "QR",
              cell: (r) => (
                <QrButton
                  value={recordUrl(`/assets?id=${r.id}`)}
                  title={r.name}
                  subtitle={r.asset_code ?? r.category ?? "Asset"}
                />
              ),
            },
          ]}
        />
      )}
    </>
  );
}
