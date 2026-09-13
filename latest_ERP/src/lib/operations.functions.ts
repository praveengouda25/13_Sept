import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Operations server functions: admissions, students, attendance, leave,
 * donations, expenses, inventory, issue register, staff and reports.
 * Every query uses the authenticated Supabase client so RLS scopes results.
 */

const branchScope = z.object({ branchId: z.string().uuid().nullable().optional() });

const uuid = z.string().uuid();
const money = z.number().positive().max(1_000_000_000);
const dateStr = z.string().min(4).max(20);

/* -------------------------------- students -------------------------------- */

export const listStudents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("students")
      .select(
        "id, branch_id, hostel_id, admission_number, first_name, last_name, gender, date_of_birth, class_grade, phone, email, address, blood_group, notes, photo_url, status, admission_date, father_name, father_mobile, father_occupation, father_aadhaar, father_pan, mother_name, mother_mobile, mother_occupation, guardian_name, guardian_mobile, guardian_relationship, school_name, religion, caste, nationality, category, aadhaar_number, country, state, district, taluk, village, custom_village, pincode",
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    const { data: rows, error } = await q;
    if (error) {
      console.error("[students] listStudents", error);
      throw new Error(`Unable to load students (${error.code ?? "database error"}): ${error.message}`);
    }
    return { students: rows ?? [] };
  });

/** Lightweight student picker used by Leave and Gate Pass (existing live columns only). */
export const listStudentOptions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("students")
      .select("id, first_name, last_name, admission_number, status")
      .is("deleted_at", null)
      .order("first_name", { ascending: true })
      .limit(500);
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    const { data: rows, error } = await q;
    if (error) {
      console.error("[leave/gate-pass] listStudentOptions", error);
      throw new Error("Unable to load students for this branch.");
    }
    return { students: rows ?? [] };
  });

export const saveStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        id: uuid.optional(),
        branch_id: uuid,
        hostel_id: uuid.nullable().optional(),
        first_name: z.string().min(1).max(80),
        last_name: z.string().max(80).nullable().optional(),
        gender: z.enum(["male", "female", "other"]).nullable().optional(),
        date_of_birth: dateStr.nullable().optional(),
        class_grade: z.string().max(40).nullable().optional(),
        phone: z.string().max(30).nullable().optional(),
        email: z.string().max(160).nullable().optional(),
        address: z.string().max(400).nullable().optional(),
        blood_group: z.string().max(10).nullable().optional(),
        notes: z.string().max(2000).nullable().optional(),
        photo_url: z.string().max(400).nullable().optional(),
        status: z.enum(["applicant", "active", "on_leave", "alumni", "withdrawn"]).optional(),
        admission_date: dateStr.nullable().optional(),
        father_name: z.string().max(120).nullable().optional(),
        father_mobile: z.string().max(30).nullable().optional(),
        father_occupation: z.string().max(120).nullable().optional(),
        father_aadhaar: z
          .string()
          .regex(/^\d{12}$/, "Father Aadhaar must be 12 digits")
          .nullable()
          .optional(),
        father_pan: z
          .string()
          .regex(/^[A-Z]{5}\d{4}[A-Z]$/, "Father PAN must look like ABCDE1234F")
          .nullable()
          .optional(),
        mother_name: z.string().max(120).nullable().optional(),
        mother_mobile: z.string().max(30).nullable().optional(),
        mother_occupation: z.string().max(120).nullable().optional(),
        guardian_name: z.string().max(120).nullable().optional(),
        guardian_mobile: z.string().max(30).nullable().optional(),
        guardian_relationship: z.string().max(60).nullable().optional(),
        school_name: z.string().max(160).nullable().optional(),
        religion: z.string().max(60).nullable().optional(),
        caste: z.string().max(60).nullable().optional(),
        nationality: z.string().max(60).nullable().optional(),
        category: z.string().max(60).nullable().optional(),
        aadhaar_number: z
          .string()
          .regex(/^\d{12}$/, "Aadhaar must be 12 digits")
          .nullable()
          .optional(),
        country: z.string().max(60).nullable().optional(),
        state: z.string().max(60).nullable().optional(),
        district: z.string().max(60).nullable().optional(),
        taluk: z.string().max(60).nullable().optional(),
        village: z.string().max(80).nullable().optional(),
        custom_village: z.string().max(80).nullable().optional(),
        pincode: z
          .string()
          .regex(/^\d{6}$/, "Pincode must be 6 digits")
          .nullable()
          .optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data;
    if (id) {
      const { data: current, error: currentError } = await context.supabase
        .from("students")
        .select("id, photo_url")
        .eq("id", id)
        .single();
      if (currentError) {
        console.error("[students] load before update", currentError);
        throw new Error(`Unable to update student (${currentError.code ?? "database error"}): ${currentError.message}`);
      }
      const { data: updated, error } = await context.supabase
        .from("students")
        .update(fields)
        .eq("id", id)
        .select("id")
        .single();
      if (error || !updated) {
        console.error("[students] update", error);
        throw new Error(`Unable to update student (${error?.code ?? "no row updated"}): ${error?.message ?? "The record was not updated."}`);
      }
      if (current.photo_url && current.photo_url !== fields.photo_url && !/^https?:\/\//i.test(current.photo_url)) {
        const { error: removeError } = await context.supabase.storage.from("student-photos").remove([current.photo_url]);
        if (removeError) console.warn("[students] old photo cleanup", removeError.message);
      }
      return { id };
    }
    const { data: row, error } = await context.supabase
      .from("students")
      // admission_number is generated by a database trigger.
      .insert({ ...fields, admission_number: "", created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

/* ------------------------------- admissions ------------------------------- */

export const listAdmissions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("admissions")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { admissions: rows ?? [] };
  });

