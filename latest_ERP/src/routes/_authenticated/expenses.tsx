import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  LoadingState,
  ErrorState,
  EmptyState,
  StatCard,
} from "@/components/data/states";
import { RecordTable, money } from "@/components/data/record-table";
import { QrButton, recordUrl } from "@/components/data/qr";
import { RecordDialog, clean, today, type FormValues } from "@/components/data/record-dialog";
import { useSession } from "@/hooks/use-session";
import { listExpenses, saveExpense } from "@/lib/operations.functions";
import { exportTablePdf } from "@/lib/pdf";

export const Route = createFileRoute("/_authenticated/expenses")({
  head: () => ({
    meta: [
      { title: "Expenses | VISTARX Hostel360" },
      {
        name: "description",
        content:
          "Record branch spend by category and vendor and compare it against donations received.",
      },
      { property: "og:title", content: "Expenses | VISTARX Hostel360" },
      {
        property: "og:description",
        content:
          "Record branch spend by category and vendor and compare it against donations received.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExpensesPage,
});

const MODES = ["cash", "cheque", "bank_transfer", "upi", "card", "other"];

function ExpensesPage() {
  const { branchId } = useSession();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const fetchList = useServerFn(listExpenses);
  const save = useServerFn(saveExpense);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["expenses", branchId],
    queryFn: () => fetchList({ data: { branchId } }),
  });

  const createMut = useMutation({
    mutationFn: (v: FormValues) =>
      save({
        data: clean({
          branch_id: branchId!,
          category: v.category,
          description: v.description || null,
          amount: Number(v.amount),
          spent_on: v.spent_on || today(),
          vendor: v.vendor || null,
          mode: (v.mode || "cash") as never,
          reference_number: v.reference_number || null,
          notes: v.notes || null,
        }),
      }),
    onSuccess: () => {
      toast.success("Expense recorded");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["expenses"] });
      void qc.invalidateQueries({ queryKey: ["finance-summary"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = data?.expenses ?? [];
  const total = rows.reduce((a, r) => a + Number(r.amount), 0);

  return (
    <>
      <PageHeader
        title="Expenses"
        description="Operational spend by category, vendor and payment mode."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={rows.length === 0}
              onClick={() =>
                exportTablePdf({
                  title: "Expenses report",
                  columns: ["Date", "Category", "Amount", "Vendor", "Mode", "Reference"],
                  rows: rows.map((r) => [
                    r.spent_on,
                    r.category,
                    money(r.amount),
                    r.vendor ?? "—",
                    r.mode,
                    r.reference_number ?? "—",
                  ]),
                  fileName: "expenses.pdf",
                })
              }
            >
              <FileDown className="mr-1 h-4 w-4" /> PDF
            </Button>
            <Button disabled={!branchId} onClick={() => setOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Add expense
            </Button>
          </div>
        }
      />

      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        title="Record an expense"
        fields={[
          {
            name: "category",
            label: "Category",
            type: "text",
            required: true,
            placeholder: "Food, utilities, repairs…",
          },
          { name: "amount", label: "Amount", type: "number", required: true },
          { name: "spent_on", label: "Date", type: "date", required: true },
          {
            name: "mode",
            label: "Payment mode",
            type: "select",
            options: MODES.map((m) => ({ value: m, label: m.replace(/_/g, " ") })),
          },
          { name: "vendor", label: "Vendor", type: "text" },
          { name: "reference_number", label: "Reference / bill no.", type: "text" },
          { name: "description", label: "Description", type: "textarea" },
        ]}
        initial={{ spent_on: today(), mode: "cash" }}
        pending={createMut.isPending}
        onSubmit={(v) => createMut.mutate(v)}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total spend" value={money(total)} tone="accent" />
        <StatCard label="Entries" value={rows.length} />
        <StatCard
          label="Average entry"
          value={rows.length ? money(total / rows.length) : money(0)}
        />
      </div>

      {!branchId && <EmptyState title="Select a branch" description="Expenses are per branch." />}
      {isPending && <LoadingState />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {data && rows.length === 0 && (
        <EmptyState title="No expenses yet" description="Log your first expense entry." />
      )}

      {rows.length > 0 && (
        <RecordTable
          rows={rows}
          deleteTable="expenses"
          deleteLabel="expense"
          columns={[
            { key: "date", header: "Date", cell: (r) => r.spent_on },
            { key: "category", header: "Category", cell: (r) => r.category },
            {
              key: "amount",
              header: "Amount",
              className: "font-mono tabular-nums",
              cell: (r) => money(r.amount),
            },
            { key: "vendor", header: "Vendor", cell: (r) => r.vendor ?? "—" },
            { key: "mode", header: "Mode", cell: (r) => r.mode.replace(/_/g, " ") },
            { key: "ref", header: "Reference", cell: (r) => r.reference_number ?? "—" },
            {
              key: "qr",
              header: "",
              className: "text-right",
              cell: (r) => (
                <QrButton
                  value={recordUrl(`/expenses?id=${r.id}`)}
                  title={`Voucher · ${r.category}`}
                  subtitle={`${money(r.amount)} on ${r.spent_on}`}
                />
              ),
            },
          ]}
        />
      )}
    </>
  );
}
