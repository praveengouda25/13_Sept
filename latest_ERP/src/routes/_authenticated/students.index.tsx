import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, LoadingState, ErrorState, EmptyState } from "@/components/data/states";
import { RecordTable, StatusBadge } from "@/components/data/record-table";
import {
  RecordDialog,
  clean,
  today,
  type FieldSpec,
  type FormValues,
} from "@/components/data/record-dialog";
import { PhotoField, StudentAvatar } from "@/components/data/photo-field";
import { AddressPicker, EMPTY_ADDRESS, type AddressValue } from "@/components/data/address-fields";
import { ExportMenu } from "@/components/data/export-menu";
import { useSession } from "@/hooks/use-session";
import { deleteRecord } from "@/lib/ops-extra.functions";
import { listStudents, saveStudent } from "@/lib/operations.functions";
import { BLOOD_GROUPS, CLASS_GRADES, STUDENT_CATEGORIES } from "@/lib/form-options";
import { validateAadhaar, validateMobile, validatePan, validatePincode } from "@/lib/validators";
import { can } from "@/lib/permissions";

export const Route = createFileRoute("/_authenticated/students/")({
  beforeLoad: ({ context, location }) => {
    const roles = context.roles as string[];
    if (!can(roles as any, "students", "view")) {
      throw redirect({
        to: "/dashboard",
        search: { error: "Access denied: Students module requires appropriate permissions" },
      });
    }
  },
  head: () => ({
    meta: [
      { title: "Student register | VISTARX Hostel360" },
      {
        name: "description",
        content:
          "Searchable student database with photos, admission numbers, hostels, status and PDF export.",
      },
      { property: "og:title", content: "Student register | VISTARX Hostel360" },
      {
        property: "og:description",
        content:
          "Searchable student database with photos, admission numbers, hostels, status and PDF export.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudentsPage,
});

type StudentRow = {
  id: string;
  branch_id: string;
  admission_number: string;
  first_name: string;
  last_name: string | null;
  gender: string | null;
  date_of_birth: string | null;
  class_grade: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  blood_group: string | null;
  notes: string | null;
  photo_url: string | null;
  status: string;
  admission_date: string | null;
  father_name?: string | null;
  father_mobile?: string | null;
  father_occupation?: string | null;
  father_aadhaar?: string | null;
  father_pan?: string | null;
  mother_name?: string | null;
  mother_mobile?: string | null;
  mother_occupation?: string | null;
  guardian_name?: string | null;
  guardian_mobile?: string | null;
  guardian_relationship?: string | null;
  school_name?: string | null;
  religion?: string | null;
  caste?: string | null;
  nationality?: string | null;
  category?: string | null;
  aadhaar_number?: string | null;
  country?: string | null;
  state?: string | null;
  district?: string | null;
  taluk?: string | null;
  village?: string | null;
  custom_village?: string | null;
  pincode?: string | null;
};

const upper = (v: string) => v.toUpperCase();

function parseAddress(raw: string | undefined): AddressValue {
  if (!raw) return EMPTY_ADDRESS;
  try {
    return { ...EMPTY_ADDRESS, ...(JSON.parse(raw) as Partial<AddressValue>) };
  } catch {
    return EMPTY_ADDRESS;
  }
}

const FIELDS: FieldSpec[] = [
  // ---- Personal details ----
  {
    name: "photo_url",
    label: "Student Photo",
    type: "custom",
    section: "Personal details",
    render: ({ value, onChange }) => (
      <PhotoField value={value as string | null} onChange={onChange} />
    ),
  },
  {
    name: "first_name",
    label: "First name",
    type: "text",
    required: true,
    section: "Personal details",
  },
  { name: "last_name", label: "Last name", type: "text", section: "Personal details" },
  {
    name: "gender",
    label: "Gender",
    type: "select",
    options: ["male", "female", "other"].map((v) => ({ value: v, label: v })),
    section: "Personal details",
  },
  { name: "date_of_birth", label: "Date of birth", type: "date", section: "Personal details" },
  {
    name: "blood_group",
    label: "Blood group",
    type: "select",
    options: BLOOD_GROUPS,
    section: "Personal details",
  },
  { name: "phone", label: "Phone", type: "tel", section: "Personal details" },
  { name: "email", label: "Email", type: "email", section: "Personal details" },
  {
    name: "category",
    label: "Category",
    type: "select",
    options: STUDENT_CATEGORIES,
    section: "Personal details",
  },
  {
    name: "nationality",
    label: "Nationality",
    type: "text",
    placeholder: "Indian",
    section: "Personal details",
  },
  {
    name: "aadhaar_number",
    label: "Aadhaar number",
    type: "text",
    placeholder: "123456789012",
    hint: "12 digits, no spaces.",
    validate: validateAadhaar,
    section: "Personal details",
  },
  {
    name: "phone",
    label: "Mobile number",
    type: "phone",
    validate: validateMobile,
    section: "Personal details",
  },
  { name: "email", label: "Email", type: "email", section: "Personal details" },

  // ---- Family details ----
  { name: "father_name", label: "Father's name", type: "text", section: "Family details" },
  {
    name: "father_mobile",
    label: "Father's mobile",
    type: "phone",
    validate: validateMobile,
    section: "Family details",
  },
  {
    name: "father_occupation",
    label: "Father's occupation",
    type: "text",
    section: "Family details",
  },
  {
    name: "father_aadhaar",
    label: "Father's Aadhaar",
    type: "text",
    validate: validateAadhaar,
    section: "Family details",
  },
  {
    name: "father_pan",
    label: "Father's PAN",
    type: "text",
    placeholder: "ABCDE1234F",
    transform: upper,
    validate: validatePan,
    section: "Family details",
  },
  { name: "mother_name", label: "Mother's name", type: "text", section: "Family details" },
  {
    name: "mother_mobile",
    label: "Mother's mobile",
    type: "phone",
    validate: validateMobile,
    section: "Family details",
  },
  {
    name: "mother_occupation",
    label: "Mother's occupation",
    type: "text",
    section: "Family details",
  },
  { name: "guardian_name", label: "Guardian's name", type: "text", section: "Family details" },
  {
    name: "guardian_mobile",
    label: "Guardian's mobile",
    type: "phone",
    validate: validateMobile,
    section: "Family details",
  },
  {
    name: "guardian_relationship",
    label: "Relationship with guardian",
    type: "text",
    section: "Family details",
  },

  // ---- Address ----
  {
    name: "address_geo",
    label: "Place of residence",
    type: "custom",
    full: true,
    section: "Address",
    render: ({ value, onChange }) => (
      <AddressPicker
        value={parseAddress(value)}
        onChange={(next) => onChange(JSON.stringify(next))}
      />
    ),
  },
  {
    name: "pincode",
    label: "Pincode",
    type: "text",
    placeholder: "560001",
    validate: validatePincode,
    section: "Address",
  },
  { name: "address", label: "House / street address", type: "textarea", section: "Address" },

  // ---- Academic ----
  {
    name: "class_grade",
    label: "Class / grade",
    type: "select",
    options: CLASS_GRADES,
    section: "Academic details",
  },
  {
    name: "school_name",
    label: "School / college name",
    type: "text",
    section: "Academic details",
  },
  { name: "admission_date", label: "Admission date", type: "date", section: "Academic details" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: ["applicant", "active", "on_leave", "alumni", "withdrawn"].map((v) => ({
      value: v,
      label: v.replace(/_/g, " "),
    })),
    section: "Academic details",
  },
  { name: "notes", label: "Notes", type: "textarea", section: "Academic details" },
];

function StudentsPage() {
  const { session, roles, branchId } = useSession();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StudentRow | null>(null);
  const [search, setSearch] = useState("");

  const fetchList = useServerFn(listStudents);
  const save = useServerFn(saveStudent);
  const remove = useServerFn(deleteRecord);

  const { data, error, isPending, isError, refetch } = useQuery({
    queryKey: ["students", branchId],
    queryFn: () => fetchList({ data: { branchId } }),
  });

  const saveMut = useMutation({
    mutationFn: (v: FormValues) => {
      const geo = parseAddress(v.address_geo);
      return save({
        data: clean({
          id: editing?.id,
          branch_id: branchId!,
          first_name: v.first_name,
          last_name: v.last_name || null,
          gender: (v.gender || null) as "male" | "female" | "other" | null,
          date_of_birth: v.date_of_birth || null,
          class_grade: v.class_grade || null,
          blood_group: v.blood_group || null,
          phone: v.phone || null,
          email: v.email || null,
          address: v.address || null,
          notes: v.notes || null,
          photo_url: v.photo_url || null,
          status: (v.status || "active") as never,
          admission_date: v.admission_date || today(),
          father_name: v.father_name || null,
          father_mobile: v.father_mobile || null,
          father_occupation: v.father_occupation || null,
          father_aadhaar: v.father_aadhaar || null,
          father_pan: v.father_pan || null,
          mother_name: v.mother_name || null,
          mother_mobile: v.mother_mobile || null,
          mother_occupation: v.mother_occupation || null,
          guardian_name: v.guardian_name || null,
          guardian_mobile: v.guardian_mobile || null,
          guardian_relationship: v.guardian_relationship || null,
          school_name: v.school_name || null,
          religion: v.religion || null,
          caste: v.caste || null,
          nationality: v.nationality || null,
          category: v.category || null,
          aadhaar_number: v.aadhaar_number || null,
          country: geo.country || null,
          state: geo.state || null,
          district: geo.district || null,
          taluk: geo.taluk || null,
          village: geo.village || null,
          custom_village: geo.custom_village || null,
          pincode: v.pincode || null,
        }),
      });
    },
    onSuccess: () => {
      toast.success(editing ? "Student updated" : "Student saved");
      setOpen(false);
      setEditing(null);
      void qc.invalidateQueries({ queryKey: ["students"] });
      void qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { table: "students", id } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["students"] });
      void qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const q = search.trim().toLowerCase();
  const rows = ((data?.students ?? []) as StudentRow[]).filter(
    (s) =>
      !q ||
      `${s.first_name} ${s.last_name ?? ""} ${s.admission_number} ${s.phone ?? ""} ${s.class_grade ?? ""}`
        .toLowerCase()
        .includes(q),
  );

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(row: StudentRow) {
    setEditing(row);
    setOpen(true);
  }

  const initial: FormValues = editing
    ? {
        ...Object.fromEntries(
          Object.entries({
            photo_url: editing.photo_url,
            first_name: editing.first_name,
            last_name: editing.last_name,
            gender: editing.gender,
            date_of_birth: editing.date_of_birth,
            class_grade: editing.class_grade,
            blood_group: editing.blood_group,
            phone: editing.phone,
            email: editing.email,
            address: editing.address,
            notes: editing.notes,
            status: editing.status,
            admission_date: editing.admission_date,
            father_name: editing.father_name,
            father_mobile: editing.father_mobile,
            father_occupation: editing.father_occupation,
            father_aadhaar: editing.father_aadhaar,
            father_pan: editing.father_pan,
            mother_name: editing.mother_name,
            mother_mobile: editing.mother_mobile,
            mother_occupation: editing.mother_occupation,
            guardian_name: editing.guardian_name,
            guardian_mobile: editing.guardian_mobile,
            guardian_relationship: editing.guardian_relationship,
            school_name: editing.school_name,
            religion: editing.religion,
            caste: editing.caste,
            nationality: editing.nationality,
            category: editing.category,
            aadhaar_number: editing.aadhaar_number,
            pincode: editing.pincode,
          }).map(([k, v]) => [k, v ?? ""]),
        ),
        address_geo: JSON.stringify({
          ...EMPTY_ADDRESS,
          country: editing.country ?? "India",
          state: editing.state ?? "",
          district: editing.district ?? "",
          taluk: editing.taluk ?? "",
          village: editing.village ?? "",
          custom_village: editing.custom_village ?? "",
        }),
      }
    : {
        status: "active",
        admission_date: today(),
        nationality: "Indian",
        address_geo: JSON.stringify(EMPTY_ADDRESS),
      };

  return (
    <>
      <PageHeader
        title="Students"
        description="The student register: photos, admissions, contact details and status."
        actions={
          <div className="flex gap-2">
            <ExportMenu
              disabled={rows.length === 0}
              data={{
                title: "Student register",
                columns: ["Admission #", "Name", "Branch", "Class", "Blood", "Phone", "Status"],
                rows: rows.map((r) => {
                  const branch = session.branches.find((b) => b.id === r.branch_id);
                  return [
                    r.admission_number,
                    `${r.first_name} ${r.last_name ?? ""}`.trim(),
                    branch ? branch.name : "—",
                    r.class_grade ?? "—",
                    r.blood_group ?? "—",
                    r.phone ?? "—",
                    r.status,
                  ];
                }),
                fileName: "students",
              }}
            />
            <Button disabled={!branchId} onClick={openCreate}>
              <Plus className="mr-1 h-4 w-4" /> Add student
            </Button>
          </div>
        }
      />

      <RecordDialog
        key={editing?.id ?? "new"}
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setEditing(null);
        }}
        title={editing ? "Edit student" : "Add student"}
        description="Registration details are stored securely in the backend; photos are kept in private storage."
        fields={FIELDS}
        initial={initial}
        submitLabel={editing ? "Update student" : "Save student"}
        pending={saveMut.isPending}
        onSubmit={(v) => saveMut.mutate(v)}
      />

      <Input
        placeholder="Search by name, admission number, class or phone…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {!branchId && (
        <EmptyState title="Select a branch" description="Students are scoped per branch." />
      )}
      {isPending && <LoadingState />}
      {isError && (
        <ErrorState
          message="Unable to load students."
          details={error instanceof Error ? error.message : "Check the browser console and server logs for the request error."}
          onRetry={() => void refetch()}
        />
      )}
      {branchId && data && rows.length === 0 && (
        <EmptyState
          title="No students found"
          description="Add a student directly or enrol an applicant from Admissions."
        />
      )}

      {rows.length > 0 && (
        <RecordTable
          rows={rows}
          columns={[
            {
              key: "photo",
              header: "",
              cell: (r) => (
                <StudentAvatar
                  path={r.photo_url}
                  name={`${r.first_name} ${r.last_name ?? ""}`.trim()}
                />
              ),
            },
            {
              key: "adm",
              header: "Admission #",
              className: "font-mono text-xs",
              cell: (r) => r.admission_number,
            },
            {
              key: "name",
              header: "Name",
              cell: (r) => `${r.first_name} ${r.last_name ?? ""}`.trim(),
            },
            {
              key: "branch",
              header: "Branch",
              cell: (r) => {
                const branch = session.branches.find((b) => b.id === r.branch_id);
                return branch ? branch.name : "—";
              },
            },
            { key: "class", header: "Class", cell: (r) => r.class_grade ?? "—" },
            { key: "phone", header: "Phone", cell: (r) => r.phone ?? "—" },
            { key: "status", header: "Status", cell: (r) => <StatusBadge value={r.status} /> },
            {
              key: "edit",
              header: "",
              className: "text-right",
              cell: (r) => (
                <Button size="sm" variant="outline" onClick={() => openEdit(r)}>
                  <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                </Button>
              ),
            },
          ]}
          onDelete={can(roles, "students", "delete") ? async (row) => {
            await deleteMut.mutateAsync(row.id);
          } : undefined}
          deleteLabel="student"
        />
      )}
    </>
  );
}
