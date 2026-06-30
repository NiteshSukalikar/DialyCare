"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { EmptyAction, EmptyState } from "@/components/common/empty-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { PatientRepository } from "@/data/repositories";
import { sessionEntryService } from "@/features/sessions/services/session-entry-service";
import { calculateWeightLossKg } from "@/features/sessions/utils/session-calculations";
import type { DialysisSession } from "@/types/core";

function formatSessionDate(session: DialysisSession) {
  const time = session.sessionTime ? ` at ${session.sessionTime}` : "";
  return `${session.date}${time}`;
}

export function HistoryScreen() {
  const [sessions, setSessions] = useState<DialysisSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const sessionStatus = new URLSearchParams(window.location.search).get("session");
    setStatusMessage(
      sessionStatus === "saved" ? "Dialysis session saved." : sessionStatus === "deleted" ? "Dialysis session deleted." : null,
    );

    async function load() {
      const patient = await new PatientRepository().getPrimaryPatient();
      if (!patient) {
        if (!cancelled) setSessions([]);
        return;
      }

      const savedSessions = await sessionEntryService.listSessions(patient.id);
      if (!cancelled) setSessions(savedSessions);
    }

    load().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <LoadingState label="Loading session history..." />;
  }

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
        description="Saved dialysis records appear newest first for quick review and corrections."
        eyebrow="Records"
        title="Session history"
      />

      {statusMessage ? (
        <div className="rounded-lg border border-brand-primary/20 bg-brand-mint p-4 text-sm text-brand-primary" role="status">
          {statusMessage}
        </div>
      ) : null}

      {sessions.length === 0 ? (
        <Card>
          <EmptyState
            action={
              <Link href="/add-session">
                <EmptyAction>Add first session</EmptyAction>
              </Link>
            }
            description="Saved sessions will appear here newest first. Add a dialysis session to start building the booklet history."
            title="No dialysis sessions yet"
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const weightLossKg = calculateWeightLossKg(session.preWeightKg, session.postWeightKg);

            return (
              <Card key={session.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle>{formatSessionDate(session)}</CardTitle>
                      <Badge tone="neutral">UF {session.ufRemovedLiters} L</Badge>
                    </div>
                    <dl className="mt-3 grid gap-2 text-sm text-brand-muted sm:grid-cols-2">
                      <div>
                        <dt className="font-medium text-brand-ink">Weight</dt>
                        <dd>
                          {session.preWeightKg} to {session.postWeightKg} kg
                          {weightLossKg !== undefined ? ` (${weightLossKg} kg loss)` : ""}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-brand-ink">BP</dt>
                        <dd>
                          {session.preBpSystolic}/{session.preBpDiastolic} to {session.postBpSystolic}/{session.postBpDiastolic}
                        </dd>
                      </div>
                      {session.dialyzerUseNumber !== undefined ? (
                        <div>
                          <dt className="font-medium text-brand-ink">Dialyzer use</dt>
                          <dd>Use #{session.dialyzerUseNumber}</dd>
                        </div>
                      ) : null}
                      {session.remarks ? (
                        <div>
                          <dt className="font-medium text-brand-ink">Remarks</dt>
                          <dd>{session.remarks}</dd>
                        </div>
                      ) : null}
                    </dl>
                  </div>
                  <Link
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-mint px-4 py-2.5 text-sm font-semibold text-brand-primary transition hover:bg-[#D3EFE5]"
                    href={`/add-session?sessionId=${session.id}`}
                  >
                    Edit
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
