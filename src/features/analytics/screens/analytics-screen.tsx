"use client";

import { Activity, Droplets, HeartPulse, Scale, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/common/empty-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import {
  analyticsService,
  buildAnalyticsViewModel,
  type AnalyticsChartPoint,
  type AnalyticsRange,
  type AnalyticsRangePreset,
  type AnalyticsViewModel,
} from "@/features/analytics/services/analytics-service";
import type { DialysisSession, Patient } from "@/types/core";

const rangeOptions: Array<{ label: string; value: AnalyticsRangePreset }> = [
  { label: "This month", value: "this-month" },
  { label: "Last 3 months", value: "last-3-months" },
  { label: "Custom", value: "custom" },
];

const chartMargin = { top: 10, right: 16, bottom: 0, left: -18 };

export function AnalyticsScreen() {
  const [patient, setPatient] = useState<Patient>();
  const [sessions, setSessions] = useState<DialysisSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<AnalyticsRange>({ preset: "last-3-months" });

  useEffect(() => {
    let cancelled = false;

    analyticsService
      .getSnapshot()
      .then((snapshot) => {
        if (cancelled) return;
        setPatient(snapshot.patient);
        setSessions(snapshot.sessions);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const analytics = useMemo(() => buildAnalyticsViewModel(sessions, patient, range), [patient, range, sessions]);

  if (loading) {
    return <LoadingState label="Loading analytics..." />;
  }

  if (!patient) {
    return (
      <EmptyState
        description="Set up the patient profile before reviewing trends."
        title="Patient setup needed"
      />
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        description="Review BP, weight, and UF trends from saved sessions. These charts are records only, not medical advice."
        eyebrow="Trends"
        title="Analytics"
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Date range</CardTitle>
            <p className="mt-1 text-sm text-brand-muted">{analytics.rangeLabel}</p>
          </div>
          <Badge tone={analytics.sessions.length ? "success" : "neutral"}>{analytics.sessions.length} sessions</Badge>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Analytics date range">
          {rangeOptions.map((option) => (
            <button
              aria-selected={range.preset === option.value}
              className={`min-h-10 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition ${
                range.preset === option.value
                  ? "bg-brand-primary text-brand-mint"
                  : "bg-white text-brand-muted hover:text-brand-primary"
              }`}
              key={option.value}
              onClick={() => setRange((current) => ({ ...current, preset: option.value }))}
              role="tab"
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>

        {range.preset === "custom" ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <label className="text-sm font-medium text-brand-ink">
              Start date
              <input
                className="mt-1 min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-brand-ink outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                onChange={(event) => setRange((current) => ({ ...current, startDate: event.target.value }))}
                type="date"
                value={range.startDate ?? ""}
              />
            </label>
            <label className="text-sm font-medium text-brand-ink">
              End date
              <input
                className="mt-1 min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-brand-ink outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                onChange={(event) => setRange((current) => ({ ...current, endDate: event.target.value }))}
                type="date"
                value={range.endDate ?? ""}
              />
            </label>
            <Button
              className="self-end"
              onClick={() => setRange({ preset: "last-3-months" })}
              type="button"
              variant="secondary"
            >
              Reset
            </Button>
          </div>
        ) : null}
      </Card>

      <section aria-label="Analytics summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard icon={Droplets} label="Average UF removed" value={analytics.summary.averageUfLabel} />
        <SummaryCard icon={HeartPulse} label="Average pre-HD BP" value={analytics.summary.averagePreBpLabel} />
        <SummaryCard icon={HeartPulse} label="Average post-HD BP" value={analytics.summary.averagePostBpLabel} />
        <SummaryCard icon={Scale} label="Average weight gain" note="Pre-HD weight minus dry weight" value={analytics.summary.averageWeightGainLabel} />
        <SummaryCard icon={TrendingUp} label="Highest UF removed" value={analytics.summary.highestUfLabel} />
        <SummaryCard icon={Activity} label="Lowest post-HD BP" value={analytics.summary.lowestPostBpLabel} />
      </section>

      {!analytics.sessions.length ? (
        <EmptyState
          description="No saved sessions match this date range. Try another range or add new dialysis sessions."
          title="No analytics data for this range"
        />
      ) : null}

      {analytics.sessions.length && !analytics.hasEnoughChartData ? (
        <EmptyState
          description="At least two sessions are needed to draw a meaningful trend line. The summary cards above still reflect the selected session."
          title="Not enough sessions for charts"
        />
      ) : null}

      {analytics.hasEnoughChartData ? <Charts analytics={analytics} /> : null}

      <p className="rounded-lg border border-brand-border bg-brand-neutral p-3 text-xs leading-5 text-brand-muted">
        DialyCare is a personal record-tracking tool. It does not provide medical advice, diagnosis, or treatment. Always consult your nephrologist or dialysis care team for medical decisions.
      </p>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  note,
  value,
}: {
  icon: typeof Droplets;
  label: string;
  note?: string;
  value: string;
}) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="rounded-lg bg-brand-mint p-2 text-brand-primary">
          <Icon aria-hidden="true" size={20} />
        </span>
        <div>
          <p className="text-sm text-brand-muted">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-brand-ink">{value}</p>
          {note ? <p className="mt-1 text-xs leading-5 text-brand-muted">{note}</p> : null}
        </div>
      </div>
    </Card>
  );
}

function Charts({ analytics }: { analytics: AnalyticsViewModel }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <TrendChart
        data={analytics.chartPoints}
        lines={[
          { dataKey: "preWeightKg", name: "Pre-HD weight", stroke: "#0F6E56" },
          { dataKey: "postWeightKg", name: "Post-HD weight", stroke: "#5DCAA5" },
        ]}
        title="Weight trend"
        unit="kg"
      />
      <TrendChart
        data={analytics.chartPoints}
        lines={[{ dataKey: "ufRemovedLiters", name: "UF removed", stroke: "#D85A30" }]}
        title="UF removed trend"
        unit="L"
      />
      <TrendChart
        data={analytics.chartPoints}
        lines={[
          { dataKey: "preBpSystolic", name: "Systolic", stroke: "#0F6E56" },
          { dataKey: "preBpDiastolic", name: "Diastolic", stroke: "#5DCAA5" },
        ]}
        title="Pre-HD BP trend"
        unit="mmHg"
      />
      <TrendChart
        data={analytics.chartPoints}
        lines={[
          { dataKey: "postBpSystolic", name: "Systolic", stroke: "#0F6E56" },
          { dataKey: "postBpDiastolic", name: "Diastolic", stroke: "#5DCAA5" },
        ]}
        title="Post-HD BP trend"
        unit="mmHg"
      />
    </div>
  );
}

function TrendChart({
  data,
  lines,
  title,
  unit,
}: {
  data: AnalyticsChartPoint[];
  lines: Array<{ dataKey: keyof AnalyticsChartPoint; name: string; stroke: string }>;
  title: string;
  unit: string;
}) {
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={data} margin={chartMargin}>
            <CartesianGrid stroke="#E5E2D8" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" minTickGap={18} stroke="#5F6B66" tick={{ fontSize: 12 }} tickLine={false} />
            <YAxis stroke="#5F6B66" tick={{ fontSize: 12 }} tickLine={false} unit={unit === "mmHg" ? "" : unit} />
            <Tooltip
              contentStyle={{
                borderColor: "#E5E2D8",
                borderRadius: 8,
                boxShadow: "0 10px 30px rgba(15, 110, 86, 0.08)",
              }}
              formatter={(value, name) => [`${Number(value).toLocaleString("en-IN")} ${unit}`, String(name)]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ""}
            />
            <Legend wrapperStyle={{ paddingTop: 8 }} />
            {lines.map((line) => (
              <Line
                activeDot={{ r: 5 }}
                dataKey={line.dataKey}
                dot={{ r: 3 }}
                key={String(line.dataKey)}
                name={line.name}
                stroke={line.stroke}
                strokeWidth={2.5}
                type="monotone"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