export const saveAdmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        id: uuid.optional(),
        branch_id: uuid,
        applicant_name: z.string().min(1).max(160),
        gender: z.enum(["male", "female", "other"]).nullable().optional(),
        date_of_birth: dateStr.nullable().optional(),
        guardian_name: z.string().max(160).nullable().optional(),
        guardian_phone: z.string().max(30).nullable().optional(),
        status: z
          .enum(["draft", "submitted", "under_review", "approved", "rejected", "enrolled"])
          .optional(),
        remarks: z.string().max(600).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data;
    if (id) {
      const { error } = await context.supabase.from("admissions").update(fields).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase
      .from("admissions")
      .insert({ ...fields, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

/** Approve an application and create the matching student record. */
export const enrolAdmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ id: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: app, error } = await supabase
      .from("admissions")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!app) throw new Error("Application not found");
    if (app.student_id) return { studentId: app.student_id };

    const [first, ...rest] = app.applicant_name.trim().split(/\s+/);
    const { data: student, error: sErr } = await supabase
      .from("students")
      .insert({
        branch_id: app.branch_id,
        first_name: first,
        last_name: rest.join(" ") || null,
        gender: app.gender,
        date_of_birth: app.date_of_birth,
        status: "active" as const,
        admission_number: "",
        admission_date: new Date().toISOString().slice(0, 10),
        created_by: userId,
      })
      .select("id")
      .single();
    if (sErr) throw new Error(sErr.message);

    await supabase
      .from("admissions")
      .update({
        student_id: student.id,
        status: "enrolled",
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    return { studentId: student.id };
  });

/* ------------------------------- attendance ------------------------------- */

export const listAttendance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.extend({ date: dateStr.optional() }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const day = data.date ?? new Date().toISOString().slice(0, 10);
    let q = context.supabase
      .from("attendance")
      .select("*")
      .eq("attendance_date", day)
      .order("created_at", { ascending: false });
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { date: day, records: rows ?? [] };
  });

