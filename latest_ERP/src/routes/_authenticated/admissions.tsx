import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, LoadingState, ErrorState, EmptyState } from "@/components/data/states";
import { RecordTable, StatusBadge } from "@/components/data/record-table";
import { RecordDialog, clean, type FormValues } from "@/components/data/record-dialog";
import { useSession } from "@/hooks/use-session";
import { listAdmissions, saveAdmission, enrolAdmission } from "@/lib/operations.functions";
import { deleteRecord } from "@/lib/ops-extra.functions";
import { listHostels } from "@/lib/foundation.functions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admissions")({
  head: () => ({
    meta: [
      { title: "Admissions | VISTARX Hostel360" },
      {
        name: "description",
        content:
          "Review hostel applications, approve applicants and enrol them into the student register in one click.",
      },
      { property: "og:title", content: "Admissions | VISTARX Hostel360" },
      {
        property: "og:description",
        content:
          "Review hostel applications, approve applicants and enrol them into the student register in one click.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdmissionsPage,
});

const STATUSES = ["draft", "submitted", "under_review", "approved", "rejected", "enrolled"];

function AdmissionsPage() {
  const { session, roles, branchId } = useSession();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>(branchId ?? "");
  const [selectedHostel, setSelectedHostel] = useState<string>("");

  const fetchList = useServerFn(listAdmissions);
  const save = useServerFn(saveAdmission);
  const enrol = useServerFn(enrolAdmission);
  const remove = useServerFn(deleteRecord);
  const fetchHostels = useServerFn(listHostels);

  const { data: hostelsData } = useQuery({
    queryKey: ["hostels", selectedBranch],
    queryFn: () => fetchHostels({ data: { branchId: selectedBranch } }),
    enabled: !!selectedBranch,
  });

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["admissions", branchId],
    queryFn: () => fetchList({ data: { branchId } }),
  });

  const createMut = useMutation({
    mutationFn: (values: FormValues) =>
      save({
        data: clean({
          branch_id: values.branch_id || branchId!,
          applicant_name: values.applicant_name,
          gender: (values.gender || null) as "male" | "female" | "other" | null,
          date_of_birth: values.date_of_birth || null,
          guardian_name: values.guardian_name || null,
          guardian_phone: values.guardian_phone || null,
          status: (values.status || "submitted") as never,
          remarks: values.remarks || null,
        }),
      }),
    onSuccess: () => {
      toast.success("Application saved");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["admissions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const enrolMut = useMutation({
    mutationFn: (id: string) => enrol({ data: { id } }),
    onSuccess: () => {
      toast.success("Applicant enrolled as a student");
      void qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { table: "admissions", id } }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admissions"] }),
  });

  const rows = useMemo(() => data?.admissions ?? [], [data]);

  return (
    <>
      <PageHeader
        title="Admissions"
        description="Applications, review workflow and enrolment into the student register."
        actions={
          <Button disabled={!branchId} onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> New application
          </Button>
        }
      />

      <RecordDialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) {
            setSelectedBranch(branchId ?? "");
            setSelectedHostel("");
          }
        }}
        title="New admission application"
        fields={[
          {
            name: "branch_id",
            label: "Branch",
            type: "custom" as const,
            required: true,
            render: ({ value, onChange }) => (
              <Select
                value={value}
                onValueChange={(v) => {
                  onChange(v);
                  setSelectedBranch(v);
                  setSelectedHostel("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {session.branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ),
          },
          {
            name: "hostel_id",
            label: "Hostel",
            type: "custom" as const,
            render: ({ value, onChange }) => (
              <Select
                value={value}
                onValueChange={(v) => {
                  onChange(v);
                  setSelectedHostel(v);
                }}
                disabled={!selectedBranch}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={selectedBranch ? "Select hostel" : "Select branch first"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {hostelsData?.hostels?.map((h: { id: string; name: string }) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ),
          },
          { name: "applicant_name", label: "Applicant name", type: "text", required: true },
          {
            name: "gender",
            label: "Gender",
            type: "select",
            options: ["male", "female", "other"].map((v) => ({ value: v, label: v })),
          },
          { name: "date_of_birth", label: "Date of birth", type: "date" },
          { name: "guardian_name", label: "Guardian name", type: "text" },
          { name: "guardian_phone", label: "Guardian phone", type: "tel" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: STATUSES.map((v) => ({ value: v, label: v.replace(/_/g, " ") })),
          },
          { name: "remarks", label: "Remarks", type: "textarea" },
        ]}
        initial={{ branch_id: branchId ?? "", status: "submitted" }}
        pending={createMut.isPending}
        onSubmit={(v) => createMut.mutate(v)}
      />

      {!branchId && (
        <EmptyState
          title="Select a branch"
          description="Admissions are scoped to a branch. Pick one from the branch switcher above."
        />
      )}
      {isPending && <LoadingState />}
      {isError && (
        <ErrorState
          message="Failed to load admissions"
          details="Check your branch permissions and try again"
          onRetry={() => void refetch()}
        />
      )}

      {data && rows.length === 0 && (
        <EmptyState
          title="No applications yet"
          description="New admission enquiries appear here."
        />
      )}

      {rows.length > 0 && (
        <RecordTable
          rows={rows}
          columns={[
            { key: "name", header: "Applicant", cell: (r) => r.applicant_name },
            { key: "guardian", header: "Guardian", cell: (r) => r.guardian_name ?? "—" },
            { key: "phone", header: "Phone", cell: (r) => r.guardian_phone ?? "—" },
            { key: "status", header: "Status", cell: (r) => <StatusBadge value={r.status} /> },
            {
              key: "created",
              header: "Received",
              cell: (r) => new Date(r.created_at).toLocaleDateString(),
            },
            {
              key: "action",
              header: "",
              className: "text-right",
              cell: (r) =>
                r.student_id ? (
                  <span className="text-xs text-muted-foreground">Enrolled</span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={enrolMut.isPending}
                    onClick={() => enrolMut.mutate(r.id)}
                  >
                    Enrol
                  </Button>
                ),
            },
          ]}
          onDelete={roles.some((role) => ["super_admin", "trust_admin", "branch_admin"].includes(role)) ? async (row) => {
            await deleteMut.mutateAsync(row.id);
          } : undefined}
          deleteLabel="admission"
        />
      )}
    </>
  );
}
