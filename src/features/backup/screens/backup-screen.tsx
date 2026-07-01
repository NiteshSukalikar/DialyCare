"use client";

import { Download, FileJson, FileText, RefreshCcw, Save, Settings, Upload } from "lucide-react";
import Link from "next/link";
import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { appConfig } from "@/config/app";
import { backupService, type BackupSnapshot } from "@/features/backup/services/backup-service";
import type { ThemePreference } from "@/types/core";

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function todayMinus(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadText(text: string, fileName: string, type: string) {
  downloadBlob(new Blob([text], { type }), fileName);
}

function formatDateTime(date?: string) {
  if (!date) return "Not exported yet";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function BackupScreen() {
  const [snapshot, setSnapshot] = useState<BackupSnapshot>();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [doctorFrom, setDoctorFrom] = useState(todayMinus(90));
  const [doctorTo, setDoctorTo] = useState(new Date().toISOString().slice(0, 10));
  const [month, setMonth] = useState(currentMonth());
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderDays, setReminderDays] = useState(7);
  const [theme, setTheme] = useState<ThemePreference>("system");

  async function loadSnapshot() {
    const nextSnapshot = await backupService.getSnapshot();
    setSnapshot(nextSnapshot);
    const settings = nextSnapshot.settings[0];
    if (settings) {
      setReminderEnabled(settings.backupReminderEnabled);
      setReminderDays(settings.backupReminderDays ?? 7);
      setTheme(settings.theme);
    }
  }

  useEffect(() => {
    let cancelled = false;

    backupService
      .getSnapshot()
      .then((nextSnapshot) => {
        if (cancelled) return;
        setSnapshot(nextSnapshot);
        const settings = nextSnapshot.settings[0];
        if (settings) {
          setReminderEnabled(settings.backupReminderEnabled);
          setReminderDays(settings.backupReminderDays ?? 7);
          setTheme(settings.theme);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function runAction(action: () => Promise<void>) {
    setBusy(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      await action();
      await loadSnapshot();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Backup action failed.");
    } finally {
      setBusy(false);
    }
  }

  async function exportJsonBackup() {
    await runAction(async () => {
      const json = await backupService.exportBackupJson();
      const fileDate = new Date().toISOString().slice(0, 10);
      downloadText(json, `dialycare-backup-${fileDate}.json`, "application/json");
      setStatusMessage("JSON backup downloaded.");
    });
  }

  async function importJsonBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    await runAction(async () => {
      const json = await file.text();
      const backup = backupService.parseBackupJson(json);
      const confirmed = window.confirm(
        `Import this DialyCare backup from ${formatDateTime(backup.exportedAt)}? This will replace all local patient records, sessions, medicines, documents metadata, and settings on this device.`,
      );
      if (!confirmed) return;

      const result = await backupService.restoreBackup(backup);
      setStatusMessage(`Backup restored: ${result.patients} patient, ${result.sessions} sessions, ${result.medicines} medicines, ${result.documents} documents.`);
    });
  }

  async function exportDoctorPdf() {
    await runAction(async () => {
      const pdf = await backupService.generateDoctorSummaryPdf({ from: doctorFrom, to: doctorTo });
      downloadBlob(pdf, `dialycare-doctor-summary-${doctorFrom}-to-${doctorTo}.pdf`);
      setStatusMessage("Doctor summary PDF downloaded.");
    });
  }

  async function exportMonthlyPdf() {
    await runAction(async () => {
      const pdf = await backupService.generateMonthlySummaryPdf(month);
      downloadBlob(pdf, `dialycare-monthly-summary-${month}.pdf`);
      setStatusMessage("Monthly PDF downloaded.");
    });
  }

  async function saveReminder() {
    await runAction(async () => {
      await backupService.updateBackupReminder(reminderEnabled, reminderDays);
      setStatusMessage("Backup reminder setting saved.");
    });
  }

  async function saveTheme(nextTheme: ThemePreference) {
    setTheme(nextTheme);
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = nextTheme === "system" ? (systemDark ? "dark" : "light") : nextTheme;
    await runAction(async () => {
      await backupService.updateTheme(nextTheme);
      setStatusMessage("Theme preference saved.");
    });
  }

  if (loading) {
    return <LoadingState label="Loading backup tools..." />;
  }

  if (!snapshot?.patient) {
    return (
      <Card>
        <CardTitle>Patient setup required</CardTitle>
        <p className="mt-2 text-sm text-brand-muted">Create the patient profile before exporting backups or doctor summaries.</p>
        <Link
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-brand-mint shadow-soft transition hover:bg-[#0B5D49]"
          href="/patient-setup"
        >
          Go to patient setup
        </Link>
      </Card>
    );
  }

  const settings = snapshot.settings[0];

  return (
    <div className="space-y-5">
      <PageHeader
        description="Export local records, restore from JSON, and create doctor-friendly PDF summaries."
        eyebrow="Safety"
        title="Backup and export"
      />

      <div className="rounded-lg border border-[#F59E0B]/30 bg-[#FEF6E7] p-4 text-sm leading-6 text-brand-ink">
        DialyCare stores records only in this browser. Export backups regularly, because clearing browser storage or losing this device can remove local records.
      </div>

      {statusMessage ? (
        <div className="rounded-lg border border-brand-primary/20 bg-brand-mint p-4 text-sm text-brand-primary" role="status">
          {statusMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-lg border border-brand-alert/30 bg-[#FAECE7] p-4 text-sm text-brand-alert" role="alert">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <div className="flex items-start gap-3">
            <span className="rounded-lg bg-brand-mint p-2 text-brand-primary">
              <FileJson aria-hidden="true" size={20} />
            </span>
            <div>
              <CardTitle>JSON backup</CardTitle>
              <p className="mt-1 text-sm text-brand-muted">Includes patient, sessions, dialyzers, medicines, document metadata, and settings.</p>
            </div>
          </div>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-brand-muted">Sessions</dt>
              <dd className="font-semibold text-brand-ink">{snapshot.sessions.length}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-brand-muted">Documents</dt>
              <dd className="font-semibold text-brand-ink">{snapshot.documents.length}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-brand-muted">Last backup</dt>
              <dd className="text-right font-semibold text-brand-ink">{formatDateTime(settings?.lastBackupAt)}</dd>
            </div>
          </dl>

          <div className="mt-5 grid gap-3">
            <Button disabled={busy} onClick={exportJsonBackup} type="button">
              <Download aria-hidden="true" size={18} />
              Export JSON
            </Button>
            <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-mint px-4 py-2.5 text-sm font-semibold text-brand-primary transition hover:bg-[#D3EFE5]">
              <Upload aria-hidden="true" size={18} />
              Import JSON
              <input accept="application/json,.json" className="sr-only" disabled={busy} onChange={importJsonBackup} type="file" />
            </label>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <span className="rounded-lg bg-brand-mint p-2 text-brand-primary">
              <FileText aria-hidden="true" size={20} />
            </span>
            <div>
              <CardTitle>Doctor summary PDF</CardTitle>
              <p className="mt-1 text-sm text-brand-muted">Creates a concise record summary with sessions, BP, weight, dialyzer, medicines, and report index.</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Input label="From" onChange={(event) => setDoctorFrom(event.target.value)} type="date" value={doctorFrom} />
            <Input label="To" onChange={(event) => setDoctorTo(event.target.value)} type="date" value={doctorTo} />
          </div>

          <Button className="mt-5 w-full" disabled={busy || doctorFrom > doctorTo} onClick={exportDoctorPdf} type="button">
            <Download aria-hidden="true" size={18} />
            Export doctor PDF
          </Button>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <span className="rounded-lg bg-brand-mint p-2 text-brand-primary">
              <RefreshCcw aria-hidden="true" size={20} />
            </span>
            <div>
              <CardTitle>Monthly PDF</CardTitle>
              <p className="mt-1 text-sm text-brand-muted">Generate a month-specific PDF for dialysis visits and review notes.</p>
            </div>
          </div>

          <Input className="mt-4" label="Month" onChange={(event) => setMonth(event.target.value)} type="month" value={month} />

          <Button className="mt-5 w-full" disabled={busy || !month} onClick={exportMonthlyPdf} type="button">
            <Download aria-hidden="true" size={18} />
            Export monthly PDF
          </Button>
        </Card>
      </section>

      <Card>
        <div className="flex items-start gap-3">
          <span className="rounded-lg bg-brand-mint p-2 text-brand-primary">
            <Settings aria-hidden="true" size={20} />
          </span>
          <div>
            <CardTitle>Manual backup reminder</CardTitle>
            <p className="mt-1 text-sm text-brand-muted">Keep a visible reminder cadence for manual JSON backups.</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_180px_auto] sm:items-end">
          <label className="flex min-h-12 items-center gap-3 rounded-lg border border-brand-border bg-white px-3.5 py-2.5 text-sm font-medium text-brand-ink">
            <input checked={reminderEnabled} className="h-5 w-5 accent-brand-primary" onChange={(event) => setReminderEnabled(event.target.checked)} type="checkbox" />
            Show reminder to export backup
          </label>
          <Input
            label="Every days"
            min={1}
            onChange={(event) => setReminderDays(Number(event.target.value))}
            type="number"
            value={reminderDays}
          />
          <Button disabled={busy || reminderDays < 1} onClick={saveReminder} type="button">
            <Save aria-hidden="true" size={18} />
            Save
          </Button>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <span className="rounded-lg bg-brand-mint p-2 text-brand-primary">
            <Settings aria-hidden="true" size={20} />
          </span>
          <div>
            <CardTitle>Appearance</CardTitle>
            <p className="mt-1 text-sm text-brand-muted">Choose a comfortable theme for this device.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3" role="group" aria-label="Theme preference">
          {(["system", "light", "dark"] as const).map((option) => (
            <button
              className={`min-h-11 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                theme === option ? "bg-brand-primary text-brand-mint" : "bg-brand-neutral text-brand-muted hover:bg-brand-mint hover:text-brand-primary"
              }`}
              disabled={busy}
              key={option}
              onClick={() => saveTheme(option)}
              type="button"
            >
              {option === "system" ? "System" : option === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Medical safety note</CardTitle>
        <p className="mt-2 text-sm leading-6 text-brand-muted">{appConfig.disclaimer}</p>
      </Card>

      {snapshot.sessions.length === 0 ? (
        <Card>
          <EmptyState
            description="Backups already work, but PDF summaries become more useful after adding dialysis sessions."
            title="No dialysis sessions yet"
          />
        </Card>
      ) : null}
    </div>
  );
}