export const markAttendance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        branch_id: uuid,
        student_id: uuid,
        attendance_date: dateStr,
        status: z.enum(["present", "absent", "leave", "late"]),
        remarks: z.string().max(300).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("attendance")
      .upsert(
        { ...data, marked_by: context.userId, created_by: context.userId },
        { onConflict: "student_id,attendance_date" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------------------------- leave --------------------------------- */

const LEAVE_COLUMNS =
  "id, branch_id, student_id, from_date, to_date, reason, destination, contact_phone, status, reviewed_by, reviewed_at, review_notes, created_at, updated_at, created_by, students(first_name, last_name, admission_number)";

export const listLeaves = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("leave_requests")
      .select(LEAVE_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(300);
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    const { data: rows, error } = await q;
    if (error) {
      console.error("[leave] listLeaves", error);
      throw new Error("Unable to load leave requests. Please check your permissions.");
    }
    return { leaves: rows ?? [] };
  });

export const saveLeave = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        id: uuid.optional(),
        branch_id: uuid.optional(),
        student_id: uuid.optional(),
        from_date: dateStr.optional(),
        to_date: dateStr.optional(),
        reason: z.string().max(600).optional(),
        destination: z.string().max(160).nullable().optional(),
        contact_phone: z.string().max(30).nullable().optional(),
        status: z.enum(["pending", "approved", "rejected", "cancelled"]).optional(),
        review_notes: z.string().max(600).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data;
    if (id) {
      const { data: current, error: currentError } = await context.supabase
        .from("leave_requests")
        .select("id, status")
        .eq("id", id)
        .maybeSingle();
      if (currentError) {
        console.error("[leave] saveLeave load", currentError);
        throw new Error("Unable to update leave request. Please try again.");
      }
      if (!current) throw new Error("Leave request not found.");

      const nextStatus = fields.status ?? current.status;
      if (nextStatus !== current.status) {
        if (current.status !== "pending" || !["approved", "rejected", "cancelled"].includes(nextStatus)) {
          throw new Error(`Cannot change a ${current.status} leave request to ${nextStatus}.`);
        }
      }

      const reviewed =
        nextStatus !== "pending" && nextStatus !== current.status
          ? { reviewed_by: context.userId, reviewed_at: new Date().toISOString() }
          : {};
      const { error } = await context.supabase
        .from("leave_requests")
        .update({ ...fields, ...reviewed })
        .eq("id", id)
        .select("id")
        .single();
      if (error) {
        console.error("[leave] saveLeave update", error);
        throw new Error("Unable to update leave request. Please try again.");
      }
      return { id };
    }
    if (!data.branch_id || !data.student_id || !data.from_date || !data.to_date) {
      throw new Error("Student, branch and leave dates are required.");
    }
    const { data: row, error } = await context.supabase
      .from("leave_requests")
      .insert({
        branch_id: data.branch_id,
        student_id: data.student_id,
        from_date: data.from_date,
        to_date: data.to_date,
        reason: fields.reason ?? "",
        destination: fields.destination ?? null,
        contact_phone: fields.contact_phone ?? null,
        status: "pending",
        created_by: context.userId,
      })
      .select("id")
      .single();
    if (error) {
      console.error("[leave] saveLeave insert", error);
      throw new Error("Unable to save leave request. Please try again.");
    }
    return { id: row.id };
  });

/* -------------------------------- donations ------------------------------- */

export const listDonations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("donations")
      .select("*")
      .is("deleted_at", null)
      .order("donated_on", { ascending: false })
      .limit(500);
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { donations: rows ?? [] };
  });

