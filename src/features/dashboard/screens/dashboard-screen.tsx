import Link from "next/link";
import { CalendarPlus, FileText, Pill, ShieldCheck } from "lucide-react";

import { EmptyAction, EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "Current weight", value: "-- kg", note: "Add a session to calculate", tone: "neutral" },
  { label: "Dry weight", value: "-- kg", note: "Set in patient setup", tone: "neutral" },
  { label: "Dialyzer", value: "Not set", note: "Current usage will show here", tone: "success" },
] as const;

const quickActions = [
  { href: "/add-session", label: "Add session", icon: CalendarPlus },
  { href: "/documents", label: "Add report", icon: FileText },
  { href: "/medicines", label: "Add medicine", icon: Pill },
  { href: "/backup", label: "Export backup", icon: ShieldCheck },
] as const;

export function DashboardScreen() {
  return (
    <div className="space-y-5">
      <PageHeader
        action={
          <Link
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-brand-mint shadow-soft transition hover:bg-[#0B5D49] sm:w-auto"
            href="/add-session"
          >
            Add session
          </Link>
        }
        description="Start with patient setup, then use quick session entry after every dialysis visit."
        eyebrow="Home"
        title="Good morning"
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-brand-muted">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-brand-ink">{stat.value}</p>
            <p className="mt-1 text-xs text-brand-muted">{stat.note}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Next best action</CardTitle>
          <Badge tone="success">MVP setup</Badge>
        </div>
        <EmptyState
          action={
            <Link href="/patient-setup">
              <EmptyAction>Create patient profile</EmptyAction>
            </Link>
          }
          description="No patient is configured yet. Create the one patient profile before adding dialysis sessions."
          title="Set up patient once"
        />
      </Card>

      <section>
        <h2 className="mb-3 text-base font-semibold text-brand-ink">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                className="flex min-h-20 items-center gap-3 rounded-xl border border-brand-border bg-white p-4 text-brand-ink transition hover:border-brand-primary hover:text-brand-primary"
                href={action.href}
                key={action.href}
              >
                <span className="rounded-lg bg-brand-mint p-2 text-brand-primary">
                  <Icon aria-hidden="true" size={20} />
                </span>
                <span className="font-semibold">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
