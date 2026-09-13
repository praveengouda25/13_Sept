import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
import { RecordDialog, clean, type FormValues } from "@/components/data/record-dialog";
import { useSession } from "@/hooks/use-session";
import { listComplaints, saveComplaint } from "@/lib/ops-extra.functions";
import { listStudents } from "@/lib/operations.functions";

export const Route = createFileRoute("/_authenticated/complaints")({
  head: () => ({
    meta: [
      { title: "Complaints | VISTARX Hostel360" },
      {
        name: "description",
        content:
          "Student complaints with category, priority, assignment and resolution tracking for every hostel branch.",
      },
      { property: "og:title", content: "Complaints | VISTARX Hostel360" },
      {
        property: "og:description",
        content: "Student complaints with priority, assignment and resolution tracking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComplaintsPage,
});

type Row = {
  id: string;
  title: string;
  category: string | null;
  priority: string;
  status: string;
  reported_on: string;
  student_id: string | null;
  description: string | null;
  resolution_notes: string | null;
};

function ComplaintsPage() {
  const { branchId } = useSession();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);

  const fetchList = useServerFn(listComplaints);
  const fetchStudents = useServerFn(listStudents);
  const save = useServerFn(saveComplaint);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["complaints", branchId],
    queryFn: () => fetchList({ data: { branchId } }),
  });
  const students = useQuery({
    queryKey: ["students", branchId],
    queryFn: () => fetchStudents({ data: { branchId } }),
  });

  const studentOptions = useMemo(
    () =>
      (students.data?.students ?? []).map((s) => ({
        value: s.id,
        label: `${s.first_name} ${s.last_name ?? ""} (${s.admission_number})`.trim(),
      })),
    [students.data],
  );

  const mut = useMutation({
    mutationFn: (v: FormValues) =>
      save({
        data: clean({
          id: editing?.id,
          branch_id: branchId!,
          student_id: v.student_id || null,
          title: v.title,
          category: v.category || "other",
          description: v.description || null,
          priority: (v.priority || "medium") as never,
          status: (v.status || "open") as never,
          resolution_notes: v.resolution_notes || null,
        }),
      }),
    onSuccess: () => {
      toast.success(editing ? "Complaint updated" : "Complaint logged");
      setOpen(false);
      setEditing(null);
      void qc.invalidateQueries({ queryKey: ["complaints"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (data?.complaints ?? []) as Row[];
  const stats = data?.stats;

  return (
    <>
      <PageHeader
        title="Complaints"
        description="Student-raised complaints with escalation and resolution tracking."
        actions={
          <Button
            disabled={!branchId}
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="mr-1 h-4 w-4" /> Log complaint
          </Button>
        }
      />

      <RecordDialog
        key={editing?.id ?? "new"}
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditing(null);
        }}
        title={editing ? "Update complaint" : "Log a complaint"}
        description="Track the issue from report through to resolution."
        fields={[
          { name: "title", label: "Title", type: "text", required: true },
          { name: "student_id", label: "Student", type: "select", options: studentOptions },
          {
            name: "category",
            label: "Category",
            type: "select",
            options: ["food", "cleanliness", "facility", "staff", "ragging", "safety", "other"].map(
              (v) => ({ value: v, label: v }),
            ),
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
            options: ["open", "assigned", "in_progress", "resolved", "closed"].map((v) => ({
              value: v,
              label: v,
            })),
          },
          { name: "description", label: "Description", type: "textarea" },
          { name: "resolution_notes", label: "Resolution notes", type: "textarea" },
        ]}
        initial={
          editing
            ? {
                title: editing.title,
                student_id: editing.student_id ?? "",
                category: editing.category ?? "other",
                priority: editing.priority,
                status: editing.status,
                description: editing.description ?? "",
                resolution_notes: editing.resolution_notes ?? "",
              }
            : { priority: "medium", status: "open", category: "other" }
        }
        pending={mut.isPending}
        onSubmit={(v) => mut.mutate(v)}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Total" value={stats?.total ?? 0} />
        <StatCard label="Pending" value={stats?.pending ?? 0} tone="accent" />
        <StatCard label="Resolved" value={stats?.resolved ?? 0} tone="success" />
        <StatCard
          label="Avg resolution"
          value={`${stats?.avgResolutionHours ?? 0} h`}
          tone="info"
        />
      </div>

      {!branchId && (
        <EmptyState title="Select a branch" description="Complaints are tracked per branch." />
      )}
      {isPending && <LoadingState />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {data && rows.length === 0 && branchId && (
        <EmptyState title="No complaints" description="Nothing has been reported yet." />
      )}

      {rows.length > 0 && (
        <RecordTable
          rows={rows}
          deleteTable="complaints"
          deleteLabel="complaint"
          onRowClick={(r) => {
            setEditing(r);
            setOpen(true);
          }}
          columns={[
            { key: "title", header: "Complaint", cell: (r) => r.title },
            { key: "category", header: "Category", cell: (r) => r.category ?? "—" },
            {
              key: "priority",
              header: "Priority",
              cell: (r) => <StatusBadge value={r.priority} />,
            },
            { key: "status", header: "Status", cell: (r) => <StatusBadge value={r.status} /> },
            { key: "reported", header: "Reported", cell: (r) => r.reported_on },
          ]}
        />
      )}
    </>
  );
}
