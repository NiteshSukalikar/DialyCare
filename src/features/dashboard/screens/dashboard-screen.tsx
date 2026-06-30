"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarPlus, FileText, Pill, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { EmptyAction, EmptyState } from "@/components/common/empty-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { SessionRepository } from "@/data/repositories";
import { patientSetupService } from "@/features/patient/services/patient-setup-service";
import { calculateWeightGainVsDryKg } from "@/features/sessions/utils/session-calculations";
import type { DialysisSession, Dialyzer, Patient } from "@/types/core";

const quickActions = [
  { href: "/add-session", label: "Add session", icon: CalendarPlus },
  { href: "/documents", label: "Add report", icon: FileText },
  { href: "/medicines", label: "Add medicine", icon: Pill },
  { href: "/backup", label: "Export backup", icon: ShieldCheck },
] as const;

export function DashboardScreen() {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | undefined>();
  const [activeDialyzer, setActiveDialyzer] = useState<Dialyzer | undefined>();
  const [latestSession, setLatestSession] = useState<DialysisSession | undefined>();
  const [loading, setLoading] = useState(true);
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setSetupComplete(new URLSearchParams(window.location.search).get("setup") === "complete");

    patientSetupService
      .getSnapshot()
      .then(async (snapshot) => {
        if (cancelled) return;

        if (!snapshot.patient) {
          router.replace("/patient-setup");
          return;
        }

        const latest = await new SessionRepository().getLatest(snapshot.patient.id);
        if (cancelled) return;

        setPatient(snapshot.patient);
        setActiveDialyzer(snapshot.activeDialyzer);
        setLatestSession(latest);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading || !patient) {
    return <LoadingState label="Loading dashboard..." />;
  }

  const stats = [
    {
      label: "Last dialysis",
      value: latestSession?.date ?? "No sessions",
      note: latestSession?.sessionTime ? `Session time ${latestSession.sessionTime}` : "Add the latest visit after dialysis",
    },
    {
      label: "Current weight",
      value: latestSession ? `${latestSession.postWeightKg} kg` : "--",
      note: latestSession ? "Latest post-HD weight" : "Appears after first session",
    },
    { label: "Dry weight", value: `${patient.dryWeightKg} kg`, note: patient.dialysisFrequency ?? "Frequency not set" },
    {
      label: "Weight gain",
      value: latestSession ? `${calculateWeightGainVsDryKg(latestSession.preWeightKg, patient.dryWeightKg)} kg` : "--",
      note: "Latest pre-HD weight minus dry weight",
    },
    {
      label: "Dialyzer",
      value: activeDialyzer ? activeDialyzer.name : "Not set",
      note: activeDialyzer ? `Usage ${activeDialyzer.currentUsage} / ${activeDialyzer.maxUsage}` : "Add from patient setup when ready",
    },
  ];

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
        description="Use quick session entry after every dialysis visit. DialyCare stores records locally on this device."
        eyebrow="Home"
        title={`Good morning, ${patient.name.split(" ")[0] ?? "caregiver"}`}
      />

      {setupComplete ? (
        <div className="rounded-lg border border-brand-primary/20 bg-brand-mint p-4 text-sm text-brand-primary" role="status">
          Patient setup is complete. You can start tracking dialysis sessions now.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
          <Badge tone="success">Ready</Badge>
        </div>
        {latestSession ? (
          <div className="mt-4 grid gap-3 text-sm text-brand-muted sm:grid-cols-3">
            <p>
              <span className="block font-medium text-brand-ink">Weight</span>
              {latestSession.preWeightKg} to {latestSession.postWeightKg} kg
            </p>
            <p>
              <span className="block font-medium text-brand-ink">BP</span>
              {latestSession.preBpSystolic}/{latestSession.preBpDiastolic} to {latestSession.postBpSystolic}/{latestSession.postBpDiastolic}
            </p>
            <p>
              <span className="block font-medium text-brand-ink">UF removed</span>
              {latestSession.ufRemovedLiters} L
            </p>
          </div>
        ) : (
          <EmptyState
            action={
              <Link href="/add-session">
                <EmptyAction>Add first session</EmptyAction>
              </Link>
            }
            description="No session summary is available yet. Add the first dialysis session to start building history."
            title="Start daily tracking"
          />
        )}
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
