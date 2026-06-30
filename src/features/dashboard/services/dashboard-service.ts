import { DialyzerRepository, PatientRepository, SessionRepository } from "@/data/repositories";
import { getDialyzerStatusLabel, getDialyzerUsagePercent, getDialyzerUsageState } from "@/features/dialyzer/utils/dialyzer-status";
import { calculateWeightGainVsDryKg } from "@/features/sessions/utils/session-calculations";
import type { DialysisSession, Dialyzer, Patient } from "@/types/core";

export interface DashboardSnapshot {
  patient?: Patient;
  activeDialyzer?: Dialyzer;
  latestSession?: DialysisSession;
}

export interface DashboardViewModel extends DashboardSnapshot {
  lastDialysisLabel: string;
  currentWeightLabel: string;
  dryWeightLabel: string;
  weightDifferenceLabel: string;
  weightDifferenceTone: "neutral" | "warning";
  dialyzerNameLabel: string;
  dialyzerUsageLabel: string;
  dialyzerStatusLabel: string;
  dialyzerStatusTone: "success" | "warning";
  dialyzerUsagePercent: number;
  nextDialysisLabel: string;
  nextDialysisNote: string;
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return new Date(value);
  return new Date(year, month - 1, day);
}

export function formatSessionDate(value?: string) {
  if (!value) return "No sessions yet";
  return dateFormatter.format(parseDateOnly(value));
}

export function getDialysisIntervalDays(frequency?: string) {
  if (!frequency) return undefined;

  const normalized = frequency.toLowerCase();
  const explicitWeeklyMatch = normalized.match(/(\d+)\s*(?:times|sessions?)?\s*(?:per|\/)?\s*week/);
  const textWeeklyCounts: Record<string, number> = {
    once: 1,
    one: 1,
    twice: 2,
    two: 2,
    thrice: 3,
    three: 3,
    four: 4,
  };

  const weeklyCount =
    explicitWeeklyMatch?.[1] ? Number(explicitWeeklyMatch[1]) : Object.entries(textWeeklyCounts).find(([word]) => normalized.includes(word))?.[1];

  if (weeklyCount && weeklyCount > 0) return Math.max(1, Math.round(7 / weeklyCount));
  if (normalized.includes("alternate")) return 2;
  if (normalized.includes("daily")) return 1;

  return undefined;
}

export function getNextDialysisEstimate(latestSession?: DialysisSession, frequency?: string) {
  const intervalDays = getDialysisIntervalDays(frequency);
  if (!latestSession || !intervalDays) {
    return {
      label: "Set after first session",
      note: frequency ? `Frequency: ${frequency}` : "Add dialysis frequency in patient setup",
    };
  }

  const nextDate = parseDateOnly(latestSession.date);
  nextDate.setDate(nextDate.getDate() + intervalDays);

  return {
    label: dateFormatter.format(nextDate),
    note: latestSession.sessionTime ? `Estimated around ${latestSession.sessionTime}` : `Estimated from ${frequency}`,
  };
}

export function buildDashboardViewModel(snapshot: DashboardSnapshot): DashboardViewModel {
  const { activeDialyzer, latestSession, patient } = snapshot;
  const nextDialysis = getNextDialysisEstimate(latestSession, patient?.dialysisFrequency);
  const weightDifference = patient && latestSession ? calculateWeightGainVsDryKg(latestSession.preWeightKg, patient.dryWeightKg) : undefined;
  const dialyzerStatusState = activeDialyzer ? getDialyzerUsageState(activeDialyzer) : "normal";

  return {
    ...snapshot,
    lastDialysisLabel: formatSessionDate(latestSession?.date),
    currentWeightLabel: latestSession ? `${latestSession.postWeightKg} kg` : "--",
    dryWeightLabel: patient ? `${patient.dryWeightKg} kg` : "--",
    weightDifferenceLabel: weightDifference === undefined ? "--" : `${weightDifference > 0 ? "+" : ""}${weightDifference} kg`,
    weightDifferenceTone: weightDifference !== undefined && weightDifference > 0 ? "warning" : "neutral",
    dialyzerNameLabel: activeDialyzer?.name ?? "Not set",
    dialyzerUsageLabel: activeDialyzer ? `${activeDialyzer.currentUsage} / ${activeDialyzer.maxUsage}` : "--",
    dialyzerStatusLabel: activeDialyzer ? getDialyzerStatusLabel(activeDialyzer) : "Add dialyzer",
    dialyzerStatusTone: dialyzerStatusState === "normal" ? "success" : "warning",
    dialyzerUsagePercent: activeDialyzer ? getDialyzerUsagePercent(activeDialyzer) : 0,
    nextDialysisLabel: nextDialysis.label,
    nextDialysisNote: nextDialysis.note,
  };
}

export class DashboardService {
  constructor(
    private readonly patients: PatientRepository = new PatientRepository(),
    private readonly sessions: SessionRepository = new SessionRepository(),
    private readonly dialyzers: DialyzerRepository = new DialyzerRepository(),
  ) {}

  async getSnapshot(): Promise<DashboardSnapshot> {
    const patient = await this.patients.getPrimaryPatient();
    if (!patient) return {};

    const [latestSession, activeDialyzer] = await Promise.all([
      this.sessions.getLatest(patient.id),
      this.dialyzers.getActive(patient.id),
    ]);

    return { patient, latestSession, activeDialyzer };
  }
}

export const dashboardService = new DashboardService();
