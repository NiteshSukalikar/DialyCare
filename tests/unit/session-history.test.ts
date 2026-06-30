import { describe, expect, it } from "vitest";

import {
  filterSessions,
  groupSessionsByMonth,
  sortSessionsNewestFirst,
} from "@/features/sessions/utils/session-history";
import type { DialysisSession } from "@/types/core";

function session(overrides: Partial<DialysisSession>): DialysisSession {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    patientId: "patient_1",
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
    ...overrides,
  };
}

describe("session history utilities", () => {
  it("sorts sessions newest first using date, time, then creation time", () => {
    const older = session({ id: "older", date: "2026-06-20", sessionTime: "10:00" });
    const newerMorning = session({ id: "newer-morning", date: "2026-06-22", sessionTime: "09:00" });
    const newerEvening = session({ id: "newer-evening", date: "2026-06-22", sessionTime: "18:00" });

    expect(sortSessionsNewestFirst([older, newerMorning, newerEvening]).map((item) => item.id)).toEqual([
      "newer-evening",
      "newer-morning",
      "older",
    ]);
  });

  it("filters this week, this month, last 3 months, and custom ranges", () => {
    const today = new Date("2026-06-30T12:00:00.000Z");
    const sessions = [
      session({ id: "today", date: "2026-06-30" }),
      session({ id: "week", date: "2026-06-29" }),
      session({ id: "month", date: "2026-06-02" }),
      session({ id: "three-months", date: "2026-04-05" }),
      session({ id: "old", date: "2026-02-28" }),
    ];

    expect(filterSessions(sessions, "week", today).map((item) => item.id)).toEqual(["today", "week"]);
    expect(filterSessions(sessions, "month", today).map((item) => item.id)).toEqual(["today", "week", "month"]);
    expect(filterSessions(sessions, "last-3-months", today).map((item) => item.id)).toEqual([
      "today",
      "week",
      "month",
      "three-months",
    ]);
    expect(
      filterSessions(sessions, "custom", today, { from: "2026-06-01", to: "2026-06-15" }).map((item) => item.id),
    ).toEqual(["month"]);
  });

  it("groups filtered sessions by month with stable newest-first order", () => {
    const groups = groupSessionsByMonth([
      session({ id: "june-older", date: "2026-06-01" }),
      session({ id: "may", date: "2026-05-20" }),
      session({ id: "june-newer", date: "2026-06-30" }),
    ]);

    expect(groups.map((group) => group.label)).toEqual(["June 2026", "May 2026"]);
    expect(groups[0]?.sessions.map((item) => item.id)).toEqual(["june-newer", "june-older"]);
  });
});
