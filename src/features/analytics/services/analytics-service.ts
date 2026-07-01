import { PatientRepository, SessionRepository } from "@/data/repositories";
import { calculateWeightGainVsDryKg } from "@/features/sessions/utils/session-calculations";
import type { DialysisSession, Patient } from "@/types/core";

export type AnalyticsRangePreset = "this-month" | "last-3-months" | "custom";

export interface AnalyticsRange {
  preset: AnalyticsRangePreset;
  startDate?: string;
  endDate?: string;
}

export interface AnalyticsChartPoint {
  id: string;
  date: string;
  label: string;
  preWeightKg: number;
  postWeightKg: number;
  ufRemovedLiters: number;
  preBpSystolic: number;
  preBpDiastolic: number;
  postBpSystolic: number;
  postBpDiastolic: number;
  weightGainVsDryKg?: number;
}

export interface AnalyticsSummary {
  sessionCount: number;
  averageUfLabel: string;
  averagePreBpLabel: string;
  averagePostBpLabel: string;
  averageWeightGainLabel: string;
  highestUfLabel: string;
  lowestPostBpLabel: string;
}

export interface AnalyticsViewModel {
  patient?: Patient;
  sessions: DialysisSession[];
  chartPoints: AnalyticsChartPoint[];
  summary: AnalyticsSummary;
  hasEnoughChartData: boolean;
  rangeLabel: string;
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
});

const monthFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "long",
  year: "numeric",
});

function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return new Date(value);
  return new Date(year, month - 1, day);
}

function formatDateOnly(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function resolveAnalyticsDateRange(range: AnalyticsRange, today = new Date()) {
  if (range.preset === "custom") {
    return {
      startDate: range.startDate,
      endDate: range.endDate,
      label: range.startDate && range.endDate ? `${range.startDate} to ${range.endDate}` : "Custom range",
    };
  }

  if (range.preset === "last-3-months") {
    const start = startOfMonth(new Date(today.getFullYear(), today.getMonth() - 2, 1));
    const end = endOfMonth(today);

    return {
      startDate: formatDateOnly(start),
      endDate: formatDateOnly(end),
      label: "Last 3 months",
    };
  }

  const start = startOfMonth(today);
  const end = endOfMonth(today);

  return {
    startDate: formatDateOnly(start),
    endDate: formatDateOnly(end),
    label: monthFormatter.format(today),
  };
}

export function filterSessionsByRange(sessions: DialysisSession[], range: AnalyticsRange, today = new Date()) {
  const resolved = resolveAnalyticsDateRange(range, today);

  return sessions.filter((session) => {
    if (resolved.startDate && session.date < resolved.startDate) return false;
    if (resolved.endDate && session.date > resolved.endDate) return false;
    return true;
  });
}

function average(values: number[]) {
  if (!values.length) return undefined;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatDecimal(value?: number, suffix = "") {
  if (value === undefined || !Number.isFinite(value)) return "--";
  return `${Number(value.toFixed(1))}${suffix}`;
}

function formatBp(systolic?: number, diastolic?: number) {
  if (systolic === undefined || diastolic === undefined) return "--";
  return `${Math.round(systolic)}/${Math.round(diastolic)}`;
}

function getLowestPostBpSession(sessions: DialysisSession[]) {
  return sessions.reduce<DialysisSession | undefined>((lowest, session) => {
    if (!lowest) return session;
    if (session.postBpSystolic < lowest.postBpSystolic) return session;
    if (session.postBpSystolic === lowest.postBpSystolic && session.postBpDiastolic < lowest.postBpDiastolic) return session;
    return lowest;
  }, undefined);
}

export function buildAnalyticsSummary(sessions: DialysisSession[], patient?: Patient): AnalyticsSummary {
  const weightGains = patient
    ? sessions
        .map((session) => calculateWeightGainVsDryKg(session.preWeightKg, patient.dryWeightKg))
        .filter((value): value is number => value !== undefined)
    : [];
  const highestUf = sessions.reduce<number | undefined>((highest, session) => {
    if (highest === undefined) return session.ufRemovedLiters;
    return Math.max(highest, session.ufRemovedLiters);
  }, undefined);
  const lowestPostBpSession = getLowestPostBpSession(sessions);

  return {
    sessionCount: sessions.length,
    averageUfLabel: formatDecimal(average(sessions.map((session) => session.ufRemovedLiters)), " L"),
    averagePreBpLabel: formatBp(
      average(sessions.map((session) => session.preBpSystolic)),
      average(sessions.map((session) => session.preBpDiastolic)),
    ),
    averagePostBpLabel: formatBp(
      average(sessions.map((session) => session.postBpSystolic)),
      average(sessions.map((session) => session.postBpDiastolic)),
    ),
    averageWeightGainLabel: formatDecimal(average(weightGains), " kg"),
    highestUfLabel: formatDecimal(highestUf, " L"),
    lowestPostBpLabel: lowestPostBpSession ? `${lowestPostBpSession.postBpSystolic}/${lowestPostBpSession.postBpDiastolic}` : "--",
  };
}

export function buildAnalyticsViewModel(
  sessions: DialysisSession[],
  patient: Patient | undefined,
  range: AnalyticsRange,
  today = new Date(),
): AnalyticsViewModel {
  const filteredSessions = filterSessionsByRange(sessions, range, today);
  const chartPoints = [...filteredSessions]
    .sort((a, b) => `${a.date}T${a.sessionTime ?? "00:00"}`.localeCompare(`${b.date}T${b.sessionTime ?? "00:00"}`))
    .map((session) => ({
      id: session.id,
      date: session.date,
      label: dateFormatter.format(parseDateOnly(session.date)),
      preWeightKg: session.preWeightKg,
      postWeightKg: session.postWeightKg,
      ufRemovedLiters: session.ufRemovedLiters,
      preBpSystolic: session.preBpSystolic,
      preBpDiastolic: session.preBpDiastolic,
      postBpSystolic: session.postBpSystolic,
      postBpDiastolic: session.postBpDiastolic,
      weightGainVsDryKg: patient ? calculateWeightGainVsDryKg(session.preWeightKg, patient.dryWeightKg) : undefined,
    }));
  const resolvedRange = resolveAnalyticsDateRange(range, today);

  return {
    patient,
    sessions: filteredSessions,
    chartPoints,
    summary: buildAnalyticsSummary(filteredSessions, patient),
    hasEnoughChartData: chartPoints.length >= 2,
    rangeLabel: resolvedRange.label,
  };
}

export class AnalyticsService {
  constructor(
    private readonly patients: PatientRepository = new PatientRepository(),
    private readonly sessions: SessionRepository = new SessionRepository(),
  ) {}

  async getSnapshot() {
    const patient = await this.patients.getPrimaryPatient();
    if (!patient) return { patient: undefined, sessions: [] };

    const sessions = await this.sessions.listByPatient(patient.id);
    return { patient, sessions };
  }
}

export const analyticsService = new AnalyticsService();
