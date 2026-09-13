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
import { useSession } from "@/hooks/use-session";
import { listMaintenance, saveMaintenance } from "@/lib/ops-extra.functions";
import { exportTablePdf } from "@/lib/pdf";

export const Route = createFileRoute("/_authenticated/maintenance")({
  head: () => ({
    meta: [
      { title: "Maintenance | VISTARX Hostel360" },
      {
        name: "description",
        content:
          "Log and track repair jobs for rooms, buildings and assets with priority, cost and completion status.",
      },
      { property: "og:title", content: "Maintenance | VISTARX Hostel360" },
      {
        property: "og:description",
        content: "Repair jobs for rooms, buildings and assets with cost and status tracking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MaintenancePage,
});

type Row = {
  id: string;
  title: string;
  request_type: string | null;
  priority: string;
  status: string;
  reported_on: string;
  cost: number | null;
  description: string | null;
  notes: string | null;
};

function MaintenancePage() {
  const { branchId } = useSession();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);

  const fetchList = useServerFn(listMaintenance);
  const save = useServerFn(saveMaintenance);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["maintenance", branchId],
    queryFn: () => fetchList({ data: { branchId } }),
  });

  const mut = useMutation({
    mutationFn: (v: FormValues) =>
      save({
        data: clean({
          id: editing?.id,
          branch_id: branchId!,
          title: v.title,
          request_type: v.request_type || "repair",
          description: v.description || null,
          priority: (v.priority || "medium") as never,
          status: (v.status || "reported") as never,
          cost: v.cost ? Number(v.cost) : null,
          notes: v.notes || null,
        }),
      }),
    onSuccess: () => {
      toast.success(editing ? "Job updated" : "Job logged");
      setOpen(false);
      setEditing(null);
      void qc.invalidateQueries({ queryKey: ["maintenance"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (data?.jobs ?? []) as Row[];

  return (
    <>
      <PageHeader
        title="Maintenance"
        description="Repair and upkeep jobs across rooms, buildings and assets."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={rows.length === 0}
              onClick={() =>
                exportTablePdf({
                  title: "Maintenance jobs",
                  columns: ["Job", "Type", "Priority", "Status", "Reported", "Cost"],
                  rows: rows.map((r) => [
                    r.title,
                    r.request_type ?? "—",
                    r.priority,
                    r.status,
                    r.reported_on,
                    r.cost ?? 0,
                  ]),
                  fileName: "maintenance.pdf",
                })
              }
            >
              <FileDown className="mr-1 h-4 w-4" /> Export PDF
            </Button>
            <Button
              disabled={!branchId}
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="mr-1 h-4 w-4" /> New job
            </Button>
          </div>
        }
      />

      <RecordDialog
        key={editing?.id ?? "new"}
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditing(null);
        }}
        title={editing ? "Update job" : "Log a maintenance job"}
        description="Track repairs from report through to completion."
        fields={[
          { name: "title", label: "Job title", type: "text", required: true },
          {
            name: "request_type",
            label: "Type",
            type: "select",
            options: [
              "repair",
              "electrical",
              "plumbing",
              "carpentry",
              "cleaning",
              "pest_control",
              "other",
            ].map((v) => ({ value: v, label: v })),
          },
          {
            name: "priority",
            label: "Priority",
            type: "select",
            options: ["low", "medium", "high", "urgent"].map((v) => ({ value: v, label: v })),
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: ["reported", "scheduled", "in_progress", "completed", "cancelled"].map(
              (v) => ({ value: v, label: v }),
            ),
          },
          { name: "cost", label: "Cost", type: "number" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
        initial={
          editing
            ? {
                title: editing.title,
                request_type: editing.request_type ?? "repair",
                priority: editing.priority,
                status: editing.status,
                cost: editing.cost ? String(editing.cost) : "",
                description: editing.description ?? "",
                notes: editing.notes ?? "",
              }
            : { priority: "medium", status: "reported", request_type: "repair" }
        }
        pending={mut.isPending}
        onSubmit={(v) => mut.mutate(v)}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Open jobs" value={data?.stats.open ?? 0} tone="accent" />
        <StatCard label="Completed" value={data?.stats.completed ?? 0} tone="success" />
        <StatCard label="Total cost" value={money(data?.stats.cost ?? 0)} tone="info" />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard
          label="High priority"
          value={rows.filter((r) => r.priority === "high" || r.priority === "urgent").length}
          tone="warning"
        />
        <StatCard
          label="In progress"
          value={rows.filter((r) => r.status === "in_progress").length}
          tone="info"
        />
        <StatCard
          label="Scheduled"
          value={rows.filter((r) => r.status === "scheduled").length}
          tone="accent"
        />
        <StatCard
          label="Electrical"
          value={rows.filter((r) => r.request_type === "electrical").length}
          tone="info"
        />
      </div>

      {!branchId && (
        <EmptyState title="Select a branch" description="Maintenance jobs are per branch." />
      )}
      {isPending && <LoadingState />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {data && rows.length === 0 && branchId && (
        <EmptyState
          title="No maintenance jobs"
          description="Log a repair to start tracking upkeep."
        />
      )}

      {rows.length > 0 && (
        <RecordTable
          rows={rows}
          deleteTable="maintenance_requests"
          deleteLabel="maintenance request"
          onRowClick={(r) => {
            setEditing(r);
            setOpen(true);
          }}
          columns={[
            { key: "title", header: "Job", cell: (r) => r.title },
            { key: "type", header: "Type", cell: (r) => r.request_type ?? "—" },
            {
              key: "priority",
              header: "Priority",
              cell: (r) => <StatusBadge value={r.priority} />,
            },
            { key: "status", header: "Status", cell: (r) => <StatusBadge value={r.status} /> },
            { key: "reported", header: "Reported", cell: (r) => r.reported_on },
            { key: "cost", header: "Cost", cell: (r) => (r.cost ? money(Number(r.cost)) : "—") },
          ]}
        />
      )}
    </>
  );
}
