import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, ChefHat, Calendar, TrendingUp, AlertTriangle, Users, Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PageHeader,
  LoadingState,
  ErrorState,
  EmptyState,
  StatCard,
} from "@/components/data/states";
import { RecordTable, StatusBadge, money } from "@/components/data/record-table";
import { RecordDialog, clean, today, type FormValues } from "@/components/data/record-dialog";
import { useSession } from "@/hooks/use-session";
import {
  listMenus,
  saveMenu,
  listFoodStock,
  saveFoodStock,
  listVendors,
  saveVendor,
  listMealAttendance,
  markMealAttendance,
} from "@/lib/modules.functions";
import { listStudents } from "@/lib/operations.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { can } from "@/lib/permissions";

export const Route = createFileRoute("/_authenticated/mess")({
  beforeLoad: ({ context }) => {
    const roles = context.roles as string[];
    if (!can(roles as any, "mess", "view")) {
      throw new Error("Access denied: Kitchen & Mess module requires appropriate permissions");
    }
  },
  head: () => ({
    meta: [
      { title: "Kitchen & mess | VISTARX Hostel360" },
      {
        name: "description",
        content:
          "Daily menus with nutrition, food stock, vendors and meal attendance for the hostel mess.",
      },
      { property: "og:title", content: "Kitchen & mess | VISTARX Hostel360" },
      {
        property: "og:description",
        content:
          "Daily menus with nutrition, food stock, vendors and meal attendance for the hostel mess.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MessPage,
});

const MEALS = ["breakfast", "lunch", "snacks", "dinner"] as const;

function MessPage() {
  const { branchId } = useSession();
  const qc = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [vendorOpen, setVendorOpen] = useState(false);
  const [date, setDate] = useState(today());
  const [meal, setMeal] = useState<(typeof MEALS)[number]>("lunch");

  const fetchMenus = useServerFn(listMenus);
  const fetchStock = useServerFn(listFoodStock);
  const fetchVendors = useServerFn(listVendors);
  const fetchMeal = useServerFn(listMealAttendance);
  const fetchStudents = useServerFn(listStudents);
  const putMenu = useServerFn(saveMenu);
  const putStock = useServerFn(saveFoodStock);
  const putVendor = useServerFn(saveVendor);
  const markMeal = useServerFn(markMealAttendance);

  const menus = useQuery({
    queryKey: ["mess-menus", branchId],
    queryFn: () => fetchMenus({ data: { branchId } }),
  });
  const stock = useQuery({
    queryKey: ["food-stock", branchId],
    queryFn: () => fetchStock({ data: { branchId } }),
  });
  const vendors = useQuery({
    queryKey: ["vendors", branchId],
    queryFn: () => fetchVendors({ data: { branchId } }),
  });
  const students = useQuery({
    queryKey: ["students", branchId],
    queryFn: () => fetchStudents({ data: { branchId } }),
  });
  const mealAtt = useQuery({
    queryKey: ["meal-attendance", branchId, date, meal],
    queryFn: () => fetchMeal({ data: { branchId, date } }),
  });

  const vendorOptions = useMemo(
    () => (vendors.data?.vendors ?? []).map((v) => ({ value: v.id, label: v.name })),
    [vendors.data],
  );

  const menuMut = useMutation({
    mutationFn: (v: FormValues) =>
      putMenu({
        data: clean({
          branch_id: branchId!,
          menu_date: v.menu_date || today(),
          meal: (v.meal || "lunch") as never,
          items: v.items,
          calories: v.calories ? Number(v.calories) : null,
          protein_g: v.protein_g ? Number(v.protein_g) : null,
          notes: v.notes || null,
        }),
      }),
    onSuccess: () => {
      toast.success("Menu saved");
      setMenuOpen(false);
      void qc.invalidateQueries({ queryKey: ["mess-menus"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const stockMut = useMutation({
    mutationFn: (v: FormValues) =>
      putStock({
        data: clean({
          branch_id: branchId!,
          item_name: v.item_name,
          category: v.category || null,
          unit: v.unit || "kg",
          quantity: Number(v.quantity || 0),
          min_quantity: Number(v.min_quantity || 0),
          unit_cost: v.unit_cost ? Number(v.unit_cost) : null,
          vendor_id: v.vendor_id || null,
          expiry_date: v.expiry_date || null,
          notes: v.notes || null,
        }),
      }),
    onSuccess: () => {
      toast.success("Food stock saved");
      setStockOpen(false);
      void qc.invalidateQueries({ queryKey: ["food-stock"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const vendorMut = useMutation({
    mutationFn: (v: FormValues) =>
      putVendor({
        data: clean({
          branch_id: branchId!,
          name: v.name,
          category: v.category || null,
          contact_person: v.contact_person || null,
          phone: v.phone || null,
          email: v.email || null,
          address: v.address || null,
          notes: v.notes || null,
        }),
      }),
    onSuccess: () => {
      toast.success("Vendor saved");
      setVendorOpen(false);
      void qc.invalidateQueries({ queryKey: ["vendors"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mealMut = useMutation({
    mutationFn: (input: { student_id: string; present: boolean }) =>
      markMeal({
        data: {
          branch_id: branchId!,
          student_id: input.student_id,
          meal_date: date,
          meal,
          present: input.present,
        },
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["meal-attendance"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const menuRows = menus.data?.menus ?? [];
  const stockRows = stock.data?.stock ?? [];
  const vendorRows = vendors.data?.vendors ?? [];
  const studentRows = students.data?.students ?? [];
  const takenBy = new Map(
    (mealAtt.data?.records ?? [])
      .filter((r) => r.meal === meal)
      .map((r) => [r.student_id, r.present]),
  );

  return (
    <>
      <PageHeader
        title="Kitchen & Mess Management"
        description="Complete mess management system with daily menus, inventory tracking, vendor management, and meal attendance."
      />

      <RecordDialog
        open={menuOpen}
        onOpenChange={setMenuOpen}
        title="Set daily menu"
        fields={[
          { name: "menu_date", label: "Date", type: "date", required: true },
          {
            name: "meal",
            label: "Meal",
            type: "select",
            options: MEALS.map((m) => ({ value: m, label: m })),
          },
          { name: "items", label: "Items served", type: "textarea", required: true },
          { name: "calories", label: "Calories (per plate)", type: "number" },
          { name: "protein_g", label: "Protein (g)", type: "number" },
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
        initial={{ menu_date: today(), meal: "lunch" }}
        pending={menuMut.isPending}
        onSubmit={(v) => menuMut.mutate(v)}
      />

      <RecordDialog
        open={stockOpen}
        onOpenChange={setStockOpen}
        title="Add food stock"
        fields={[
          { name: "item_name", label: "Item", type: "text", required: true },
          { name: "category", label: "Category", type: "text" },
          { name: "unit", label: "Unit", type: "text" },
          { name: "quantity", label: "Quantity", type: "number", required: true },
          { name: "min_quantity", label: "Minimum level", type: "number" },
          { name: "unit_cost", label: "Unit cost", type: "number" },
          { name: "vendor_id", label: "Vendor", type: "select", options: vendorOptions },
          { name: "expiry_date", label: "Expiry", type: "date" },
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
        initial={{ unit: "kg", quantity: "0", min_quantity: "0" }}
        pending={stockMut.isPending}
        onSubmit={(v) => stockMut.mutate(v)}
      />

      <RecordDialog
        open={vendorOpen}
        onOpenChange={setVendorOpen}
        title="Add vendor"
        fields={[
          { name: "name", label: "Vendor name", type: "text", required: true },
          { name: "category", label: "Supplies", type: "text" },
          { name: "contact_person", label: "Contact person", type: "text" },
          { name: "phone", label: "Phone", type: "tel" },
          { name: "email", label: "Email", type: "email" },
          { name: "address", label: "Address", type: "textarea" },
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
        pending={vendorMut.isPending}
        onSubmit={(v) => vendorMut.mutate(v)}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Menus planned" value={menuRows.length} icon={Calendar} />
        <StatCard label="Stock items" value={stockRows.length} icon={Package} />
        <StatCard
          label="Low stock"
          value={stockRows.filter((s) => Number(s.quantity) <= Number(s.min_quantity)).length}
          tone="accent"
          icon={AlertTriangle}
        />
        <StatCard label="Vendors" value={vendorRows.length} icon={Users} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Today's attendance"
          value={`${takenBy.size} / ${studentRows.length}`}
          tone="success"
          icon={CheckCircle}
          hint={`${meal} meal`}
        />
        <StatCard
          label="Total stock value"
          value={money(
            stockRows.reduce(
              (sum, s) => sum + Number(s.quantity || 0) * Number(s.unit_cost || 0),
              0,
            ),
          )}
          tone="info"
          icon={TrendingUp}
        />
        <StatCard
          label="Expiring soon"
          value={
            stockRows.filter(
              (s) => s.expiry_date && new Date(s.expiry_date) < new Date(Date.now() + 7 * 86400000),
            ).length
          }
          tone="warning"
          icon={Clock}
          hint="Within 7 days"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <ChefHat className="h-4 w-4" />
            Kitchen Operations Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Today's Menu Status</p>
              <div className="flex gap-2 mt-2">
                {MEALS.map((m) => {
                  const hasMenu = menuRows.some((mr) => mr.menu_date === today() && mr.meal === m);
                  return (
                    <Badge key={m} variant={hasMenu ? "default" : "secondary"}>
                      {m}
                    </Badge>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Stock Alerts</p>
              <div className="mt-2 space-y-1">
                {stockRows.filter((s) => Number(s.quantity) <= Number(s.min_quantity)).slice(0, 3).map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <span>{s.item_name}</span>
                    <Badge variant="destructive">Low</Badge>
                  </div>
                ))}
                {stockRows.filter((s) => Number(s.quantity) <= Number(s.min_quantity)).length === 0 && (
                  <p className="text-xs text-muted-foreground">No low stock items</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!branchId && (
        <EmptyState title="Select a branch" description="Mess records are per branch." />
      )}

      <Tabs defaultValue="menu">
        <TabsList>
          <TabsTrigger value="menu">Daily menu</TabsTrigger>
          <TabsTrigger value="stock">Food stock</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="attendance">Meal attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="menu" className="space-y-4">
          <div className="flex justify-end">
            <Button disabled={!branchId} onClick={() => setMenuOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Add menu
            </Button>
          </div>
          {menus.isPending && <LoadingState />}
          {menus.isError && <ErrorState onRetry={() => void menus.refetch()} />}
          {menus.data && menuRows.length === 0 && (
            <EmptyState
              title="No menus planned"
              description="Plan breakfast, lunch, snacks and dinner."
            />
          )}
          {menuRows.length > 0 && (
            <RecordTable
              rows={menuRows}
              deleteTable="mess_menus"
              deleteLabel="menu"
              columns={[
                { key: "date", header: "Date", cell: (r) => r.menu_date },
                { key: "meal", header: "Meal", cell: (r) => <StatusBadge value={r.meal} /> },
                { key: "items", header: "Items", cell: (r) => r.items },
                { key: "cal", header: "Calories", cell: (r) => r.calories ?? "—" },
                { key: "pro", header: "Protein (g)", cell: (r) => r.protein_g ?? "—" },
              ]}
            />
          )}
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <div className="flex justify-end">
            <Button disabled={!branchId} onClick={() => setStockOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Add stock
            </Button>
          </div>
          {stock.isPending && <LoadingState />}
          {stock.data && stockRows.length === 0 && (
            <EmptyState
              title="No food stock"
              description="Record rice, pulses, vegetables and other supplies."
            />
          )}
          {stockRows.length > 0 && (
            <RecordTable
              rows={stockRows}
              deleteTable="food_stock"
              deleteLabel="food stock item"
              columns={[
                { key: "item", header: "Item", cell: (r) => r.item_name },
                { key: "cat", header: "Category", cell: (r) => r.category ?? "—" },
                { key: "qty", header: "Quantity", cell: (r) => `${r.quantity} ${r.unit}` },
                { key: "min", header: "Minimum", cell: (r) => r.min_quantity },
                {
                  key: "cost",
                  header: "Unit cost",
                  cell: (r) => (r.unit_cost ? money(r.unit_cost) : "—"),
                },
                { key: "exp", header: "Expiry", cell: (r) => r.expiry_date ?? "—" },
              ]}
            />
          )}
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <div className="flex justify-end">
            <Button disabled={!branchId} onClick={() => setVendorOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Add vendor
            </Button>
          </div>
          {vendors.isPending && <LoadingState />}
          {vendors.data && vendorRows.length === 0 && (
            <EmptyState
              title="No vendors"
              description="Add the suppliers your kitchen buys from."
            />
          )}
          {vendorRows.length > 0 && (
            <RecordTable
              rows={vendorRows}
              deleteTable="vendors"
              deleteLabel="vendor"
              columns={[
                { key: "name", header: "Vendor", cell: (r) => r.name },
                { key: "cat", header: "Supplies", cell: (r) => r.category ?? "—" },
                { key: "person", header: "Contact", cell: (r) => r.contact_person ?? "—" },
                { key: "phone", header: "Phone", cell: (r) => r.phone ?? "—" },
                { key: "email", header: "Email", cell: (r) => r.email ?? "—" },
              ]}
            />
          )}
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-44"
            />
            <div className="flex gap-1">
              {MEALS.map((m) => (
                <Button
                  key={m}
                  size="sm"
                  variant={m === meal ? "default" : "outline"}
                  onClick={() => setMeal(m)}
                >
                  {m}
                </Button>
              ))}
            </div>
          </div>
          {studentRows.length === 0 ? (
            <EmptyState
              title="No students"
              description="Add students before recording meal attendance."
            />
          ) : (
            <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
              {studentRows.map((s) => (
                <div key={s.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {s.first_name} {s.last_name ?? ""}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.admission_number}</p>
                  </div>
                  <Switch
                    checked={takenBy.get(s.id) ?? false}
                    onCheckedChange={(present) => mealMut.mutate({ student_id: s.id, present })}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
