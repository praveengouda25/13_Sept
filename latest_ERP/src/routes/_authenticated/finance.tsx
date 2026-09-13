import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PageHeader,
  StatCard,
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/data/states";
import { money } from "@/components/data/record-table";
import { useSession } from "@/hooks/use-session";
import { getFinanceDashboard } from "@/lib/modules.functions";
import { exportTablePdf } from "@/lib/pdf";

export const Route = createFileRoute("/_authenticated/finance")({
  head: () => ({
    meta: [
      { title: "Financial dashboard | VISTARX Hostel360" },
      {
        name: "description",
        content:
          "Total and monthly donations, top donors, expenses, balance, category breakdowns and cash flow for your trust.",
      },
      { property: "og:title", content: "Financial dashboard | VISTARX Hostel360" },
      {
        property: "og:description",
        content:
          "Total and monthly donations, top donors, expenses, balance, category breakdowns and cash flow.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FinancePage,
});

const COLORS = [
  "var(--color-accent)",
  "var(--color-primary)",
  "var(--color-info)",
  "var(--color-success)",
  "var(--color-destructive)",
  "var(--color-muted-foreground)",
];

function FinancePage() {
  const { branchId } = useSession();
  const fetchDash = useServerFn(getFinanceDashboard);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["finance-dashboard", branchId],
    queryFn: () => fetchDash({ data: { branchId } }),
  });

  return (
    <>
      <PageHeader
        title="Financial dashboard"
        description="Donations, expenses, balance and cash flow across the branch."
        actions={
          <Button
            variant="outline"
            disabled={!data}
            onClick={() =>
              data &&
              exportTablePdf({
                title: "Financial summary",
                columns: ["Month", "Donations", "Expenses", "Net"],
                rows: data.cashFlow.map((m) => [m.month, m.donations, m.expenses, m.net]),
                fileName: "financial-summary.pdf",
              })
            }
          >
            <FileDown className="mr-1 h-4 w-4" /> Export PDF
          </Button>
        }
      />

      {isPending && <LoadingState />}
      {isError && <ErrorState onRetry={() => void refetch()} />}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              label="Total donations"
              value={money(data.donationsTotal)}
              tone="success"
              hint={`${data.donationsCount} gifts`}
            />
            <StatCard label="This month" value={money(data.donationsThisMonth)} tone="success" />
            <StatCard label="Total expenses" value={money(data.expensesTotal)} tone="accent" />
            <StatCard
              label="Spent this month"
              value={money(data.expensesThisMonth)}
              tone="accent"
            />
            <StatCard label="Balance" value={money(data.balance)} tone="info" />
          </div>

          {data.cashFlow.length === 0 ? (
            <EmptyState
              title="No financial records yet"
              description="Record donations and expenses to see trends, categories and cash flow here."
            />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Cash flow (last 12 months)</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.cashFlow}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="month" fontSize={11} />
                      <YAxis fontSize={11} width={70} />
                      <Tooltip formatter={(v: number) => money(v)} />
                      <Area
                        type="monotone"
                        dataKey="donations"
                        stroke="var(--color-success)"
                        fill="var(--color-success)"
                        fillOpacity={0.18}
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stroke="var(--color-destructive)"
                        fill="var(--color-destructive)"
                        fillOpacity={0.14}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid gap-4 lg:grid-cols-2">
                <CategoryChart title="Donation categories" rows={data.donationCategories} />
                <CategoryChart title="Expense categories" rows={data.expenseCategories} />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Top donors</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.topDonors} layout="vertical" margin={{ left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis type="number" fontSize={11} />
                      <YAxis type="category" dataKey="name" fontSize={11} width={130} />
                      <Tooltip formatter={(v: number) => money(v)} />
                      <Bar dataKey="total" fill="var(--color-accent)" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}

        </>
      )}
    </>
  );
}

function CategoryChart({
  title,
  rows,
}: {
  title: string;
  rows: { name: string; value: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No records yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rows}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label={(e: { name: string }) => e.name}
              >
                {rows.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => money(v)} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
