import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  listMedicalRecords,
  saveMedicalRecord,
  listMedicines,
  saveMedicine,
} from "@/lib/modules.functions";
import { listStudents } from "@/lib/operations.functions";

export const Route = createFileRoute("/_authenticated/medical")({
  head: () => ({
    meta: [
      { title: "Medical module | VISTARX Hostel360" },
      {
        name: "description",
        content:
          "Student medical history, doctor visits, vaccinations, emergency records and medicine stock.",
      },
      { property: "og:title", content: "Medical module | VISTARX Hostel360" },
      {
        property: "og:description",
        content:
          "Student medical history, doctor visits, vaccinations, emergency records and medicine stock.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MedicalPage,
});

type MedRow = {
  id: string;
  student_id: string;
  record_type: string;
  title: string;
  doctor_name: string | null;
  hospital: string | null;
  medicine: string | null;
  occurred_on: string;
  next_due_on: string | null;
  is_critical: boolean;
};

type MedicineRow = {
  id: string;
  name: string;
  category: string | null;
  unit: string;
  quantity: number;
  min_quantity: number;
  expiry_date: string | null;
};

function MedicalPage() {
  const { branchId } = useSession();
  const qc = useQueryClient();
  const [recordOpen, setRecordOpen] = useState(false);
  const [medicineOpen, setMedicineOpen] = useState(false);

  const fetchRecords = useServerFn(listMedicalRecords);
  const fetchMedicines = useServerFn(listMedicines);
  const fetchStudents = useServerFn(listStudents);
  const saveRecord = useServerFn(saveMedicalRecord);
  const saveMed = useServerFn(saveMedicine);

  const records = useQuery({
    queryKey: ["medical-records", branchId],
    queryFn: () => fetchRecords({ data: { branchId } }),
  });
  const medicines = useQuery({
    queryKey: ["medicines", branchId],
    queryFn: () => fetchMedicines({ data: { branchId } }),
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
  const studentName = (id: string) => studentOptions.find((o) => o.value === id)?.label ?? "—";

  const recordMut = useMutation({
    mutationFn: (v: FormValues) =>
      saveRecord({
        data: clean({
          branch_id: branchId!,
          student_id: v.student_id,
          record_type: (v.record_type || "history") as never,
          title: v.title,
          description: v.description || null,
          doctor_name: v.doctor_name || null,
          hospital: v.hospital || null,
          medicine: v.medicine || null,
          dosage: v.dosage || null,
          occurred_on: v.occurred_on || today(),
          next_due_on: v.next_due_on || null,
          is_critical: v.is_critical === "yes",
        }),
      }),
    onSuccess: () => {
      toast.success("Medical record saved");
      setRecordOpen(false);
      void qc.invalidateQueries({ queryKey: ["medical-records"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const medicineMut = useMutation({
    mutationFn: (v: FormValues) =>
      saveMed({
        data: clean({
          branch_id: branchId!,
          name: v.name,
          category: v.category || null,
          unit: v.unit || "unit",
          quantity: Number(v.quantity || 0),
          min_quantity: Number(v.min_quantity || 0),
          expiry_date: v.expiry_date || null,
          notes: v.notes || null,
        }),
      }),
    onSuccess: () => {
      toast.success("Medicine saved");
      setMedicineOpen(false);
      void qc.invalidateQueries({ queryKey: ["medicines"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const medRows = (records.data?.records ?? []) as MedRow[];
  const stockRows = (medicines.data?.medicines ?? []) as MedicineRow[];

  return (
    <>
      <PageHeader
        title="Medical"
        description="Health history, doctor visits, vaccinations, emergencies and the medicine cupboard."
      />

      <RecordDialog
        open={recordOpen}
        onOpenChange={setRecordOpen}
        title="Add medical record"
        fields={[
          {
            name: "student_id",
            label: "Student",
            type: "select",
            options: studentOptions,
            required: true,
            full: true,
          },
          {
            name: "record_type",
            label: "Record type",
            type: "select",
            options: ["history", "doctor_visit", "vaccination", "emergency", "medication"].map(
              (v) => ({
                value: v,
                label: v.replace(/_/g, " "),
              }),
            ),
          },
          { name: "title", label: "Title", type: "text", required: true },
          { name: "occurred_on", label: "Date", type: "date" },
          { name: "next_due_on", label: "Next due", type: "date" },
          { name: "doctor_name", label: "Doctor", type: "text" },
          { name: "hospital", label: "Hospital / clinic", type: "text" },
          { name: "medicine", label: "Medicine", type: "text" },
          { name: "dosage", label: "Dosage", type: "text" },
          {
            name: "is_critical",
            label: "Critical",
            type: "select",
            options: [
              { value: "no", label: "No" },
              { value: "yes", label: "Yes" },
            ],
          },
          { name: "description", label: "Details", type: "textarea" },
        ]}
        initial={{ record_type: "history", occurred_on: today(), is_critical: "no" }}
        pending={recordMut.isPending}
        onSubmit={(v) => recordMut.mutate(v)}
      />

      <RecordDialog
        open={medicineOpen}
        onOpenChange={setMedicineOpen}
        title="Add medicine"
        fields={[
          { name: "name", label: "Medicine name", type: "text", required: true },
          { name: "category", label: "Category", type: "text" },
          { name: "unit", label: "Unit", type: "text" },
          { name: "quantity", label: "Quantity", type: "number", required: true },
          { name: "min_quantity", label: "Minimum level", type: "number" },
          { name: "expiry_date", label: "Expiry date", type: "date" },
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
        initial={{ unit: "strip", quantity: "0", min_quantity: "0" }}
        pending={medicineMut.isPending}
        onSubmit={(v) => medicineMut.mutate(v)}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Medical records" value={medRows.length} />
        <StatCard
          label="Critical flags"
          value={medRows.filter((r) => r.is_critical).length}
          tone="accent"
        />
        <StatCard label="Medicines" value={stockRows.length} />
        <StatCard
          label="Below minimum"
          value={stockRows.filter((m) => Number(m.quantity) <= Number(m.min_quantity)).length}
          tone="accent"
        />
      </div>

      {!branchId && (
        <EmptyState title="Select a branch" description="Medical records are per branch." />
      )}

      <Tabs defaultValue="records">
        <TabsList>
          <TabsTrigger value="records">Student records</TabsTrigger>
          <TabsTrigger value="stock">Medicine stock</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          <div className="flex justify-end">
            <Button disabled={!branchId} onClick={() => setRecordOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Add record
            </Button>
          </div>
          {records.isPending && <LoadingState />}
          {records.isError && <ErrorState onRetry={() => void records.refetch()} />}
          {records.data && medRows.length === 0 && (
            <EmptyState
              title="No medical records"
              description="Log a health history entry, doctor visit or vaccination."
            />
          )}
          {medRows.length > 0 && (
            <RecordTable
              rows={medRows}
              deleteTable="medical_records"
              deleteLabel="medical record"
              columns={[
                { key: "student", header: "Student", cell: (r) => studentName(r.student_id) },
                { key: "type", header: "Type", cell: (r) => <StatusBadge value={r.record_type} /> },
                { key: "title", header: "Record", cell: (r) => r.title },
                { key: "doctor", header: "Doctor", cell: (r) => r.doctor_name ?? "—" },
                { key: "date", header: "Date", cell: (r) => r.occurred_on },
                { key: "next", header: "Next due", cell: (r) => r.next_due_on ?? "—" },
                { key: "critical", header: "Critical", cell: (r) => (r.is_critical ? "Yes" : "—") },
              ]}
            />
          )}
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <div className="flex justify-end">
            <Button disabled={!branchId} onClick={() => setMedicineOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Add medicine
            </Button>
          </div>
          {medicines.isPending && <LoadingState />}
          {medicines.isError && <ErrorState onRetry={() => void medicines.refetch()} />}
          {medicines.data && stockRows.length === 0 && (
            <EmptyState title="No medicines yet" description="Add the medicine cupboard stock." />
          )}
          {stockRows.length > 0 && (
            <RecordTable
              rows={stockRows}
              deleteTable="medicines"
              deleteLabel="medicine"
              columns={[
                { key: "name", header: "Medicine", cell: (r) => r.name },
                { key: "category", header: "Category", cell: (r) => r.category ?? "—" },
                { key: "qty", header: "Quantity", cell: (r) => `${r.quantity} ${r.unit}` },
                { key: "min", header: "Minimum", cell: (r) => r.min_quantity },
                { key: "expiry", header: "Expiry", cell: (r) => r.expiry_date ?? "—" },
              ]}
            />
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
