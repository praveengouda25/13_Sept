import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  LoadingState,
  ErrorState,
  EmptyState,
  StatCard,
} from "@/components/data/states";
import { RecordTable, StatusBadge } from "@/components/data/record-table";
import { RecordDialog, clean, today, type FormValues } from "@/components/data/record-dialog";
import { useSession } from "@/hooks/use-session";
import { listIssues, saveIssue } from "@/lib/operations.functions";

export const Route = createFileRoute("/_authenticated/issues")({
  head: () => ({
    meta: [
      { title: "Issue register | VISTARX Hostel360" },
      {
        name: "description",
        content:
          "Log maintenance and welfare issues by priority and follow them through to resolution.",
      },
      { property: "og:title", content: "Issue register | VISTARX Hostel360" },
      {
        property: "og:description",
        content:
          "Log maintenance and welfare issues by priority and follow them through to resolution.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IssuesPage,
});

type Issue = {
  id: string;
  status: string;
  title: string;
  priority: string;
  category: string | null;
  reported_on: string;
};

function IssuesPage() {
  const { branchId } = useSession();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const fetchList = useServerFn(listIssues);
  const save = useServerFn(saveIssue);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["issues", branchId],
    queryFn: () => fetchList({ data: { branchId } }),
  });

  const createMut = useMutation({
    mutationFn: (v: FormValues) =>
      save({
        data: clean({
          branch_id: branchId!,
          title: v.title,
          description: v.description || null,
          category: v.category || null,
          priority: (v.priority || "medium") as never,
          status: (v.status || "open") as never,
          reported_on: v.reported_on || today(),
        }),
      }),
    onSuccess: () => {
      toast.success("Issue logged");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["issues"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const advance = useMutation({
    mutationFn: (row: Issue) =>
      save({
        data: {
          id: row.id,
          branch_id: branchId!,
          title: row.title,
          priority: row.priority as never,
          status: (row.status === "open"
            ? "in_progress"
            : row.status === "in_progress"
              ? "resolved"
              : "closed") as never,
          reported_on: row.reported_on,
        },
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["issues"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = data?.issues ?? [];
  const openCount = rows.filter((r) => r.status === "open" || r.status === "in_progress").length;

  return (
    <>
      <PageHeader
        title="Issue register"
        description="Complaints, maintenance requests and incidents with resolution tracking."
        actions={
          <Button disabled={!branchId} onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Log issue
          </Button>
        }
      />

      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        title="Log an issue"
        fields={[
          { name: "title", label: "Issue", type: "text", required: true },
          {
            name: "category",
            label: "Category",
            type: "text",
            placeholder: "Maintenance, discipline…",
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
            options: ["open", "in_progress", "resolved", "closed"].map((v) => ({
              value: v,
              label: v.replace(/_/g, " "),
            })),
          },
          { name: "reported_on", label: "Reported on", type: "date" },
          { name: "description", label: "Description", type: "textarea" },
        ]}
        initial={{ priority: "medium", status: "open", reported_on: today() }}
        pending={createMut.isPending}
        onSubmit={(v) => createMut.mutate(v)}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Open issues" value={openCount} tone={openCount ? "accent" : "default"} />
        <StatCard label="Total logged" value={rows.length} />
        <StatCard label="Urgent" value={rows.filter((r) => r.priority === "urgent").length} />
      </div>

      {!branchId && <EmptyState title="Select a branch" description="Issues are per branch." />}
      {isPending && <LoadingState />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {data && rows.length === 0 && (
        <EmptyState title="Nothing logged" description="Reported issues appear here." />
      )}

      {rows.length > 0 && (
        <RecordTable
          rows={rows}
          deleteTable="issues"
          deleteLabel="issue"
          columns={[
            { key: "date", header: "Reported", cell: (r) => r.reported_on },
            { key: "title", header: "Issue", cell: (r) => r.title },
            { key: "category", header: "Category", cell: (r) => r.category ?? "—" },
            {
              key: "priority",
              header: "Priority",
              cell: (r) => <StatusBadge value={r.priority} />,
            },
            { key: "status", header: "Status", cell: (r) => <StatusBadge value={r.status} /> },
            {
              key: "actions",
              header: "",
              className: "text-right",
              cell: (r) =>
                r.status === "closed" ? null : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={advance.isPending}
                    onClick={() => advance.mutate(r as Issue)}
                  >
                    {r.status === "open"
                      ? "Start"
                      : r.status === "in_progress"
                        ? "Resolve"
                        : "Close"}
                  </Button>
                ),
            },
          ]}
        />
      )}
    </>
  );
}
