import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Server functions for the extended modules: visitors, medical, kitchen &
 * mess, assets, the finance dashboard, student detail/timeline and bed
 * allocation. All queries run through the authenticated client so RLS applies.
 */

const uuid = z.string().uuid();
const dateStr = z.string().min(4).max(20);
const branchScope = z.object({ branchId: z.string().uuid().nullable().optional() });

/* -------------------------------- visitors -------------------------------- */

export const listVisitors = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("visitors")
      .select("*")
      .is("deleted_at", null)
      .order("entry_at", { ascending: false })
      .limit(400);
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { visitors: rows ?? [] };
  });

export const saveVisitor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        id: uuid.optional(),
        branch_id: uuid,
        student_id: uuid.nullable().optional(),
        visitor_name: z.string().min(1).max(160),
        visitor_type: z
          .enum(["parent", "guardian", "guest", "vendor", "official", "other"])
          .optional(),
        phone: z.string().max(30).nullable().optional(),
        id_proof: z.string().max(120).nullable().optional(),
        purpose: z.string().max(300).nullable().optional(),
        status: z.enum(["checked_in", "checked_out", "expected", "denied"]).optional(),
        notes: z.string().max(600).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data;
    if (id) {
      const { error } = await context.supabase.from("visitors").update(fields).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase
      .from("visitors")
      .insert({ ...fields, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const checkoutVisitor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ id: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("visitors")
      .update({ status: "checked_out", exit_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* --------------------------------- medical -------------------------------- */

export const listMedicalRecords = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.extend({ studentId: uuid.optional() }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("medical_records")
      .select("*")
      .is("deleted_at", null)
      .order("occurred_on", { ascending: false })
      .limit(400);
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    if (data.studentId) q = q.eq("student_id", data.studentId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { records: rows ?? [] };
  });

export const saveMedicalRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        id: uuid.optional(),
        branch_id: uuid,
        student_id: uuid,
        record_type: z.enum(["history", "doctor_visit", "vaccination", "emergency", "medication"]),
        title: z.string().min(1).max(200),
        description: z.string().max(2000).nullable().optional(),
        doctor_name: z.string().max(160).nullable().optional(),
        hospital: z.string().max(160).nullable().optional(),
        medicine: z.string().max(200).nullable().optional(),
        dosage: z.string().max(120).nullable().optional(),
        occurred_on: dateStr,
        next_due_on: dateStr.nullable().optional(),
        is_critical: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data;
    if (id) {
      const { error } = await context.supabase.from("medical_records").update(fields).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase
      .from("medical_records")
      .insert({ ...fields, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const listMedicines = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("medicines").select("*").is("deleted_at", null).order("name");
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { medicines: rows ?? [] };
  });

export const saveMedicine = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        id: uuid.optional(),
        branch_id: uuid,
        name: z.string().min(1).max(160),
        category: z.string().max(80).nullable().optional(),
        unit: z.string().max(30).optional(),
        quantity: z.number().min(0).max(1_000_000),
        min_quantity: z.number().min(0).max(1_000_000).optional(),
        expiry_date: dateStr.nullable().optional(),
        notes: z.string().max(600).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data;
    if (id) {
      const { error } = await context.supabase.from("medicines").update(fields).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase
      .from("medicines")
      .insert({ ...fields, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

/* ----------------------------- kitchen & mess ----------------------------- */

export const listVendors = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("vendors").select("*").is("deleted_at", null).order("name");
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { vendors: rows ?? [] };
  });

export const saveVendor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        id: uuid.optional(),
        branch_id: uuid,
        name: z.string().min(1).max(160),
        category: z.string().max(80).nullable().optional(),
        contact_person: z.string().max(160).nullable().optional(),
        phone: z.string().max(30).nullable().optional(),
        email: z.string().max(160).nullable().optional(),
        address: z.string().max(400).nullable().optional(),
        notes: z.string().max(600).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data;
    if (id) {
      const { error } = await context.supabase.from("vendors").update(fields).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase
      .from("vendors")
      .insert({ ...fields, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const listMenus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.extend({ date: dateStr.optional() }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("mess_menus")
      .select("*")
      .is("deleted_at", null)
      .order("menu_date", { ascending: false })
      .limit(200);
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    if (data.date) q = q.eq("menu_date", data.date);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { menus: rows ?? [] };
  });

export const saveMenu = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        id: uuid.optional(),
        branch_id: uuid,
        menu_date: dateStr,
        meal: z.enum(["breakfast", "lunch", "snacks", "dinner"]),
        items: z.string().min(1).max(1000),
        calories: z.number().min(0).max(20000).nullable().optional(),
        protein_g: z.number().min(0).max(2000).nullable().optional(),
        notes: z.string().max(600).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data;
    if (id) {
      const { error } = await context.supabase.from("mess_menus").update(fields).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { error } = await context.supabase
      .from("mess_menus")
      .upsert(
        { ...fields, created_by: context.userId },
        { onConflict: "branch_id,menu_date,meal" },
      );
    if (error) throw new Error(error.message);
    return { id: null };
  });

export const listFoodStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("food_stock")
      .select("*")
      .is("deleted_at", null)
      .order("item_name");
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { stock: rows ?? [] };
  });

export const saveFoodStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        id: uuid.optional(),
        branch_id: uuid,
        vendor_id: uuid.nullable().optional(),
        item_name: z.string().min(1).max(160),
        category: z.string().max(80).nullable().optional(),
        unit: z.string().max(30).optional(),
        quantity: z.number().min(0).max(1_000_000),
        min_quantity: z.number().min(0).max(1_000_000).optional(),
        unit_cost: z.number().min(0).max(1_000_000).nullable().optional(),
        expiry_date: dateStr.nullable().optional(),
        notes: z.string().max(600).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data;
    if (id) {
      const { error } = await context.supabase.from("food_stock").update(fields).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase
      .from("food_stock")
      .insert({ ...fields, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const listMealAttendance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.extend({ date: dateStr.optional() }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const day = data.date ?? new Date().toISOString().slice(0, 10);
    let q = context.supabase.from("meal_attendance").select("*").eq("meal_date", day);
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { date: day, records: rows ?? [] };
  });

export const markMealAttendance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        branch_id: uuid,
        student_id: uuid,
        meal_date: dateStr,
        meal: z.enum(["breakfast", "lunch", "snacks", "dinner"]),
        present: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("meal_attendance")
      .upsert({ ...data, created_by: context.userId }, { onConflict: "student_id,meal_date,meal" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* --------------------------------- assets --------------------------------- */

export const listAssets = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("assets")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { assets: rows ?? [] };
  });

export const saveAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        id: uuid.optional(),
        branch_id: uuid,
        hostel_id: uuid.nullable().optional(),
        name: z.string().min(1).max(160),
        category: z.string().max(80).nullable().optional(),
        asset_code: z.string().max(60).nullable().optional(),
        serial_number: z.string().max(120).nullable().optional(),
        location: z.string().max(160).nullable().optional(),
        condition: z.enum(["new", "good", "fair", "poor", "damaged", "disposed"]).optional(),
        quantity: z.number().int().min(1).max(100000).optional(),
        purchase_date: dateStr.nullable().optional(),
        purchase_cost: z.number().min(0).max(1_000_000_000).nullable().optional(),
        notes: z.string().max(600).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data;
    if (id) {
      const { error } = await context.supabase.from("assets").update(fields).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase
      .from("assets")
      .insert({ ...fields, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

/* ---------------------------- finance dashboard --------------------------- */

export const getFinanceDashboard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let dq = context.supabase
      .from("donations")
      .select("donor_name, amount, purpose, mode, donated_on")
      .is("deleted_at", null)
      .order("donated_on", { ascending: false })
      .limit(2000);
    let eq_ = context.supabase
      .from("expenses")
      .select("category, amount, vendor, spent_on")
      .is("deleted_at", null)
      .order("spent_on", { ascending: false })
      .limit(2000);
    if (data.branchId) {
      dq = dq.eq("branch_id", data.branchId);
      eq_ = eq_.eq("branch_id", data.branchId);
    }
    const [{ data: donations }, { data: expenses }] = await Promise.all([dq, eq_]);
    const dRows = donations ?? [];
    const eRows = expenses ?? [];
    const n = (v: unknown) => Number(v ?? 0);

    const monthKey = (d: string | null) => (d ?? "").slice(0, 7);
    const months = new Map<string, { month: string; donations: number; expenses: number }>();
    const touch = (m: string) => {
      if (!months.has(m)) months.set(m, { month: m, donations: 0, expenses: 0 });
      return months.get(m)!;
    };
    for (const d of dRows) touch(monthKey(d.donated_on)).donations += n(d.amount);
    for (const e of eRows) touch(monthKey(e.spent_on)).expenses += n(e.amount);
    const cashFlow = [...months.values()]
      .filter((m) => m.month)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12)
      .map((m) => ({ ...m, net: m.donations - m.expenses }));

    const group = (rows: { amount: unknown }[], keyOf: (r: never) => string) => {
      const map = new Map<string, number>();
      for (const r of rows) {
        const k = keyOf(r as never) || "Uncategorised";
        map.set(k, (map.get(k) ?? 0) + n(r.amount));
      }
      return [...map.entries()]
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
    };

    const donorMap = new Map<string, { name: string; total: number; gifts: number }>();
    for (const d of dRows) {
      const key = d.donor_name ?? "Anonymous";
      const prev = donorMap.get(key) ?? { name: key, total: 0, gifts: 0 };
      prev.total += n(d.amount);
      prev.gifts += 1;
      donorMap.set(key, prev);
    }

    const thisMonth = new Date().toISOString().slice(0, 7);
    const donationsTotal = dRows.reduce((a, r) => a + n(r.amount), 0);
    const expensesTotal = eRows.reduce((a, r) => a + n(r.amount), 0);

    return {
      donationsTotal,
      expensesTotal,
      balance: donationsTotal - expensesTotal,
      donationsThisMonth: dRows
        .filter((d) => monthKey(d.donated_on) === thisMonth)
        .reduce((a, r) => a + n(r.amount), 0),
      expensesThisMonth: eRows
        .filter((e) => monthKey(e.spent_on) === thisMonth)
        .reduce((a, r) => a + n(r.amount), 0),
      donationsCount: dRows.length,
      cashFlow,
      donationCategories: group(
        dRows,
        (r: { purpose: string | null }) => r.purpose ?? "General fund",
      ),
      expenseCategories: group(eRows, (r: { category: string | null }) => r.category ?? "Other"),
      topDonors: [...donorMap.values()].sort((a, b) => b.total - a.total).slice(0, 10),
    };
  });

/* ---------------------------- student detail ------------------------------ */

export const getStudentDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ studentId: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const id = data.studentId;

    const [student, timeline, allocation, medical, leaves, attendance] = await Promise.all([
      supabase.from("students").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("student_timeline_events")
        .select("*")
        .eq("student_id", id)
        .order("occurred_at", { ascending: false })
        .limit(200),
      supabase
        .from("bed_allocations")
        .select(
          "id, status, allocated_at, vacated_at, bed_id, room_id, hostel_id, beds(bed_number), rooms(room_number), hostels(name)",
        )
        .eq("student_id", id)
        .order("allocated_at", { ascending: false })
        .limit(20),
      supabase
        .from("medical_records")
        .select("*")
        .eq("student_id", id)
        .is("deleted_at", null)
        .order("occurred_on", { ascending: false })
        .limit(50),
      supabase
        .from("leave_requests")
        .select("*")
        .eq("student_id", id)
        .order("from_date", { ascending: false })
        .limit(50),
      supabase
        .from("attendance")
        .select("attendance_date, status")
        .eq("student_id", id)
        .order("attendance_date", { ascending: false })
        .limit(120),
    ]);

    const failed = [
      ["student", student.error],
      ["timeline", timeline.error],
      ["bed allocations", allocation.error],
      ["medical records", medical.error],
      ["leave requests", leaves.error],
      ["attendance", attendance.error],
    ].find(([, error]) => error);
    if (failed) {
      const error = failed[1];
      console.error(`[student detail] ${failed[0]}`, error);
      throw new Error(
        `Unable to load ${failed[0]} (${error?.code ?? "database error"}): ${error?.message ?? "Unknown database error"}`,
      );
    }
    if (!student.data) throw new Error("Student not found");

    return {
      student: student.data,
      timeline: timeline.data ?? [],
      allocations: allocation.data ?? [],
      medical: medical.data ?? [],
      leaves: leaves.data ?? [],
      attendance: attendance.data ?? [],
    };
  });

/** Beds that are free right now, grouped for a picker. */
export const listAvailableBeds = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => branchScope.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("beds")
      .select(
        "id, bed_number, status, room_id, hostel_id, branch_id, rooms(room_number), hostels(name)",
      )
      .is("deleted_at", null)
      .eq("status", "available")
      .limit(1000);
    if (data.branchId) q = q.eq("branch_id", data.branchId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return {
      beds: (rows ?? []).map((b) => ({
        id: b.id,
        label: `${(b.hostels as { name?: string } | null)?.name ?? "Hostel"} · Room ${(b.rooms as { room_number?: string } | null)?.room_number ?? "?"} · Bed ${b.bed_number}`,
      })),
    };
  });

/** Move a student into a bed, vacating any bed they already hold. */
export const allocateBed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ studentId: uuid, bedId: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: bed, error: bedErr } = await supabase
      .from("beds")
      .select("id, room_id, hostel_id, branch_id, status")
      .eq("id", data.bedId)
      .maybeSingle();
    if (bedErr) throw new Error(bedErr.message);
    if (!bed) throw new Error("Bed not found");
    if (bed.status !== "available") throw new Error("That bed is no longer available");

    const { error: vacateErr } = await supabase
      .from("bed_allocations")
      .update({ status: "transferred", vacated_at: new Date().toISOString() })
      .eq("student_id", data.studentId)
      .eq("status", "active");
    if (vacateErr) throw new Error(vacateErr.message);

    const { error } = await supabase.from("bed_allocations").insert({
      student_id: data.studentId,
      bed_id: bed.id,
      room_id: bed.room_id,
      hostel_id: bed.hostel_id,
      branch_id: bed.branch_id,
      status: "active" as const,
      created_by: userId,
    });
    if (error) throw new Error(error.message);

    await supabase.from("students").update({ hostel_id: bed.hostel_id }).eq("id", data.studentId);
    return { ok: true };
  });

export const vacateBed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ allocationId: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("bed_allocations")
      .update({ status: "vacated", vacated_at: new Date().toISOString() })
      .eq("id", data.allocationId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* -------------------------- notification settings ------------------------- */

export const updateNotificationPrefs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        prefs: z.record(z.string().max(60), z.boolean()),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ notification_prefs: data.prefs })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------------- hostel bed occupancy map -------------------------- */

/** Active bed allocations for a hostel, with the student sitting in each bed. */
export const getBedOccupants = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ hostelId: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("bed_allocations")
      .select(
        "id, bed_id, room_id, allocated_at, students(id, first_name, last_name, admission_number, class_grade, blood_group, photo_url)",
      )
      .eq("hostel_id", data.hostelId)
      .eq("status", "active");
    if (error) throw new Error(error.message);

    return {
      occupants: (rows ?? []).map((r) => {
        const s = r.students as unknown as {
          id: string;
          first_name: string;
          last_name: string | null;
          admission_number: string;
          class_grade: string | null;
          blood_group: string | null;
          photo_url: string | null;
        } | null;
        return {
          allocationId: r.id,
          bedId: r.bed_id,
          roomId: r.room_id,
          allocatedAt: r.allocated_at,
          studentId: s?.id ?? null,
          name: s ? `${s.first_name} ${s.last_name ?? ""}`.trim() : "Unknown student",
          admissionNumber: s?.admission_number ?? "—",
          classGrade: s?.class_grade ?? null,
          bloodGroup: s?.blood_group ?? null,
          photoUrl: s?.photo_url ?? null,
        };
      }),
    };
  });

