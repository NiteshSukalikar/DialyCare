import { describe, expect, it } from "vitest";

import {
  buildSessionCalendar,
  filterSessions,
  groupSessionsByMonth,
  matchesSessionSearch,
  sortSessionsNewestFirst,
} from "@/features/sessions/utils/session-history";
import { calculateUfVarianceLiters, calculateWeightGainSinceLastPostHdKg } from "@/features/sessions/utils/session-calculations";
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

  it("filters smart review views for high UF, BP ranges, and dialyzer use", () => {
    const sessions = [
      session({ id: "high-uf", preBpSystolic: 140, postBpSystolic: 125, ufRemovedLiters: 4.2 }),
      session({ id: "high-bp", preBpSystolic: 168, postBpSystolic: 125, ufRemovedLiters: 3 }),
      session({ id: "low-post-bp", preBpSystolic: 140, postBpSystolic: 98, ufRemovedLiters: 3 }),
      session({ id: "dialyzer", preBpSystolic: 140, postBpSystolic: 125, dialyzerUseNumber: 8, ufRemovedLiters: 3 }),
      session({ id: "plain", preBpSystolic: 140, postBpSystolic: 125, dialyzerId: undefined, dialyzerUseNumber: undefined, ufRemovedLiters: 3 }),
    ];

    expect(filterSessions(sessions, "high-uf").map((item) => item.id)).toEqual(["high-uf"]);
    expect(filterSessions(sessions, "high-pre-bp").map((item) => item.id)).toEqual(["high-bp"]);
    expect(filterSessions(sessions, "low-post-bp").map((item) => item.id)).toEqual(["low-post-bp"]);
    expect(filterSessions(sessions, "with-dialyzer").map((item) => item.id)).toEqual(["dialyzer"]);
  });

  it("matches session search text across notes and clinical record fields", () => {
    const item = session({ hospital: "Apollo", remarks: "Stable after dialysis", ufRemovedLiters: 3.9 });

    expect(matchesSessionSearch(item, "apollo")).toBe(true);
    expect(matchesSessionSearch(item, "stable")).toBe(true);
    expect(matchesSessionSearch(item, "160/90")).toBe(true);
    expect(matchesSessionSearch(item, "missing")).toBe(false);
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

  it("builds a monthly calendar with sessions attached to their dates", () => {
    const calendar = buildSessionCalendar(
      [session({ id: "first", date: "2026-06-01" }), session({ id: "second", date: "2026-06-22" })],
      "2026-06",
    );

    expect(calendar).toHaveLength(30);
    expect(calendar[0]).toMatchObject({ date: "2026-06-01", dayNumber: 1 });
    expect(calendar[21]?.sessions.map((item) => item.id)).toEqual(["second"]);
  });

  it("calculates UF variance against recorded weight loss", () => {
    expect(calculateUfVarianceLiters(62.4, 58.5, 3.9)).toBe(0);
    expect(calculateUfVarianceLiters(62.4, 58.7, 3.9)).toBe(-0.2);
  });

  it("calculates current weight gain since the last post-HD weight", () => {
    expect(calculateWeightGainSinceLastPostHdKg(61.2, 58.5)).toBe(2.7);
    expect(calculateWeightGainSinceLastPostHdKg(58.2, 58.5)).toBe(-0.3);
    expect(calculateWeightGainSinceLastPostHdKg(Number.NaN, 58.5)).toBeUndefined();
  });
});
