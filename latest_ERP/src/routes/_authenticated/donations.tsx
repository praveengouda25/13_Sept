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
import { listDonations, saveDonation } from "@/lib/operations.functions";
import { exportTablePdf } from "@/lib/pdf";

export const Route = createFileRoute("/_authenticated/donations")({
  head: () => ({
    meta: [
      { title: "Donations | VISTARX Hostel360" },
      {
        name: "description",
        content:
          "Record donor gifts with receipts and see them roll straight into the dashboard totals.",
      },
      { property: "og:title", content: "Donations | VISTARX Hostel360" },
      {
        property: "og:description",
        content:
          "Record donor gifts with receipts and see them roll straight into the dashboard totals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DonationsPage,
});

const MODES = ["cash", "cheque", "bank_transfer", "upi", "card", "other"];

function DonationsPage() {
  const { branchId } = useSession();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const fetchList = useServerFn(listDonations);
  const save = useServerFn(saveDonation);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["donations", branchId],
    queryFn: () => fetchList({ data: { branchId } }),
  });

  const createMut = useMutation({
    mutationFn: (v: FormValues) =>
      save({
        data: clean({
          branch_id: branchId!,
          donor_name: v.donor_name,
          donor_email: v.donor_email || null,
          donor_phone: v.donor_phone || null,
          amount: Number(v.amount),
          purpose: v.purpose || null,
          mode: (v.mode || "cash") as never,
          receipt_number: v.receipt_number || null,
          donated_on: v.donated_on || today(),
          notes: v.notes || null,
        }),
      }),
    onSuccess: () => {
      toast.success("Donation recorded — dashboard totals updated");
      setOpen(false);
      // Dashboard finance cards read the same data, so refresh both.
      void qc.invalidateQueries({ queryKey: ["donations"] });
      void qc.invalidateQueries({ queryKey: ["finance-summary"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = data?.donations ?? [];
  const total = rows.reduce((a, r) => a + Number(r.amount), 0);

  return (
    <>
      <PageHeader
        title="Donations"
        description="Every donation recorded here rolls up into the dashboard automatically."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={rows.length === 0}
              onClick={() =>
                exportTablePdf({
                  title: "Donations report",
                  columns: ["Date", "Donor", "Amount", "Mode", "Purpose", "Receipt"],
                  rows: rows.map((r) => [
                    r.donated_on,
                    r.donor_name,
                    money(r.amount),
                    r.mode,
                    r.purpose ?? "—",
                    r.receipt_number ?? "—",
                  ]),
                  fileName: "donations.pdf",
                })
              }
            >
              <FileDown className="mr-1 h-4 w-4" /> PDF
            </Button>
            <Button disabled={!branchId} onClick={() => setOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Record donation
            </Button>
          </div>
        }
      />

      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        title="Record a donation"
        fields={[
          { name: "donor_name", label: "Donor name", type: "text", required: true },
          { name: "amount", label: "Amount", type: "number", required: true },
          { name: "donated_on", label: "Date", type: "date", required: true },
          {
            name: "mode",
            label: "Mode",
            type: "select",
            options: MODES.map((m) => ({ value: m, label: m.replace(/_/g, " ") })),
          },
          { name: "donor_email", label: "Donor email", type: "email" },
          { name: "donor_phone", label: "Donor phone", type: "tel" },
          { name: "purpose", label: "Purpose", type: "text" },
          { name: "receipt_number", label: "Receipt number", type: "text" },
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
        initial={{ donated_on: today(), mode: "cash" }}
        pending={createMut.isPending}
        onSubmit={(v) => createMut.mutate(v)}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total raised" value={money(total)} tone="success" />
        <StatCard label="Donations" value={rows.length} />
        <StatCard
          label="Average gift"
          value={rows.length ? money(total / rows.length) : money(0)}
        />
      </div>

      {!branchId && (
        <EmptyState title="Select a branch" description="Donations are recorded per branch." />
      )}
      {isPending && <LoadingState />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {data && rows.length === 0 && (
        <EmptyState title="No donations yet" description="Record your first donation to begin." />
      )}

      {rows.length > 0 && (
        <RecordTable
          rows={rows}
          deleteTable="donations"
          deleteLabel="donation"
          columns={[
            { key: "date", header: "Date", cell: (r) => r.donated_on },
            { key: "donor", header: "Donor", cell: (r) => r.donor_name },
            {
              key: "amount",
              header: "Amount",
              className: "font-mono tabular-nums",
              cell: (r) => money(r.amount, r.currency ?? "INR"),
            },
            { key: "mode", header: "Mode", cell: (r) => r.mode.replace(/_/g, " ") },
            { key: "purpose", header: "Purpose", cell: (r) => r.purpose ?? "—" },
            { key: "receipt", header: "Receipt", cell: (r) => r.receipt_number ?? "—" },
            {
              key: "qr",
              header: "",
              className: "text-right",
              cell: (r) => (
                <QrButton
                  value={recordUrl(`/donations?id=${r.id}`)}
                  title={`Receipt · ${r.donor_name}`}
                  subtitle={`${money(r.amount, r.currency ?? "INR")} on ${r.donated_on}`}
                />
              ),
            },
          ]}
        />
      )}
    </>
  );
}
