import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, LogOut, Check, X } from "lucide-react";
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
import { QrButton, recordUrl } from "@/components/data/qr";
import { useSession } from "@/hooks/use-session";
import {
  approveVisitor,
  checkoutVisitor,
  listVisitors,
  markVisitorEntry,
  rejectVisitor,
  saveVisitor,
} from "@/lib/ops-extra.functions";
import { listStudents } from "@/lib/operations.functions";
import { can } from "@/lib/permissions";

export const Route = createFileRoute("/_authenticated/visitors")({
  beforeLoad: ({ context }) => {
    const roles = context.roles as string[];
    if (!can(roles as any, "visitors", "view")) {
      throw redirect({
        to: "/dashboard",
        search: { error: "Access denied: Visitors module requires appropriate permissions" },
      });
    }
  },
  head: () => ({
    meta: [
      { title: "Visitor management | VISTARX Hostel360" },
      {
        name: "description",
        content:
          "Log parents, guardians and guests with entry and exit times and issue a scannable visitor pass.",
      },
      { property: "og:title", content: "Visitor management | VISTARX Hostel360" },
      {
        property: "og:description",
        content:
          "Log parents, guardians and guests with entry and exit times and a scannable visitor pass.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VisitorsPage,
});

type VisitorRow = {
  id: string;
  visitor_name: string;
  visitor_type: string;
  phone: string | null;
  id_proof: string | null;
  purpose: string | null;
  pass_code: string;
  status: string;
  entry_at: string;
  exit_at: string | null;
  student_id: string | null;
};

function VisitorsPage() {
  const { branchId, roles } = useSession();
  const canApprove = roles.some((role) => ["super_admin", "trust_admin", "branch_admin", "warden"].includes(role));
  const canEnter = canApprove || roles.includes("security_guard");
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const fetchList = useServerFn(listVisitors);
  const fetchStudents = useServerFn(listStudents);
  const save = useServerFn(saveVisitor);
  const checkout = useServerFn(checkoutVisitor);
  const approve = useServerFn(approveVisitor);
  const reject = useServerFn(rejectVisitor);
  const enter = useServerFn(markVisitorEntry);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["visitors", branchId],
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

  const createMut = useMutation({
    mutationFn: (v: FormValues) =>
      save({
        data: clean({
          branch_id: branchId!,
          visitor_name: v.visitor_name,
          visitor_type: v.visitor_type || "guest",
          phone: v.phone || null,
          id_proof: v.id_proof || null,
          purpose: v.purpose || null,
          student_id: v.student_id || null,
          notes: v.notes || null,
        }),
      }),
    onSuccess: () => {
      toast.success("Visitor checked in");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["visitors"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const outMut = useMutation({
    mutationFn: (id: string) => checkout({ data: { id } }),
    onSuccess: () => {
      toast.success("Visitor checked out");
      void qc.invalidateQueries({ queryKey: ["visitors"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const approveMut = useMutation({
    mutationFn: (id: string) => approve({ data: { id } }),
    onSuccess: () => {
      toast.success("Visitor approved");
      void qc.invalidateQueries({ queryKey: ["visitors"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rejectMut = useMutation({
    mutationFn: (id: string) => reject({ data: { id, reason: null } }),
    onSuccess: () => {
      toast.success("Visitor rejected");
      void qc.invalidateQueries({ queryKey: ["visitors"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const enterMut = useMutation({
    mutationFn: (id: string) => enter({ data: { id } }),
    onSuccess: () => {
      toast.success("Visitor entry marked");
      void qc.invalidateQueries({ queryKey: ["visitors"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (data?.visitors ?? []) as VisitorRow[];
  const inside = rows.filter((r) => ["entered", "checked_in"].includes(r.status) && !r.exit_at);

  return (
    <>
      <PageHeader
        title="Visitors"
        description="Parents, guardians, guests and vendors entering the campus."
        actions={
          <Button disabled={!branchId} onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Register visitor
          </Button>
        }
      />

      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        title="Register a visitor"
        description="A visitor pass with a scannable QR code is generated automatically."
        fields={[
          { name: "visitor_name", label: "Visitor name", type: "text", required: true },
          {
            name: "visitor_type",
            label: "Visitor type",
            type: "select",
            options: [
              { value: "parent", label: "Parent" },
              { value: "guardian", label: "Guardian" },
              { value: "guest", label: "Guest" },
              { value: "vendor", label: "Vendor" },
              { value: "official", label: "Official" },
              { value: "other", label: "Other" },
            ],
          },
          { name: "phone", label: "Phone", type: "tel" },
          { name: "id_proof", label: "ID proof", type: "text" },
          { name: "purpose", label: "Purpose", type: "text" },
          {
            name: "student_id",
            label: "Visiting student",
            type: "select",
            options: studentOptions,
          },
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
        initial={{}}
        pending={createMut.isPending}
        onSubmit={(v) => createMut.mutate(v)}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Visits logged" value={rows.length} />
        <StatCard label="Currently inside" value={inside.length} tone="accent" />
        <StatCard label="Checked out" value={rows.filter((r) => r.exit_at).length} />
      </div>

      {!branchId && (
        <EmptyState title="Select a branch" description="Visitor logs are per branch." />
      )}
      {isPending && <LoadingState />}
      {isError && (
        <ErrorState
          message="Failed to load visitors data"
          details="Check your branch permissions and try again"
          onRetry={() => void refetch()}
        />
      )}
      {data && rows.length === 0 && branchId && (
        <EmptyState
          title="No visitors yet"
          description="Check in your first visitor to start the log."
        />
      )}

      {rows.length > 0 && (
        <RecordTable
          rows={rows}
          deleteTable="visitors"
          deleteLabel="visitor record"
          columns={[
            { key: "name", header: "Visitor", cell: (r) => r.visitor_name },
            { key: "type", header: "Type", cell: (r) => r.visitor_type },
            { key: "phone", header: "Phone", cell: (r) => r.phone ?? "—" },
            { key: "purpose", header: "Purpose", cell: (r) => r.purpose ?? "—" },
            { key: "pass", header: "Pass Code", cell: (r) => r.pass_code },
            {
              key: "entry",
              header: "Entry",
              cell: (r) => new Date(r.entry_at).toLocaleString(),
            },
            {
              key: "exit",
              header: "Exit",
              cell: (r) => (r.exit_at ? new Date(r.exit_at).toLocaleString() : "—"),
            },
            {
              key: "status",
              header: "Status",
              cell: (r) => <StatusBadge value={r.status} />,
            },
            {
              key: "actions",
              header: "Actions",
              cell: (r) => (
                <div className="flex items-center gap-1">
                  {r.status === "pending" && canApprove && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={approveMut.isPending || rejectMut.isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          approveMut.mutate(r.id);
                        }}
                      >
                        <Check className="mr-1 h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={approveMut.isPending || rejectMut.isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          rejectMut.mutate(r.id);
                        }}
                      >
                        <X className="mr-1 h-3.5 w-3.5" /> Reject
                      </Button>
                    </>
                  )}
                  {r.status === "approved" && canEnter && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={enterMut.isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        enterMut.mutate(r.id);
                      }}
                    >
                      <Check className="mr-1 h-3.5 w-3.5" /> Mark Entry
                    </Button>
                  )}
                  {(r.status === "entered" || r.status === "checked_in") && !r.exit_at && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={outMut.isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        outMut.mutate(r.id);
                      }}
                    >
                      <LogOut className="mr-1 h-3.5 w-3.5" /> Out
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
        />
      )}
    </>
  );
}
