import { describe, expect, it } from "vitest";

import {
  buildDashboardViewModel,
  formatSessionDate,
  getDialysisIntervalDays,
  getDialysisWeekdays,
  getNextDialysisEstimate,
} from "@/features/dashboard/services/dashboard-service";
import type { DialysisSession, Dialyzer, Patient } from "@/types/core";

const patient: Patient = {
  id: "patient_1",
  name: "Nitinkumar Sukalikar",
  dryWeightKg: 57,
  dialysisFrequency: "3 times per week",
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
};

const session: DialysisSession = {
  id: "session_1",
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
  dialyzerUseNumber: 10,
  remarks: "Stable",
  createdAt: "2026-06-22T09:00:00.000Z",
  updatedAt: "2026-06-22T09:00:00.000Z",
};

const olderSession: DialysisSession = {
  ...session,
  id: "session_older",
  date: "2026-06-20",
  postWeightKg: 58,
  ufRemovedLiters: 3.7,
};

const dialyzer: Dialyzer = {
  id: "dialyzer_1",
  patientId: patient.id,
  name: "F8HPS",
  startedOn: "2026-06-01",
  maxUsage: 12,
  currentUsage: 10,
  lastUsedDate: "2026-06-22",
  status: "active",
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-22T09:00:00.000Z",
};

const archivedDialyzer: Dialyzer = {
  ...dialyzer,
  id: "dialyzer_archived",
  currentUsage: 8,
  status: "archived",
};

describe("dashboard service utilities", () => {
  it("formats session date labels for dashboard cards", () => {
    expect(formatSessionDate("2026-06-22")).toBe("22 Jun 2026");
    expect(formatSessionDate()).toBe("No sessions yet");
  });

  it("derives dialysis intervals from common frequency text", () => {
    expect(getDialysisIntervalDays("3 times per week")).toBe(2);
    expect(getDialysisIntervalDays("twice per week")).toBe(4);
    expect(getDialysisIntervalDays("alternate days")).toBe(2);
    expect(getDialysisIntervalDays("daily")).toBe(1);
    expect(getDialysisIntervalDays("as advised")).toBeUndefined();
  });

  it("derives dialysis weekdays from selected frequency text", () => {
    expect(getDialysisWeekdays("2 times per week (Mon, Thu)")).toEqual([1, 4]);
    expect(getDialysisWeekdays("Monday Thursday")).toEqual([1, 4]);
    expect(getDialysisWeekdays("3 times per week")).toEqual([]);
  });

  it("estimates the next dialysis date from the latest session and frequency", () => {
    expect(getNextDialysisEstimate(session, patient.dialysisFrequency)).toEqual({
      label: "24 Jun 2026",
      note: "Estimated around 09:00",
    });
  });

  it("estimates the next dialysis date from selected weekdays", () => {
    expect(getNextDialysisEstimate(session, "2 times per week (Mon, Thu)")).toEqual({
      label: "25 Jun 2026",
      note: "Estimated around 09:00",
    });
  });

  it("builds dashboard view model labels and warning states", () => {
    const dashboard = buildDashboardViewModel({
      patient,
      latestSession: session,
      activeDialyzer: dialyzer,
      sessions: [session, olderSession],
      dialyzers: [dialyzer, archivedDialyzer],
    });

    expect(dashboard.currentWeightLabel).toBe("58.5 kg");
    expect(dashboard.dryWeightLabel).toBe("57 kg");
    expect(dashboard.weightDifferenceLabel).toBe("+1.5 kg");
    expect(dashboard.weightDifferenceTone).toBe("warning");
    expect(dashboard.dialyzerNameLabel).toBe("F8HPS");
    expect(dashboard.dialyzerUsageLabel).toBe("10 / 12");
    expect(dashboard.dialyzerStatusLabel).toBe("Near limit");
    expect(dashboard.dialyzerStatusTone).toBe("warning");
    expect(dashboard.dialyzerUsagePercent).toBe(83);
    expect(dashboard.averagePreHdWeightLabel).toBe("62.4 kg");
    expect(dashboard.averagePostHdWeightLabel).toBe("58.3 kg");
    expect(dashboard.averageUfRemovedLabel).toBe("3.8 L");
    expect(dashboard.averageDialyzerUseCountLabel).toBe("9 uses");
  });
});