/** Allocate a specific bed with optional remarks, logging a timeline entry. */
export const assignBed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z
      .object({
        studentId: uuid,
        bedId: uuid,
        remarks: z.string().max(500).nullable().optional(),
        allocatedAt: dateStr.nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: bed, error: bedErr } = await supabase
      .from("beds")
      .select("id, room_id, hostel_id, branch_id, status, bed_number")
      .eq("id", data.bedId)
      .maybeSingle();
    if (bedErr) throw new Error(bedErr.message);
    if (!bed) throw new Error("Bed not found");
    if (bed.status !== "available") throw new Error("That bed is no longer available");

    await supabase
      .from("bed_allocations")
      .update({ status: "transferred", vacated_at: new Date().toISOString() })
      .eq("student_id", data.studentId)
      .eq("status", "active");

    const { error } = await supabase.from("bed_allocations").insert({
      student_id: data.studentId,
      bed_id: bed.id,
      room_id: bed.room_id,
      hostel_id: bed.hostel_id,
      branch_id: bed.branch_id,
      status: "active" as const,
      reason: data.remarks ?? null,
      allocated_at: data.allocatedAt
        ? new Date(data.allocatedAt).toISOString()
        : new Date().toISOString(),
      created_by: userId,
    });
    if (error) throw new Error(error.message);

    await supabase.from("students").update({ hostel_id: bed.hostel_id }).eq("id", data.studentId);

    await supabase.from("notifications").insert({
      branch_id: bed.branch_id,
      category: "hostel",
      priority: "normal" as const,
      title: "Bed assigned",
      message: `Bed ${bed.bed_number} was allocated to a student.`,
      link: `/students/${data.studentId}`,
      created_by: userId,
    });

    return { ok: true };
  });
