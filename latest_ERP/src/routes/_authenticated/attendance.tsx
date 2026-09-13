import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  LoadingState,
  ErrorState,
  EmptyState,
  StatCard,
} from "@/components/data/states";
import { RecordTable, StatusBadge } from "@/components/data/record-table";
import { useSession } from "@/hooks/use-session";
import { listAttendance, listStudents, markAttendance } from "@/lib/operations.functions";

export const Route = createFileRoute("/_authenticated/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance | VISTARX Hostel360" },
      {
        name: "description",
        content:
          "Mark daily hostel attendance as present, absent, late or on leave and track history.",
      },
      { property: "og:title", content: "Attendance | VISTARX Hostel360" },
      {
        property: "og:description",
        content:
          "Mark daily hostel attendance as present, absent, late or on leave and track history.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AttendancePage,
});

const OPTIONS = ["present", "absent", "late", "leave"] as const;

function AttendancePage() {
  const { branchId } = useSession();
  const qc = useQueryClient();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const fetchStudents = useServerFn(listStudents);
  const fetchAttendance = useServerFn(listAttendance);
  const mark = useServerFn(markAttendance);

  const students = useQuery({
    queryKey: ["students", branchId],
    queryFn: () => fetchStudents({ data: { branchId } }),
    enabled: Boolean(branchId),
  });
  const attendance = useQuery({
    queryKey: ["attendance", branchId, date],
    queryFn: () => fetchAttendance({ data: { branchId, date } }),
    enabled: Boolean(branchId),
  });

  const markMut = useMutation({
    mutationFn: (input: {
      student_id: string;
      status: (typeof OPTIONS)[number];
      branch_id: string;
    }) => mark({ data: { ...input, attendance_date: date } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const marks = new Map((attendance.data?.records ?? []).map((r) => [r.student_id, r.status]));
  const rows = students.data?.students ?? [];
  const counts = OPTIONS.map(
    (o) => [o, [...marks.values()].filter((v) => v === o).length] as const,
  );

  return (
    <>
      <PageHeader
        title="Attendance"
        description="Daily hostel attendance register."
        actions={
          <div className="flex items-end gap-2">
            <div>
              <Label htmlFor="date" className="mb-1.5 block text-xs">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {counts.map(([label, value]) => (
          <StatCard
            key={label}
            label={label}
            value={value}
            tone={label === "absent" ? "accent" : "default"}
          />
        ))}
      </div>

      {!branchId && (
        <EmptyState title="Select a branch" description="Attendance is recorded per branch." />
      )}
      {branchId && (students.isPending || attendance.isPending) && <LoadingState />}
      {(students.isError || attendance.isError) && (
        <ErrorState
          message="Unable to load attendance records"
          details="Please check your permissions or try again."
          onRetry={() => {
            void students.refetch();
            void attendance.refetch();
          }}
        />
      )}

      {students.data && attendance.data && rows.length === 0 && (
        <EmptyState
          title="No students yet"
          description="Enrol students from Admissions to start marking attendance."
        />
      )}

      {rows.length > 0 && (
        <RecordTable
          rows={rows}
          columns={[
            {
              key: "student",
              header: "Student",
              cell: (r) => (
                <div>
                  <p className="font-medium">
                    {r.first_name} {r.last_name ?? ""}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">{r.admission_number}</p>
                </div>
              ),
            },
            { key: "class", header: "Class", cell: (r) => r.class_grade ?? "—" },
            {
              key: "status",
              header: "Marked",
              cell: (r) => <StatusBadge value={marks.get(r.id) ?? null} />,
            },
            {
              key: "actions",
              header: "Mark",
              className: "text-right",
              cell: (r) => (
                <div className="flex flex-wrap justify-end gap-1">
                  {OPTIONS.map((o) => (
                    <Button
                      key={o}
                      size="sm"
                      variant={marks.get(r.id) === o ? "default" : "outline"}
                      disabled={markMut.isPending}
                      onClick={() =>
                        markMut.mutate({ student_id: r.id, status: o, branch_id: r.branch_id })
                      }
                    >
                      {o}
                    </Button>
                  ))}
                </div>
              ),
            },
          ]}
        />
      )}
    </>
  );
}
