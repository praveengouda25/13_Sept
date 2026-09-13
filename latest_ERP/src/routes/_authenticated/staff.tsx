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
import { RecordDialog, clean, type FormValues } from "@/components/data/record-dialog";
import { useSession } from "@/hooks/use-session";
import { listStaff, saveStaff } from "@/lib/operations.functions";
import { can } from "@/lib/permissions";

export const Route = createFileRoute("/_authenticated/staff")({
  beforeLoad: ({ context }) => {
    const roles = context.roles as string[];
    if (!can(roles as any, "users", "view")) {
      throw new Error("Access denied: Staff module requires appropriate permissions");
    }
  },
  head: () => ({
    meta: [
      { title: "Staff directory | VISTARX Hostel360" },
      {
        name: "description",
        content:
          "Maintain wardens, teachers and support staff with designations, contacts and status.",
      },
      { property: "og:title", content: "Staff directory | VISTARX Hostel360" },
      {
        property: "og:description",
        content:
          "Maintain wardens, teachers and support staff with designations, contacts and status.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StaffPage,
});

function StaffPage() {
  const { branchId } = useSession();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const fetchList = useServerFn(listStaff);
  const save = useServerFn(saveStaff);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["staff", branchId],
    queryFn: () => fetchList({ data: { branchId } }),
  });

  const createMut = useMutation({
    mutationFn: (v: FormValues) =>
      save({
        data: clean({
          branch_id: branchId!,
          full_name: v.full_name,
          designation: v.designation || null,
          department: v.department || null,
          email: v.email || null,
          phone: v.phone || null,
          joined_on: v.joined_on || null,
          status: (v.status || "active") as never,
          notes: v.notes || null,
        }),
      }),
    onSuccess: () => {
      toast.success("Staff member saved");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["staff"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = data?.staff ?? [];

  return (
    <>
      <PageHeader
        title="Staff"
        description="Wardens, teachers, cooks and support staff working across the hostels."
        actions={
          <Button disabled={!branchId} onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Add staff
          </Button>
        }
      />

      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        title="Add staff member"
        fields={[
          { name: "full_name", label: "Full name", type: "text", required: true },
          { name: "designation", label: "Designation", type: "text" },
          { name: "department", label: "Department", type: "text" },
          { name: "phone", label: "Phone", type: "tel" },
          { name: "email", label: "Email", type: "email" },
          { name: "joined_on", label: "Joined on", type: "date" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: ["active", "on_leave", "inactive"].map((v) => ({
              value: v,
              label: v.replace(/_/g, " "),
            })),
          },
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
        initial={{ status: "active" }}
        pending={createMut.isPending}
        onSubmit={(v) => createMut.mutate(v)}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Staff" value={rows.length} />
        <StatCard label="Active" value={rows.filter((r) => r.status === "active").length} />
        <StatCard label="On leave" value={rows.filter((r) => r.status === "on_leave").length} />
      </div>

      {!branchId && (
        <EmptyState title="Select a branch" description="Staff records are per branch." />
      )}
      {isPending && <LoadingState />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {data && rows.length === 0 && (
        <EmptyState title="No staff yet" description="Add your team to the directory." />
      )}

      {rows.length > 0 && (
        <RecordTable
          rows={rows}
          deleteTable="staff"
          deleteLabel="staff record"
          columns={[
            { key: "name", header: "Name", cell: (r) => r.full_name },
            { key: "designation", header: "Designation", cell: (r) => r.designation ?? "—" },
            { key: "department", header: "Department", cell: (r) => r.department ?? "—" },
            { key: "phone", header: "Phone", cell: (r) => r.phone ?? "—" },
            { key: "joined", header: "Joined", cell: (r) => r.joined_on ?? "—" },
            { key: "status", header: "Status", cell: (r) => <StatusBadge value={r.status} /> },
          ]}
        />
      )}
    </>
  );
}
