import type { FieldSpec } from "@/components/data/record-dialog";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Plus,
  ArrowRightLeft,
  CheckCircle,
  Clock,
  User,
  MapPin,
  Calendar,
  Phone,
  Shield,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { deleteRecord, listGatePasses, saveGatePass } from "@/lib/ops-extra.functions";
import { listStudents } from "@/lib/operations.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { can } from "@/lib/permissions";

export const Route = createFileRoute("/_authenticated/gate-pass")({
  beforeLoad: ({ context }) => {
    const roles = context.roles as string[];
    if (!can(roles as any, "gatepass", "view")) {
      throw redirect({
        to: "/dashboard",
        search: { error: "Access denied: Gate Pass module requires appropriate permissions" },
      });
    }
  },
  head: () => ({
    meta: [
      { title: "Student Gate Pass | VISTARX Hostel360" },
      {
        name: "description",
        content:
          "Track student in/out movements with gate passes, QR codes and return time monitoring.",
      },
      { property: "og:title", content: "Student Gate Pass | VISTARX Hostel360" },
      {
        property: "og:description",
        content:
          "Track student in/out movements with gate passes, QR codes and return time monitoring.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GatePassPage,
});

type GatePassRow = {
  id: string;
  student_id: string;
  purpose: string;
  destination?: string | null;
  out_time: string;
  expected_return_time: string | null;
  actual_return_time: string | null;
  actual_exit_time?: string | null;
  status: string;
  is_late_return?: boolean;
  remarks: string | null;
  parent_contact?: string | null;
  emergency_contact?: string | null;
  students?: {
    first_name: string;
    last_name: string | null;
    admission_number: string;
    photo_url?: string | null;
  };
};

const FIELDS: FieldSpec[] = [
  {
    name: "student_id",
    label: "Student",
    type: "select" as const,
    required: true,
    section: "Gate Pass Details",
  },
  {
    name: "purpose",
    label: "Purpose",
    type: "text" as const,
    required: true,
    section: "Gate Pass Details",
  },
  {
    name: "destination",
    label: "Destination",
    type: "text" as const,
    section: "Gate Pass Details",
  },
  {
    name: "out_time",
    label: "Out Time",
    type: "datetime-local" as const,
    required: true,
    section: "Gate Pass Details",
  },
  {
    name: "expected_return_time",
    label: "Expected Return",
    type: "datetime-local" as const,
    section: "Gate Pass Details",
  },
  {
    name: "parent_contact",
    label: "Parent/Guardian Contact",
    type: "text" as const,
    section: "Emergency Contact",
  },
  {
    name: "emergency_contact",
    label: "Emergency Contact",
    type: "text" as const,
    section: "Emergency Contact",
  },
  { name: "remarks", label: "Remarks", type: "textarea" as const, section: "Additional Info" },
];

function GatePassPage() {
  const { branchId, roles } = useSession();
  const canApprove = roles.some((role) => ["super_admin", "trust_admin", "branch_admin", "warden"].includes(role));
  const canDelete = roles.some((role) => ["super_admin", "trust_admin", "branch_admin"].includes(role));
  const isSecurity = roles.includes("security_guard") && !canApprove;
  const canCreate = can(roles, "gatepass", "create") && !isSecurity;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GatePassRow | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");

  const fetchList = useServerFn(listGatePasses);
  const fetchStudents = useServerFn(listStudents);
  const save = useServerFn(saveGatePass);
  const remove = useServerFn(deleteRecord);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["gate-passes", branchId],
    queryFn: () => fetchList({ data: { branchId } }),
    enabled: Boolean(branchId),
  });

  const { data: studentsData } = useQuery({
    queryKey: ["students", branchId],
    queryFn: () => fetchStudents({ data: { branchId } }),
    enabled: Boolean(branchId),
  });

  const studentOptions =
    studentsData?.students?.map(
      (s: {
        id: string;
        admission_number: string;
        first_name: string;
        last_name?: string | null;
      }) => ({
        value: s.id,
        label: `${s.admission_number} - ${s.first_name} ${s.last_name || ""}`,
      }),
    ) || [];

  const saveMut = useMutation({
    mutationFn: (v: FormValues) =>
      save({
        data: clean({
          id: editing?.id,
          branch_id: branchId!,
          student_id: v.student_id,
          purpose: v.purpose,
          destination: v.destination || null,
          out_time: v.out_time,
          expected_return_time: v.expected_return_time || null,
          parent_contact: v.parent_contact || null,
          emergency_contact: v.emergency_contact || null,
          remarks: v.remarks || null,
          status: editing?.status || "pending",
        }),
      }),
    onSuccess: () => {
      toast.success(editing ? "Gate pass updated" : "Gate pass created");
      setOpen(false);
      setEditing(null);
      void qc.invalidateQueries({ queryKey: ["gate-passes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const approveMut = useMutation({
    mutationFn: (id: string) =>
      save({
        data: { id, status: "approved" },
      }),
    onSuccess: () => {
      toast.success("Gate pass approved");
      void qc.invalidateQueries({ queryKey: ["gate-passes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const markExitMut = useMutation({
    mutationFn: (id: string) =>
      save({
        data: { id, status: "out", actual_exit_time: new Date().toISOString() },
      }),
    onSuccess: () => {
      toast.success("Student marked as exited");
      void qc.invalidateQueries({ queryKey: ["gate-passes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const markReturnMut = useMutation({
    mutationFn: (id: string) =>
      save({
        data: { id, status: "returned", actual_return_time: new Date().toISOString() },
      }),
    onSuccess: () => {
      toast.success("Student marked as returned");
      void qc.invalidateQueries({ queryKey: ["gate-passes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rejectMut = useMutation({
    mutationFn: (id: string) =>
      save({
        data: { id, status: "rejected" },
      }),
    onSuccess: () => {
      toast.success("Gate pass rejected");
      void qc.invalidateQueries({ queryKey: ["gate-passes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { table: "student_gate_passes", id } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["gate-passes"] });
    },
  });

  const closeMut = useMutation({
    mutationFn: (id: string) => save({ data: { id, status: "closed" } }),
    onSuccess: () => {
      toast.success("Gate pass closed");
      void qc.invalidateQueries({ queryKey: ["gate-passes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (data?.gatePasses ?? []) as GatePassRow[];

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(row: GatePassRow) {
    setEditing(row);
    setOpen(true);
  }

  const initial: FormValues = editing
    ? {
        student_id: editing.student_id,
        purpose: editing.purpose,
        destination: editing.destination || "",
        out_time: editing.out_time,
        expected_return_time: editing.expected_return_time || "",
        parent_contact: editing.parent_contact || "",
        emergency_contact: editing.emergency_contact || "",
        remarks: editing.remarks || "",
      }
    : { out_time: new Date().toISOString().slice(0, 16), purpose: "" };

  const stats = {
    total: rows.length,
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
    out: rows.filter((r) => r.status === "out").length,
    returned: rows.filter((r) => r.status === "returned").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
    lateReturns: rows.filter((r) => r.is_late_return === true).length,
  };

  const getTabRows = (tab: string) => {
    const tabRows = tab === "all" ? rows : rows.filter((r) => r.status === tab);
    return tabRows.filter((row) => {
      const needle = searchTerm.toLowerCase();
      const matchesSearch =
        !needle ||
        row.students?.first_name.toLowerCase().includes(needle) ||
        row.students?.last_name?.toLowerCase().includes(needle) ||
        row.students?.admission_number.toLowerCase().includes(needle) ||
        row.purpose.toLowerCase().includes(needle);
      return matchesSearch && (statusFilter === "all" || row.status === statusFilter);
    });
  };

  return (
    <>
      <PageHeader
        title="Gate Pass Management"
        description="Professional gate pass system for tracking student movements with approval workflow and security verification."
        actions={
          <Button disabled={!branchId || !canCreate} onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" /> New Gate Pass
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Passes" value={stats.total} tone="info" icon={Shield} />
        <StatCard label="Pending Approval" value={stats.pending} tone="warning" icon={Clock} />
        <StatCard label="Students Outside" value={stats.out} tone="warning" icon={ArrowRightLeft} />
        <StatCard label="Returned" value={stats.returned} tone="success" icon={CheckCircle} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Accepted" value={stats.approved} tone="success" icon={CheckCircle} />
        <StatCard label="Rejected" value={stats.rejected} tone="destructive" icon={Clock} />
        <StatCard label="Late Returns" value={stats.lateReturns} tone="accent" icon={Clock} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Gate Pass Status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {[
            ["pending", "Pending"],
            ["approved", "Accepted"],
            ["out", "Exited / Currently Out"],
            ["returned", "Returned"],
            ["closed", "Closed"],
            ["rejected", "Rejected"],
          ].map(([value, label]) => (
            <Badge key={value} variant="outline" className="cursor-pointer" onClick={() => setStatusFilter(value)}>
              {label}: {rows.filter((row) => row.status === value).length}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setStatusFilter("all")}>
            All Passes
          </Button>
          <Button variant="outline" size="sm" onClick={() => setStatusFilter("pending")}>
            Pending Approval
          </Button>
          <Button variant="outline" size="sm" onClick={() => setStatusFilter("out")}>
            Currently Out
          </Button>
          <Button variant="outline" size="sm" onClick={() => setStatusFilter("returned")}>
            Returned
          </Button>
        </CardContent>
      </Card>

      <RecordDialog
        key={editing?.id ?? "new"}
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setEditing(null);
        }}
        title={editing ? "Edit Gate Pass" : "Create Gate Pass"}
        description="Issue a gate pass for student movement tracking."
        fields={FIELDS.map((f) =>
          f.name === "student_id" ? { ...f, options: studentOptions } : f,
        )}
        initial={initial}
        pending={saveMut.isPending}
        onSubmit={(v) => saveMut.mutate(v)}
      />

      {!branchId && (
        <EmptyState title="Select a branch" description="Gate passes are per branch." />
      )}
      {isPending && <LoadingState />}
      {isError && (
        <ErrorState
          message="Failed to load gate passes"
          details="Check your branch permissions and try again"
          onRetry={() => void refetch()}
        />
      )}
      {branchId && data && rows.length === 0 && (
        <EmptyState
          title="No gate passes"
          description="Create a gate pass to start tracking student movements."
        />
      )}

      {rows.length > 0 && (
        <>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name, admission number, or purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Filter className="h-4 w-4 text-muted-foreground mt-2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="out">Out</option>
                <option value="returned">Returned</option>
                <option value="rejected">Rejected</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Passes</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Accepted</TabsTrigger>
              <TabsTrigger value="out">Currently Out</TabsTrigger>
              <TabsTrigger value="returned">Returned</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <RecordTable
                rows={getTabRows(activeTab)}
                onRowClick={openEdit}
                columns={[
                  {
                    key: "student",
                    header: "Student",
                    cell: (r) =>
                      r.students
                        ? `${r.students.admission_number} - ${r.students.first_name} ${r.students.last_name ?? ""}`
                        : "—",
                  },
                  { key: "purpose", header: "Purpose", cell: (r) => r.purpose },
                  { key: "destination", header: "Destination", cell: (r) => r.destination || "—" },
                  {
                    key: "out",
                    header: "Out Time",
                    cell: (r) => new Date(r.out_time).toLocaleString(),
                  },
                  {
                    key: "expected",
                    header: "Expected Return",
                    cell: (r) =>
                      r.expected_return_time
                        ? new Date(r.expected_return_time).toLocaleString()
                        : "—",
                  },
                  {
                    key: "status",
                    header: "Status",
                    cell: (r) => <StatusBadge value={r.status === "approved" ? "accepted" : r.status} />,
                  },
                  {
                    key: "accepted",
                    header: "Accepted",
                    cell: (r) => {
                      const pending = approveMut.isPending && approveMut.variables === r.id;
                      const disabled = pending || approveMut.isPending || rejectMut.isPending || markExitMut.isPending;
                      if (r.status !== "pending" || !canApprove) return <span className="text-muted-foreground">-</span>;
                      return (
                        <Button
                          size="sm"
                          disabled={disabled}
                          onClick={(event) => {
                            event.stopPropagation();
                            approveMut.mutate(r.id);
                          }}
                        >
                          {pending ? "Saving..." : "Accepted"}
                        </Button>
                      );
                    },
                  },
                  {
                    key: "rejected",
                    header: "Rejected",
                    cell: (r) => {
                      const pending = rejectMut.isPending && rejectMut.variables === r.id;
                      const disabled = pending || approveMut.isPending || rejectMut.isPending || markExitMut.isPending;
                      if (r.status !== "pending" || !canApprove) return <span className="text-muted-foreground">-</span>;
                      return (
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={disabled}
                          onClick={(event) => {
                            event.stopPropagation();
                            rejectMut.mutate(r.id);
                          }}
                        >
                          {pending ? "Saving..." : "Rejected"}
                        </Button>
                      );
                    },
                  },
                  {
                    key: "mark-exit",
                    header: "Mark Exit",
                    cell: (r) => {
                      const pending = markExitMut.isPending && markExitMut.variables === r.id;
                      const disabled =
                        pending ||
                        !isSecurity && !canApprove ||
                        approveMut.isPending ||
                        rejectMut.isPending ||
                        markExitMut.isPending;
                      if (r.status !== "approved") return <span className="text-muted-foreground">-</span>;
                      return (
                        <Button
                          size="sm"
                          disabled={disabled}
                          onClick={(event) => {
                            event.stopPropagation();
                            markExitMut.mutate(r.id);
                          }}
                        >
                          {pending ? "Saving..." : "Mark Exit"}
                        </Button>
                      );
                    },
                  },
                  {
                    key: "actions",
                    header: "Details",
                    cell: (r) => (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEdit(r);
                        }}
                      >
                        Details
                      </Button>
                    ),
                  },
                  {
                    key: "qr",
                    header: "QR",
                    cell: (r) => (
                      <QrButton
                        value={recordUrl(`/gate-pass?pass=${r.id}`)}
                        title="Gate Pass QR"
                        subtitle={r.purpose}
                      />
                    ),
                  },
                ]}
                onDelete={canDelete ? async (row) => {
                  await deleteMut.mutateAsync(row.id);
                } : undefined}
                deleteLabel="gate pass"
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </>
  );
}