export const saveDonation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        id: uuid.optional(),
        branch_id: uuid,
        donor_name: z.string().min(1).max(160),
        donor_email: z.string().max(160).nullable().optional(),
        donor_phone: z.string().max(30).nullable().optional(),
        amount: money,
        purpose: z.string().max(200).nullable().optional(),
        mode: z.enum(["cash", "cheque", "bank_transfer", "upi", "card", "other"]),
        receipt_number: z.string().max(60).nullable().optional(),
        donated_on: dateStr,
        notes: z.string().max(600).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data;
    if (id) {
      const { error } = await context.supabase.from("donations").update(fields).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase
      .from("donations")
      .insert({ ...fields, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

/* --------------------------------- expenses -------------------------------- */

export const listExpenses = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("expenses")
      .select("*")
      .is("deleted_at", null)
      .order("spent_on", { ascending: false })
      .limit(500);
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { expenses: rows ?? [] };
  });

export const saveExpense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        id: uuid.optional(),
        branch_id: uuid,
        category: z.string().min(1).max(80),
        description: z.string().max(300).nullable().optional(),
        amount: money,
        spent_on: dateStr,
        vendor: z.string().max(160).nullable().optional(),
        mode: z.enum(["cash", "cheque", "bank_transfer", "upi", "card", "other"]),
        reference_number: z.string().max(60).nullable().optional(),
        notes: z.string().max(600).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data;
    if (id) {
      const { error } = await context.supabase.from("expenses").update(fields).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase
      .from("expenses")
      .insert({ ...fields, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

/* -------------------------------- inventory ------------------------------- */

export const listInventory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("inventory_items")
      .select("*")
      .is("deleted_at", null)
      .order("name")
      .limit(500);
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { items: rows ?? [] };
  });

export const saveInventoryItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        id: uuid.optional(),
        branch_id: uuid,
        name: z.string().min(1).max(160),
        category: z.string().max(80).nullable().optional(),
        unit: z.string().min(1).max(20),
        quantity: z.number().min(0).max(1_000_000),
        min_quantity: z.number().min(0).max(1_000_000),
        location: z.string().max(160).nullable().optional(),
        notes: z.string().max(600).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data;
    if (id) {
      const { error } = await context.supabase.from("inventory_items").update(fields).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase
      .from("inventory_items")
      .insert({ ...fields, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const recordStockMovement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        branch_id: uuid,
        item_id: uuid,
        txn_type: z.enum(["in", "out", "adjustment"]),
        quantity: z.number().min(0).max(1_000_000),
        reason: z.string().max(300).nullable().optional(),
        occurred_on: dateStr,
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("inventory_transactions")
      .insert({ ...data, created_by: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ------------------------------ issue register ----------------------------- */

export const listIssues = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("issues")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { issues: rows ?? [] };
  });

export const saveIssue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        id: uuid.optional(),
        branch_id: uuid,
        hostel_id: uuid.nullable().optional(),
        title: z.string().min(2).max(200),
        description: z.string().max(1000).nullable().optional(),
        category: z.string().max(80).nullable().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]),
        status: z.enum(["open", "in_progress", "resolved", "closed"]),
        reported_on: dateStr,
        resolution_notes: z.string().max(600).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data;
    const resolved =
      fields.status === "resolved" || fields.status === "closed"
        ? { resolved_at: new Date().toISOString() }
        : {};
    if (id) {
      const { error } = await context.supabase
        .from("issues")
        .update({ ...fields, ...resolved })
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase
      .from("issues")
      .insert({ ...fields, ...resolved, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

/* ---------------------------------- staff --------------------------------- */

export const listStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("staff")
      .select("*")
      .is("deleted_at", null)
      .order("full_name")
      .limit(500);
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { staff: rows ?? [] };
  });

export const saveStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        id: uuid.optional(),
        branch_id: uuid,
        full_name: z.string().min(1).max(160),
        designation: z.string().max(120).nullable().optional(),
        department: z.string().max(120).nullable().optional(),
        email: z.string().max(160).nullable().optional(),
        phone: z.string().max(30).nullable().optional(),
        joined_on: dateStr.nullable().optional(),
        status: z.enum(["active", "on_leave", "inactive"]),
        notes: z.string().max(600).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data;
    if (id) {
      const { error } = await context.supabase.from("staff").update(fields).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase
      .from("staff")
      .insert({ ...fields, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

/* --------------------------------- finance -------------------------------- */

/** Donation + expense roll-up that feeds the dashboard automatically. */
export const getFinanceSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const monthStart = new Date();
    monthStart.setDate(1);
    const since = monthStart.toISOString().slice(0, 10);

    let dq = supabase
      .from("donations")
      .select("id, donor_name, amount, purpose, donated_on, mode")
      .is("deleted_at", null)
      .order("donated_on", { ascending: false });
    let eq_ = supabase
      .from("expenses")
      .select("id, category, amount, spent_on")
      .is("deleted_at", null);
    if (data.branchId) {
      dq = dq.eq("branch_id", data.branchId);
      eq_ = eq_.eq("branch_id", data.branchId);
    }

    const [{ data: donations }, { data: expenses }] = await Promise.all([dq, eq_]);
    const dRows = donations ?? [];
    const eRows = expenses ?? [];

    const sum = (rows: { amount: number | string }[]) =>
      rows.reduce((acc, r) => acc + Number(r.amount ?? 0), 0);

    return {
      donationsTotal: sum(dRows),
      donationsThisMonth: sum(dRows.filter((d) => (d.donated_on ?? "") >= since)),
      donationsCount: dRows.length,
      expensesTotal: sum(eRows),
      expensesThisMonth: sum(eRows.filter((e) => (e.spent_on ?? "") >= since)),
      recentDonations: dRows.slice(0, 6),
    };
  });

/* --------------------------------- reports -------------------------------- */

export const getReportData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    branchScope
      .extend({
        report: z.enum([
          "students",
          "attendance",
          "leave",
          "donations",
          "expenses",
          "inventory",
          "issues",
          "staff",
          "occupancy",
        ]),
        from: dateStr.optional(),
        to: dateStr.optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const b = data.branchId;
    const scope = <T extends { eq: (c: string, v: string) => T }>(q: T) =>
      b ? q.eq("branch_id", b) : q;

    switch (data.report) {
      case "students": {
        const { data: rows } = await scope(
          supabase
            .from("students")
            .select("admission_number, first_name, last_name, class_grade, status, phone")
            .is("deleted_at", null)
            .order("admission_number") as never,
        );
        return {
          columns: ["Admission #", "First name", "Last name", "Class", "Status", "Phone"],
          rows: rows ?? [],
        };
      }
      case "attendance": {
        let q = supabase
          .from("attendance")
          .select("attendance_date, student_id, status, remarks")
          .order("attendance_date", { ascending: false });
        if (b) q = q.eq("branch_id", b);
        if (data.from) q = q.gte("attendance_date", data.from);
        if (data.to) q = q.lte("attendance_date", data.to);
        const { data: rows } = await q;
        return { columns: ["Date", "Student", "Status", "Remarks"], rows: rows ?? [] };
      }
      case "leave": {
        let q = supabase
          .from("leave_requests")
          .select("from_date, to_date, student_id, reason, status")
          .order("from_date", { ascending: false });
        if (b) q = q.eq("branch_id", b);
        const { data: rows } = await q;
        return { columns: ["From", "To", "Student", "Reason", "Status"], rows: rows ?? [] };
      }
      case "donations": {
        let q = supabase
          .from("donations")
          .select("donated_on, donor_name, amount, mode, purpose, receipt_number")
          .is("deleted_at", null)
          .order("donated_on", { ascending: false });
        if (b) q = q.eq("branch_id", b);
        if (data.from) q = q.gte("donated_on", data.from);
        if (data.to) q = q.lte("donated_on", data.to);
        const { data: rows } = await q;
        return {
          columns: ["Date", "Donor", "Amount", "Mode", "Purpose", "Receipt"],
          rows: rows ?? [],
        };
      }
      case "expenses": {
        let q = supabase
          .from("expenses")
          .select("spent_on, category, amount, vendor, mode, reference_number")
          .is("deleted_at", null)
          .order("spent_on", { ascending: false });
        if (b) q = q.eq("branch_id", b);
        if (data.from) q = q.gte("spent_on", data.from);
        if (data.to) q = q.lte("spent_on", data.to);
        const { data: rows } = await q;
        return {
          columns: ["Date", "Category", "Amount", "Vendor", "Mode", "Reference"],
          rows: rows ?? [],
        };
      }
      case "inventory": {
        let q = supabase
          .from("inventory_items")
          .select("name, category, quantity, unit, min_quantity, location")
          .is("deleted_at", null)
          .order("name");
        if (b) q = q.eq("branch_id", b);
        const { data: rows } = await q;
        return {
          columns: ["Item", "Category", "Qty", "Unit", "Min", "Location"],
          rows: rows ?? [],
        };
      }
      case "issues": {
        let q = supabase
          .from("issues")
          .select("reported_on, title, category, priority, status")
          .is("deleted_at", null)
          .order("reported_on", { ascending: false });
        if (b) q = q.eq("branch_id", b);
        const { data: rows } = await q;
        return {
          columns: ["Reported", "Issue", "Category", "Priority", "Status"],
          rows: rows ?? [],
        };
      }
      case "staff": {
        let q = supabase
          .from("staff")
          .select("full_name, designation, department, phone, joined_on, status")
          .is("deleted_at", null)
          .order("full_name");
        if (b) q = q.eq("branch_id", b);
        const { data: rows } = await q;
        return {
          columns: ["Name", "Designation", "Department", "Phone", "Joined", "Status"],
          rows: rows ?? [],
        };
      }
      case "occupancy":
      default: {
        const { data: rows } = await supabase.from("v_hostel_occupancy").select("*");
        const filtered = (rows ?? []).filter((r) => !b || r.branch_id === b);
        return {
          columns: ["Hostel", "Total beds", "Occupied", "Available", "Occupancy %"],
          rows: filtered.map((r) => ({
            hostel_name: r.hostel_name,
            total_beds: r.total_beds,
            occupied_beds: r.occupied_beds,
            available_beds: r.available_beds,
            occupancy_rate: Math.round(Number(r.occupancy_rate ?? 0)),
          })),
        };
      }
    }
  });
