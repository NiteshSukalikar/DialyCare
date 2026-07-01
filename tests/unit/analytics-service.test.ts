import { describe, expect, it } from "vitest";

import {
  buildAnalyticsSummary,
  buildAnalyticsViewModel,
  filterSessionsByRange,
  resolveAnalyticsDateRange,
} from "@/features/analytics/services/analytics-service";
import type { DialysisSession, Patient } from "@/types/core";

const patient: Patient = {
  id: "patient_1",
  name: "Nitinkumar Sukalikar",
  dryWeightKg: 57,
  createdAt: "2026-04-01T00:00:00.000Z",
  updatedAt: "2026-04-01T00:00:00.000Z",
};

const sessions: DialysisSession[] = [
  {
    id: "session_3",
    patientId: patient.id,
    date: "2026-06-24",
    sessionTime: "09:00",
    preWeightKg: 61.8,
    postWeightKg: 58,
    preBpSystolic: 168,
    preBpDiastolic: 94,
    postBpSystolic: 138,
    postBpDiastolic: 86,
    ufRemovedLiters: 3.8,
    createdAt: "2026-06-24T09:00:00.000Z",
    updatedAt: "2026-06-24T09:00:00.000Z",
  },
  {
    id: "session_2",
    patientId: patient.id,
    date: "2026-06-22",
    sessionTime: "09:00",
    preWeightKg: 62.4,
    postWeightKg: 58.5,
    preBpSystolic: 160,
    preBpDiastolic: 90,
    postBpSystolic: 130,
    postBpDiastolic: 80,
    ufRemovedLiters: 3.9,
    createdAt: "2026-06-22T09:00:00.000Z",
    updatedAt: "2026-06-22T09:00:00.000Z",
  },
  {
    id: "session_1",
    patientId: patient.id,
    date: "2026-04-15",
    sessionTime: "09:00",
    preWeightKg: 60.8,
    postWeightKg: 57.4,
    preBpSystolic: 150,
    preBpDiastolic: 84,
    postBpSystolic: 124,
    postBpDiastolic: 76,
    ufRemovedLiters: 3.4,
    createdAt: "2026-04-15T09:00:00.000Z",
    updatedAt: "2026-04-15T09:00:00.000Z",
  },
];

describe("analytics service utilities", () => {
  it("resolves preset date ranges from a stable current date", () => {
    const today = new Date(2026, 5, 30);

    expect(resolveAnalyticsDateRange({ preset: "this-month" }, today)).toEqual({
      startDate: "2026-06-01",
      endDate: "2026-06-30",
      label: "June 2026",
    });
    expect(resolveAnalyticsDateRange({ preset: "last-3-months" }, today)).toEqual({
      startDate: "2026-04-01",
      endDate: "2026-06-30",
      label: "Last 3 months",
    });
  });

  it("filters sessions by presets and custom ranges", () => {
    const today = new Date(2026, 5, 30);

    expect(filterSessionsByRange(sessions, { preset: "this-month" }, today).map((session) => session.id)).toEqual([
      "session_3",
      "session_2",
    ]);
    expect(
      filterSessionsByRange(sessions, { preset: "custom", startDate: "2026-06-23", endDate: "2026-06-30" }, today).map(
        (session) => session.id,
      ),
    ).toEqual(["session_3"]);
  });

  it("builds summary labels from dialysis session values", () => {
    const summary = buildAnalyticsSummary(sessions, patient);

    expect(summary.sessionCount).toBe(3);
    expect(summary.averageUfLabel).toBe("3.7 L");
    expect(summary.averagePreBpLabel).toBe("159/89");
    expect(summary.averagePostBpLabel).toBe("131/81");
    expect(summary.averageWeightGainLabel).toBe("4.7 kg");
    expect(summary.highestUfLabel).toBe("3.9 L");
    expect(summary.lowestPostBpLabel).toBe("124/76");
  });

  it("sorts chart points oldest first and detects when charts have enough data", () => {
    const analytics = buildAnalyticsViewModel(sessions, patient, { preset: "last-3-months" }, new Date(2026, 5, 30));

    expect(analytics.chartPoints.map((point) => point.id)).toEqual(["session_1", "session_2", "session_3"]);
    expect(analytics.chartPoints.at(0)?.weightGainVsDryKg).toBe(3.8);
    expect(analytics.hasEnoughChartData).toBe(true);
  });
});
