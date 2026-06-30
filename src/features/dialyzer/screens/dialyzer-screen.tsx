"use client";

import { Archive, Plus, Save } from "lucide-react";
import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { dialyzerService, type DialyzerSnapshot, type DialyzerWithSessionCount } from "@/features/dialyzer/services/dialyzer-service";
import {
  getDialyzerStatusLabel,
  getDialyzerUsagePercent,
  getDialyzerUsageState,
} from "@/features/dialyzer/utils/dialyzer-status";

interface DialyzerFormState {
  name: string;
  startedOn: string;
  currentUsage: string;
  maxUsage: string;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

const emptyForm: DialyzerFormState = {
  name: "",
  startedOn: today(),
  currentUsage: "0",
  maxUsage: "12",
};

function formatDate(date?: string) {
  return date || "Not recorded";
}

function buildFormFromDialyzer(dialyzer: DialyzerWithSessionCount): DialyzerFormState {
  return {
    name: dialyzer.name,
    startedOn: dialyzer.startedOn,
    currentUsage: dialyzer.currentUsage.toString(),
    maxUsage: dialyzer.maxUsage.toString(),
  };
}

function UsageProgress({ dialyzer }: { dialyzer: DialyzerWithSessionCount }) {
  const percent = getDialyzerUsagePercent(dialyzer);
  const state = getDialyzerUsageState(dialyzer);
  const barClass = state === "max-reached" ? "bg-brand-alert" : state === "warning" ? "bg-[#F59E0B]" : "bg-brand-primary";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-brand-muted">Usage</span>
        <span className="font-semibold text-brand-ink">
          {dialyzer.currentUsage} / {dialyzer.maxUsage}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-brand-neutral" aria-label={`Dialyzer usage ${percent}%`}>
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function DialyzerSummary({ dialyzer }: { dialyzer: DialyzerWithSessionCount }) {
  const state = getDialyzerUsageState(dialyzer);
  const tone = state === "normal" ? "success" : "warning";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{dialyzer.name}</CardTitle>
            <Badge tone={tone}>{getDialyzerStatusLabel(dialyzer)}</Badge>
          </div>
          <p className="mt-1 text-sm text-brand-muted">Started {formatDate(dialyzer.startedOn)}</p>
        </div>
        <div className="rounded-lg bg-brand-neutral px-3 py-2 text-sm font-semibold text-brand-ink">
          {dialyzer.sessionCount} linked session{dialyzer.sessionCount === 1 ? "" : "s"}
        </div>
      </div>

      <UsageProgress dialyzer={dialyzer} />

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-brand-muted">Last used</dt>
          <dd className="mt-1 text-brand-ink">{formatDate(dialyzer.lastUsedDate)}</dd>
        </div>
        <div>
          <dt className="font-medium text-brand-muted">Status</dt>
          <dd className="mt-1 capitalize text-brand-ink">{dialyzer.status}</dd>
        </div>
      </dl>
    </div>
  );
}

export function DialyzerScreen() {
  const [snapshot, setSnapshot] = useState<DialyzerSnapshot>({ archivedDialyzers: [] });
  const [form, setForm] = useState<DialyzerFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [editingActive, setEditingActive] = useState(true);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function loadSnapshot() {
    const nextSnapshot = await dialyzerService.getSnapshot();
    setSnapshot(nextSnapshot);
    if (nextSnapshot.activeDialyzer) {
      setForm(buildFormFromDialyzer(nextSnapshot.activeDialyzer));
      setEditingActive(true);
    } else {
      setForm(emptyForm);
      setEditingActive(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    dialyzerService
      .getSnapshot()
      .then((nextSnapshot) => {
        if (cancelled) return;
        setSnapshot(nextSnapshot);
        if (nextSnapshot.activeDialyzer) {
          setForm(buildFormFromDialyzer(nextSnapshot.activeDialyzer));
          setEditingActive(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function updateField(field: keyof DialyzerFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startNewDialyzer() {
    setForm({ ...emptyForm, startedOn: today() });
    setEditingActive(false);
    setFormErrors([]);
    setStatusMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!snapshot.patient) return;

    const currentUsage = Number.parseInt(form.currentUsage, 10);
    const maxUsage = Number.parseInt(form.maxUsage, 10);
    const nextErrors: string[] = [];

    if (!form.name.trim()) nextErrors.push("Dialyzer name is required.");
    if (!form.startedOn) nextErrors.push("Start date is required.");
    if (!Number.isInteger(currentUsage)) nextErrors.push("Current usage must be a whole number.");
    if (!Number.isInteger(maxUsage)) nextErrors.push("Max usage must be a whole number.");
    if (Number.isInteger(currentUsage) && Number.isInteger(maxUsage) && currentUsage > maxUsage) {
      nextErrors.push("Current usage cannot exceed max usage.");
    }

    setFormErrors(nextErrors);
    if (nextErrors.length > 0) return;

    setSaving(true);
    try {
      await dialyzerService.saveDialyzer(
        snapshot.patient.id,
        {
          name: form.name.trim(),
          startedOn: form.startedOn,
          currentUsage,
          maxUsage,
        },
        editingActive ? snapshot.activeDialyzer?.id : undefined,
      );
      await loadSnapshot();
      setStatusMessage(editingActive ? "Active dialyzer updated." : "New active dialyzer saved.");
    } catch (error) {
      setFormErrors([error instanceof Error ? error.message : "Could not save dialyzer."]);
    } finally {
      setSaving(false);
    }
  }

  async function handleArchiveActive() {
    if (!snapshot.activeDialyzer) return;
    if (!window.confirm("Archive the active dialyzer? Past sessions will remain linked to it.")) return;

    setArchiving(true);
    try {
      await dialyzerService.archiveDialyzer(snapshot.activeDialyzer.id);
      await loadSnapshot();
      startNewDialyzer();
      setStatusMessage("Dialyzer archived.");
    } finally {
      setArchiving(false);
    }
  }

  if (loading) {
    return <LoadingState label="Loading dialyzer tracker..." />;
  }

  if (!snapshot.patient) {
    return (
      <Card>
        <CardTitle>Patient setup required</CardTitle>
        <p className="mt-2 text-sm text-brand-muted">Create the patient profile before tracking dialyzers.</p>
        <Link
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-brand-mint shadow-soft transition hover:bg-[#0B5D49]"
          href="/patient-setup"
        >
          Go to patient setup
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        action={
          <Button onClick={startNewDialyzer} type="button" variant="secondary">
            <Plus aria-hidden="true" size={18} />
            New dialyzer
          </Button>
        }
        description="Track the active dialyzer usage count and keep past dialyzers attached to saved sessions."
        eyebrow="Tracker"
        title="Dialyzer"
      />

      {statusMessage ? (
        <div className="rounded-lg border border-brand-primary/20 bg-brand-mint p-4 text-sm text-brand-primary" role="status">
          {statusMessage}
        </div>
      ) : null}

      {formErrors.length > 0 ? (
        <div className="rounded-lg border border-brand-alert/30 bg-[#FAECE7] p-4 text-sm text-brand-alert" role="alert">
          <p className="font-semibold">Please fix these details:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {formErrors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {snapshot.activeDialyzer ? (
        <Card>
          <DialyzerSummary dialyzer={snapshot.activeDialyzer} />
        </Card>
      ) : (
        <Card>
          <EmptyState
            description="Add the current dialyzer so future dialysis sessions can increment and preserve its usage count."
            title="No active dialyzer configured"
          />
        </Card>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>{editingActive && snapshot.activeDialyzer ? "Edit active dialyzer" : "Add active dialyzer"}</CardTitle>
              <p className="mt-1 text-sm text-brand-muted">
                {editingActive && snapshot.activeDialyzer
                  ? "Correct the current dialyzer details if the booklet count changes."
                  : "Saving a new active dialyzer archives the previous active one."}
              </p>
            </div>
            {snapshot.activeDialyzer && editingActive ? (
              <Button disabled={archiving || saving} onClick={handleArchiveActive} type="button" variant="ghost">
                <Archive aria-hidden="true" size={18} />
                {archiving ? "Archiving..." : "Archive"}
              </Button>
            ) : null}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              label="Dialyzer name"
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="F8HPS"
              required
              value={form.name}
            />
            <Input
              label="Start date"
              onChange={(event) => updateField("startedOn", event.target.value)}
              required
              type="date"
              value={form.startedOn}
            />
            <Input
              inputMode="numeric"
              label="Current usage count"
              min="0"
              onChange={(event) => updateField("currentUsage", event.target.value)}
              required
              type="number"
              value={form.currentUsage}
            />
            <Input
              inputMode="numeric"
              label="Max usage count"
              min="1"
              onChange={(event) => updateField("maxUsage", event.target.value)}
              required
              type="number"
              value={form.maxUsage}
            />
          </div>
        </Card>

        <div className="sticky bottom-20 rounded-xl border border-brand-border bg-white p-3 shadow-soft lg:static lg:p-0 lg:shadow-none">
          <Button className="w-full" disabled={saving || archiving} type="submit">
            <Save aria-hidden="true" size={18} />
            {saving ? "Saving..." : editingActive && snapshot.activeDialyzer ? "Update active dialyzer" : "Save active dialyzer"}
          </Button>
        </div>
      </form>

      <section className="space-y-3">
        <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-brand-muted">Archived dialyzers</h2>
        {snapshot.archivedDialyzers.length === 0 ? (
          <Card>
            <EmptyState description="Changed dialyzers will appear here with their preserved session links." title="No archived dialyzers" />
          </Card>
        ) : (
          snapshot.archivedDialyzers.map((dialyzer) => (
            <Card key={dialyzer.id}>
              <DialyzerSummary dialyzer={dialyzer} />
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
