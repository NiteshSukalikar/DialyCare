"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { EmptyAction, EmptyState } from "@/components/common/empty-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PatientRepository } from "@/data/repositories";
import { sessionEntryService } from "@/features/sessions/services/session-entry-service";
import {
  calculateUfVarianceFromWeightLossLiters,
  getSessionWeightLossKg,
} from "@/features/sessions/utils/session-calculations";
import {
  buildSessionCalendar,
  filterSessions,
  groupSessionsByMonth,
  matchesSessionSearch,
  type SessionHistoryFilter,
} from "@/features/sessions/utils/session-history";
import type { DialysisSession } from "@/types/core";

const filters: { value: SessionHistoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "last-3-months", label: "Last 3 months" },
  { value: "custom", label: "Custom date" },
  { value: "high-uf", label: "High UF" },
  { value: "high-pre-bp", label: "High pre-BP" },
  { value: "low-post-bp", label: "Low post-BP" },
  { value: "with-dialyzer", label: "With dialyzer" },
];

function formatSessionDate(session: DialysisSession) {
  const time = session.sessionTime ? ` at ${session.sessionTime}` : "";
  return `${session.date}${time}`;
}

function bpLabel(session: DialysisSession) {
  return `${session.preBpSystolic}/${session.preBpDiastolic} to ${session.postBpSystolic}/${session.postBpDiastolic}`;
}

function DetailRow({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined || value === "") return null;

  return (
    <div>
      <dt className="text-sm font-medium text-brand-muted">{label}</dt>
      <dd className="mt-1 text-sm text-brand-ink">{value}</dd>
    </div>
  );
}

