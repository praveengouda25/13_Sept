import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, BedDouble, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PageHeader,
  LoadingState,
  ErrorState,
  EmptyState,
  StatCard,
} from "@/components/data/states";
import { StatusBadge } from "@/components/data/record-table";
import { StudentAvatar } from "@/components/data/photo-field";
import { StudentIdCard } from "@/components/students/id-card";
import { useSession } from "@/hooks/use-session";
import {
  getStudentDetail,
  listAvailableBeds,
  allocateBed,
  vacateBed,
} from "@/lib/modules.functions";

export const Route = createFileRoute("/_authenticated/students/$studentId")({
  head: () => ({
    meta: [
      { title: "Student profile | VISTARX Hostel360" },
      {
        name: "description",
        content:
          "Complete student profile: photo, printable ID card, bed allocation, and the full hostel timeline of admission, leave, attendance, issues and medical records.",
      },
      { property: "og:title", content: "Student profile | VISTARX Hostel360" },
      {
        property: "og:description",
        content: "Photo, ID card, bed allocation and the full hostel timeline for a student.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudentDetailPage,
});

function StudentDetailPage() {
  const { studentId } = Route.useParams();
  const { branchId } = useSession();
  const qc = useQueryClient();
  const [bedId, setBedId] = useState("");

  const fetchDetail = useServerFn(getStudentDetail);
  const fetchBeds = useServerFn(listAvailableBeds);
  const doAllocate = useServerFn(allocateBed);
  const doVacate = useServerFn(vacateBed);

  const { data, error, isPending, isError, refetch } = useQuery({
    queryKey: ["student-detail", studentId],
    queryFn: () => fetchDetail({ data: { studentId } }),
  });

  const beds = useQuery({
    queryKey: ["available-beds", branchId],
    queryFn: () => fetchBeds({ data: { branchId } }),
  });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["student-detail", studentId] });
    void qc.invalidateQueries({ queryKey: ["available-beds"] });
    void qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
  };

  const allocateMut = useMutation({
    mutationFn: () => doAllocate({ data: { studentId, bedId } }),
    onSuccess: () => {
      toast.success("Bed allocated");
      setBedId("");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const vacateMut = useMutation({
    mutationFn: (allocationId: string) => doVacate({ data: { allocationId } }),
    onSuccess: () => {
      toast.success("Bed vacated");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isPending) return <LoadingState />;
  if (isError || !data) {
    return (
      <ErrorState
        message="Unable to load this student."
        details={error instanceof Error ? error.message : undefined}
        onRetry={() => void refetch()}
      />
    );
  }

  const s = data.student as Record<string, string | null>;
  const name = `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim();
  const active = data.allocations.find((a) => a.status === "active") ?? null;
  const present = data.attendance.filter((a) => a.status === "present").length;
  const attendanceRate = data.attendance.length
    ? Math.round((present / data.attendance.length) * 100)
    : 0;

  return (
    <>
      <PageHeader
        title={name || "Student"}
        description={`Admission ${s.admission_number ?? "—"} · ${s.class_grade ?? "No class"}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/students">
                <ArrowLeft className="mr-1 h-4 w-4" /> Register
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-1 h-4 w-4" /> Print ID card
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Status" value={String(s.status ?? "—").replace(/_/g, " ")} tone="info" />
        <StatCard
          label="Bed"
          value={
            active
              ? `${(active.rooms as { room_number?: string } | null)?.room_number ?? "?"} · ${(active.beds as { bed_number?: string } | null)?.bed_number ?? "?"}`
              : "Unallocated"
          }
          tone="accent"
        />
        <StatCard
          label="Attendance"
          value={`${attendanceRate}%`}
          hint={`${data.attendance.length} days recorded`}
          tone="success"
        />
        <StatCard label="Medical records" value={String(data.medical.length)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <StudentAvatar path={s.photo_url} name={name} size={80} />
              <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <Field label="Gender" value={s.gender} />
                <Field label="Date of birth" value={s.date_of_birth} />
                <Field label="Blood group" value={s.blood_group} />
                <Field label="Phone" value={s.phone} />
                <Field label="Email" value={s.email} />
                <Field label="Admitted" value={s.admission_date} />
                <div className="col-span-2">
                  <Field label="Address" value={s.address} />
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <BedDouble className="h-4 w-4 text-accent" /> Hostel bed allocation
              </CardTitle>
              <CardDescription>
                {active
                  ? `Currently in ${(active.hostels as { name?: string } | null)?.name ?? "hostel"}. Choosing another bed transfers the student.`
                  : "Pick a free bed to allocate this student."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-2">
              <Select value={bedId} onValueChange={setBedId}>
                <SelectTrigger className="w-full sm:w-96">
                  <SelectValue placeholder="Select an available bed" />
                </SelectTrigger>
                <SelectContent>
                  {(beds.data?.beds ?? []).map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                disabled={!bedId || allocateMut.isPending}
                onClick={() => allocateMut.mutate()}
              >
                {active ? "Transfer" : "Allocate"}
              </Button>
              {active ? (
                <Button
                  variant="outline"
                  disabled={vacateMut.isPending}
                  onClick={() => vacateMut.mutate(active.id)}
                >
                  Vacate
                </Button>
              ) : null}
              {beds.data && beds.data.beds.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No free beds in this branch — add rooms or vacate a bed first.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">History</CardTitle>
              <CardDescription>Permanent record — nothing is deleted.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="timeline">
                <TabsList>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="allocations">Beds</TabsTrigger>
                  <TabsTrigger value="leave">Leave</TabsTrigger>
                  <TabsTrigger value="medical">Medical</TabsTrigger>
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                </TabsList>

                <TabsContent value="timeline" className="pt-4">
                  {data.timeline.length === 0 ? (
                    <EmptyState
                      title="No events yet"
                      description="Activity appears here as the student moves through the hostel."
                    />
                  ) : (
                    <ol className="space-y-3 border-l border-border pl-4">
                      {data.timeline.map((e) => (
                        <li key={e.id} className="relative">
                          <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-accent" />
                          <p className="text-sm font-medium">{e.title}</p>
                          {e.description ? (
                            <p className="text-sm text-muted-foreground">{e.description}</p>
                          ) : null}
                          <p className="text-xs text-muted-foreground">
                            {new Date(e.occurred_at).toLocaleString()} ·{" "}
                            {e.event_type.replace(/_/g, " ")}
                          </p>
                        </li>
                      ))}
                    </ol>
                  )}
                </TabsContent>

                <TabsContent value="allocations" className="space-y-2 pt-4">
                  {data.allocations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Never allocated a bed.</p>
                  ) : (
                    data.allocations.map((a) => (
                      <Row
                        key={a.id}
                        title={`${(a.hostels as { name?: string } | null)?.name ?? "Hostel"} · Room ${(a.rooms as { room_number?: string } | null)?.room_number ?? "?"} · Bed ${(a.beds as { bed_number?: string } | null)?.bed_number ?? "?"}`}
                        meta={`${new Date(a.allocated_at).toLocaleDateString()}${a.vacated_at ? ` → ${new Date(a.vacated_at).toLocaleDateString()}` : ""}`}
                        status={a.status}
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="leave" className="space-y-2 pt-4">
                  {data.leaves.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No leave requests.</p>
                  ) : (
                    data.leaves.map((l) => (
                      <Row
                        key={l.id}
                        title={l.reason}
                        meta={`${l.from_date} → ${l.to_date}`}
                        status={l.status}
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="medical" className="space-y-2 pt-4">
                  {data.medical.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No medical records.</p>
                  ) : (
                    data.medical.map((m) => (
                      <Row
                        key={m.id}
                        title={m.title}
                        meta={`${m.occurred_on} · ${m.record_type.replace(/_/g, " ")}${m.doctor_name ? ` · ${m.doctor_name}` : ""}`}
                        status={m.is_critical ? "critical" : null}
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="attendance" className="pt-4">
                  {data.attendance.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No attendance marked yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {data.attendance.map((a) => (
                        <Badge
                          key={a.attendance_date}
                          variant="outline"
                          className="font-mono text-[10px]"
                          title={a.status}
                        >
                          {a.attendance_date.slice(5)} · {a.status.slice(0, 3)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="print-only-card">
          <StudentIdCard
            student={{
              id: studentId,
              admission_number: s.admission_number ?? "—",
              first_name: s.first_name ?? "",
              last_name: s.last_name ?? null,
              class_grade: s.class_grade ?? null,
              blood_group: s.blood_group ?? null,
              phone: s.phone ?? null,
              photo_url: s.photo_url ?? null,
            }}
          />
        </div>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value || "—"}</dd>
    </div>
  );
}

function Row({ title, meta, status }: { title: string; meta: string; status?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-border p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{meta}</p>
      </div>
      {status ? <StatusBadge value={status} /> : null}
    </div>
  );
}
