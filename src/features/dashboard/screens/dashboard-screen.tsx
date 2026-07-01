"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, CalendarPlus, FileText, Pill, Scale, ShieldCheck, Stethoscope, Weight } from "lucide-react";
import { useEffect, useState } from "react";

import { EmptyAction, EmptyState } from "@/components/common/empty-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buildDashboardViewModel, dashboardService, type DashboardViewModel } from "@/features/dashboard/services/dashboard-service";
import { calculateWeightGainSinceLastPostHdKg, getSessionWeightLossKg } from "@/features/sessions/utils/session-calculations";

const quickActions = [
  { href: "/add-session", label: "Add session", icon: CalendarPlus, primary: true },
  { href: "/documents", label: "Add report", icon: FileText },
  { href: "/medicines", label: "Add medicine", icon: Pill },
  { href: "/backup", label: "Export backup", icon: ShieldCheck },
] as const;

export function DashboardScreen() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardViewModel>();
  const [loading, setLoading] = useState(true);
  const [setupComplete, setSetupComplete] = useState(false);
  const [currentWeightInput, setCurrentWeightInput] = useState("");

  useEffect(() => {
    let cancelled = false;

    setSetupComplete(new URLSearchParams(window.location.search).get("setup") === "complete");

    dashboardService
      .getSnapshot()
      .then((snapshot) => {
        if (cancelled) return;

        if (!snapshot.patient) {
          router.replace("/patient-setup");
          return;
        }

        setDashboard(buildDashboardViewModel(snapshot));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading || !dashboard?.patient) {
    return <LoadingState label="Loading dashboard..." />;
  }

  const { activeDialyzer, latestSession, patient } = dashboard;
  const firstName = patient.name.split(" ")[0] || "caregiver";
  const enteredCurrentWeightKg = Number(currentWeightInput);
  const weightGainSinceLastPostHd =
    latestSession && currentWeightInput.trim()
      ? calculateWeightGainSinceLastPostHdKg(enteredCurrentWeightKg, latestSession.postWeightKg)
      : undefined;
  const weightGainResultTone = weightGainSinceLastPostHd !== undefined && weightGainSinceLastPostHd > 0 ? "warning" : "neutral";

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
        description={`Last dialysis: ${dashboard.lastDialysisLabel}. Records stay local on this device.`}
        eyebrow="Home"
        title={`Good morning, ${firstName}`}
      />

      {setupComplete ? (
        <div className="rounded-lg border border-brand-primary/20 bg-brand-mint p-4 text-sm text-brand-primary" role="status">
          Patient setup is complete. You can start tracking dialysis sessions now.
        </div>
      ) : null}

      {!latestSession ? (
        <EmptyState
          action={
            <Link href="/add-session">
              <EmptyAction>Add first session</EmptyAction>
            </Link>
          }
          description="Add the first dialysis session to unlock latest weight, dialyzer usage, next-session estimate, and recent history."
          title="Dashboard is ready for the first record"
        />
      ) : null}

      <section aria-label="Current dialysis status" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatusCard
          icon={Weight}
          label="Current weight"
          note={latestSession ? "Latest post-HD weight" : "Appears after first session"}
          value={dashboard.currentWeightLabel}
        />
        <StatusCard
          icon={Scale}
          label="Dry weight"
          note={patient.dialysisFrequency ?? "Frequency not set"}
          value={dashboard.dryWeightLabel}
        />
        <StatusCard
          icon={Stethoscope}
          label="Weight difference"
          note="Latest post-HD weight minus dry weight"
          tone={dashboard.weightDifferenceTone}
          value={dashboard.weightDifferenceLabel}
        />
        <StatusCard
          icon={CalendarDays}
          label="Next dialysis"
          note={dashboard.nextDialysisNote}
          value={dashboard.nextDialysisLabel}
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.7fr)]">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Current dialyzer</CardTitle>
              <p className="mt-1 text-sm text-brand-muted">Usage status for the active dialyzer.</p>
            </div>
            <Badge tone={dashboard.dialyzerStatusTone}>{dashboard.dialyzerStatusLabel}</Badge>
          </div>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-brand-muted">Dialyzer</p>
              <p className="mt-1 text-2xl font-semibold text-brand-ink">{dashboard.dialyzerNameLabel}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-brand-muted">Usage</p>
              <p className="mt-1 text-2xl font-semibold text-brand-ink">{dashboard.dialyzerUsageLabel}</p>
            </div>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-brand-neutral" aria-label={`Dialyzer usage ${dashboard.dialyzerUsageLabel}`}>
            <div
              className={`h-full rounded-full ${dashboard.dialyzerStatusTone === "warning" ? "bg-brand-alert" : "bg-brand-primary"}`}
              style={{ width: `${dashboard.dialyzerUsagePercent}%` }}
            />
          </div>

          <p className="mt-3 text-xs text-brand-muted">
            {activeDialyzer?.lastUsedDate ? `Last used on ${activeDialyzer.lastUsedDate}.` : "Last used date appears after session save."}
          </p>

          <div className="mt-6 lg:mt-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-brand-ink">All-session analytics</p>
                <p className="mt-1 text-xs text-brand-muted">Quick averages from saved records.</p>
              </div>
              <Badge tone="success">All time</Badge>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-1">
              <AnalyticsMiniStat label="Avg pre-HD weight" value={dashboard.averagePreHdWeightLabel} />
              <AnalyticsMiniStat label="Avg post-HD weight" value={dashboard.averagePostHdWeightLabel} />
              <AnalyticsMiniStat label="Avg UF removed" value={dashboard.averageUfRemovedLabel} />
              <AnalyticsMiniStat label="Avg dialyzer use" value={dashboard.averageDialyzerUseCountLabel} />
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Weight calculator</CardTitle>
                <p className="mt-1 text-sm text-brand-muted">Current weight minus last post-HD weight.</p>
              </div>
              <Badge tone={weightGainResultTone === "warning" ? "warning" : "success"}>{latestSession ? "Ready" : "Needs session"}</Badge>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(140px,0.7fr)] lg:grid-cols-1">
              <Input
                disabled={!latestSession}
                inputMode="decimal"
                label="Current weight"
                min="0"
                onChange={(event) => setCurrentWeightInput(event.target.value)}
                placeholder="Enter kg"
                step="0.1"
                type="number"
                value={currentWeightInput}
              />
              <div
                className={`rounded-lg border p-3 ${
                  weightGainResultTone === "warning"
                    ? "border-brand-alert/25 bg-brand-alert/10 text-brand-alert"
                    : "border-brand-primary/20 bg-brand-mint text-brand-primary"
                }`}
              >
                <p className="text-xs font-medium uppercase tracking-wide">Gain since last HD</p>
                <p className="mt-1 text-2xl font-semibold">
                  {weightGainSinceLastPostHd === undefined ? "--" : `${weightGainSinceLastPostHd > 0 ? "+" : ""}${weightGainSinceLastPostHd} kg`}
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs leading-5 text-brand-muted">
              {latestSession
                ? `Using last post-HD weight: ${latestSession.postWeightKg} kg from ${dashboard.lastDialysisLabel}.`
                : "Add a dialysis session first to use the last post-HD weight."}
            </p>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Quick actions</CardTitle>
              <Badge tone="success">Ready</Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    className={`flex min-h-14 items-center gap-3 rounded-lg border p-3 font-semibold transition ${
                      "primary" in action && action.primary
                        ? "border-brand-primary bg-brand-mint text-brand-primary hover:bg-[#D3EFE5]"
                        : "border-brand-border bg-white text-brand-ink hover:border-brand-primary hover:text-brand-primary"
                    }`}
                    href={action.href}
                    key={action.href}
                  >
                    <Icon aria-hidden="true" size={20} />
                    <span>{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Recent session</CardTitle>
          {latestSession ? (
            <Link className="text-sm font-semibold text-brand-primary hover:underline" href="/history">
              View history
            </Link>
          ) : null}
        </div>

        {latestSession ? (
          <div className="mt-4 grid gap-3 text-sm text-brand-muted sm:grid-cols-2 lg:grid-cols-4">
            <SummaryItem label="Date" value={dashboard.lastDialysisLabel} />
            <SummaryItem label="Weight" value={`${latestSession.preWeightKg} to ${latestSession.postWeightKg} kg`} />
            <SummaryItem label="Weight loss" value={`${getSessionWeightLossKg(latestSession) ?? "--"} kg`} />
            <SummaryItem
              label="BP"
              value={`${latestSession.preBpSystolic}/${latestSession.preBpDiastolic} to ${latestSession.postBpSystolic}/${latestSession.postBpDiastolic}`}
            />
            <SummaryItem label="UF removed" value={`${latestSession.ufRemovedLiters} L`} />
            <SummaryItem label="Dialyzer use" value={latestSession.dialyzerUseNumber ? `Use #${latestSession.dialyzerUseNumber}` : "Not recorded"} />
            <SummaryItem label="Remarks" value={latestSession.remarks || "No remarks"} />
          </div>
        ) : (
          <EmptyState
            action={
              <Link href="/add-session">
                <EmptyAction>Add first session</EmptyAction>
              </Link>
            }
            description="No session summary is available yet. Add a dialysis session to start building history."
            title="No recent session"
          />
        )}
      </Card>
    </div>
  );
}

function StatusCard({
  icon: Icon,
  label,
  note,
  tone = "neutral",
  value,
}: {
  icon: typeof Weight;
  label: string;
  note: string;
  tone?: "neutral" | "warning";
  value: string;
}) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className={`rounded-lg p-2 ${tone === "warning" ? "bg-brand-alert/10 text-brand-alert" : "bg-brand-mint text-brand-primary"}`}>
          <Icon aria-hidden="true" size={20} />
        </span>
        <div>
          <p className="text-sm text-brand-muted">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-brand-ink">{value}</p>
          <p className="mt-1 text-xs leading-5 text-brand-muted">{note}</p>
        </div>
      </div>
    </Card>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="block font-medium text-brand-ink">{label}</span>
      {value}
    </p>
  );
}

function AnalyticsMiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-brand-border bg-white/60 p-3">
      <p className="text-xs font-medium text-brand-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold text-brand-ink">{value}</p>
    </div>
  );
}