export function HistoryScreen() {
  const [sessions, setSessions] = useState<DialysisSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<SessionHistoryFilter>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedSession, setSelectedSession] = useState<DialysisSession | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

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

  const filteredSessions = filterSessions(sessions, activeFilter, new Date(), {
    from: customFrom || undefined,
    to: customTo || undefined,
  }).filter((session) => matchesSessionSearch(session, searchQuery));
  const groupedSessions = groupSessionsByMonth(filteredSessions);
  const calendarDays = buildSessionCalendar(sessions, calendarMonth);

  async function handleDeleteSession(session: DialysisSession) {
    if (!window.confirm("Delete this dialysis session? This cannot be undone.")) return;

    setDeletingSessionId(session.id);
    try {
      await sessionEntryService.deleteSession(session.id);
      setSessions((current) => current.filter((item) => item.id !== session.id));
      setSelectedSession(null);
      setStatusMessage("Dialysis session deleted.");
    } finally {
      setDeletingSessionId(null);
    }
  }

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

      <Card className="space-y-4">
        <Input
          label="Search records"
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search notes, hospital, BP, UF, date..."
          type="search"
          value={searchQuery}
        />
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Session history filters">
          {filters.map((filter) => (
            <button
              aria-selected={activeFilter === filter.value}
              className={`min-h-10 whitespace-nowrap rounded-full px-3 text-sm font-semibold ${
                activeFilter === filter.value ? "bg-brand-primary text-brand-mint" : "bg-brand-neutral text-brand-muted"
              }`}
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              role="tab"
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
        {activeFilter === "custom" ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Input label="From date" onChange={(event) => setCustomFrom(event.target.value)} type="date" value={customFrom} />
            <Input label="To date" onChange={(event) => setCustomTo(event.target.value)} type="date" value={customTo} />
          </div>
        ) : null}
      </Card>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>Calendar view</CardTitle>
            <p className="mt-1 text-sm text-brand-muted">Monthly review of saved dialysis days.</p>
          </div>
          <Input
            className="sm:w-48"
            label="Calendar month"
            onChange={(event) => setCalendarMonth(event.target.value)}
            type="month"
            value={calendarMonth}
          />
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-brand-muted">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const firstDate = new Date(`${calendarMonth}-01T00:00:00`);
            const offset = firstDate.getDay() === 0 ? 6 : firstDate.getDay() - 1;
            const hasSessions = day.sessions.length > 0;

            return (
              <button
                className={`min-h-14 rounded-lg border p-1 text-left text-sm transition ${
                  hasSessions
                    ? "border-brand-primary bg-brand-mint text-brand-primary"
                    : "border-brand-border bg-white text-brand-muted hover:bg-brand-neutral"
                }`}
                key={day.date}
                onClick={() => {
                  setActiveFilter("custom");
                  setCustomFrom(day.date);
                  setCustomTo(day.date);
                }}
                style={index === 0 ? { gridColumnStart: offset + 1 } : undefined}
                type="button"
              >
                <span className="font-semibold">{day.dayNumber}</span>
                {hasSessions ? <span className="mt-1 block text-xs">{day.sessions.length} session{day.sessions.length > 1 ? "s" : ""}</span> : null}
              </button>
            );
          })}
        </div>
      </Card>

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
      ) : filteredSessions.length === 0 ? (
        <Card>
          <EmptyState
            description="Try a wider date range or switch back to all sessions."
            title="No sessions match this filter"
          />
        </Card>
      ) : (
        <div className="space-y-5">
          {groupedSessions.map((group) => (
            <section className="space-y-3" key={group.monthKey}>
              <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-brand-muted">{group.label}</h2>
              {group.sessions.map((session) => {
                const weightLossKg = getSessionWeightLossKg(session);
                const ufVariance = calculateUfVarianceFromWeightLossLiters(weightLossKg, session.ufRemovedLiters);

                return (
                  <Card
                    className="cursor-pointer transition hover:border-brand-primary/40 focus:outline-none focus:ring-4 focus:ring-brand-mint"
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedSession(session);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
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
                            <dd>{bpLabel(session)}</dd>
                          </div>
                          {ufVariance !== undefined ? (
                            <div>
                              <dt className="font-medium text-brand-ink">UF variance</dt>
                              <dd>{ufVariance > 0 ? "+" : ""}{ufVariance} L vs weight loss</dd>
                            </div>
                          ) : null}
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
                      <span className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-mint px-4 py-2.5 text-sm font-semibold text-brand-primary">
                        View details
                      </span>
                    </div>
                  </Card>
                );
              })}
            </section>
          ))}
        </div>
      )}

      {selectedSession ? (
        <Card className="border-brand-primary/30">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Session details</CardTitle>
              <p className="mt-1 text-sm text-brand-muted">{formatSessionDate(selectedSession)}</p>
            </div>
            <Button onClick={() => setSelectedSession(null)} type="button" variant="ghost">
              Close
            </Button>
          </div>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <DetailRow label="Pre-HD weight" value={`${selectedSession.preWeightKg} kg`} />
            <DetailRow label="Post-HD weight" value={`${selectedSession.postWeightKg} kg`} />
            <DetailRow
              label="Weight loss"
              value={
                getSessionWeightLossKg(selectedSession) === undefined
                  ? undefined
                  : `${getSessionWeightLossKg(selectedSession)} kg`
              }
            />
            <DetailRow label="Pre-HD BP" value={`${selectedSession.preBpSystolic}/${selectedSession.preBpDiastolic}`} />
            <DetailRow label="Post-HD BP" value={`${selectedSession.postBpSystolic}/${selectedSession.postBpDiastolic}`} />
            <DetailRow label="UF removed" value={`${selectedSession.ufRemovedLiters} L`} />
            <DetailRow
              label="UF variance"
              value={
                calculateUfVarianceFromWeightLossLiters(getSessionWeightLossKg(selectedSession), selectedSession.ufRemovedLiters) === undefined
                  ? undefined
                  : `${calculateUfVarianceFromWeightLossLiters(getSessionWeightLossKg(selectedSession), selectedSession.ufRemovedLiters)} L vs weight loss`
              }
            />
            <DetailRow label="Dialyzer use" value={selectedSession.dialyzerUseNumber ? `Use #${selectedSession.dialyzerUseNumber}` : undefined} />
            <DetailRow label="Hospital" value={selectedSession.hospital} />
            <DetailRow label="Doctor" value={selectedSession.doctor} />
            <DetailRow label="Complications" value={selectedSession.complications} />
            <DetailRow label="Injections given" value={selectedSession.injectionsGiven} />
            <DetailRow label="Medicine changes" value={selectedSession.medicineChanges} />
            <DetailRow label="Machine notes" value={selectedSession.machineNotes} />
            <DetailRow label="Remarks" value={selectedSession.remarks} />
          </dl>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg bg-brand-mint px-4 py-2.5 text-sm font-semibold text-brand-primary transition hover:bg-[#D3EFE5]"
              href={`/add-session?sessionId=${selectedSession.id}`}
            >
              Edit session
            </Link>
            <Button
              className="flex-1"
              disabled={deletingSessionId === selectedSession.id}
              onClick={() => handleDeleteSession(selectedSession)}
              type="button"
              variant="danger"
            >
              {deletingSessionId === selectedSession.id ? "Deleting..." : "Delete session"}
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
