import type { DialysisSession } from "@/types/core";

export type SessionHistoryFilter = "all" | "week" | "month" | "last-3-months" | "custom";

export interface CustomDateRange {
  from?: string;
  to?: string;
}

export interface SessionMonthGroup {
  monthKey: string;
  label: string;
  sessions: DialysisSession[];
}

function toDateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? 6 : day - 1;
  copy.setDate(copy.getDate() - diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
}

function isWithin(session: DialysisSession, from?: string, to?: string) {
  if (from && session.date < from) return false;
  if (to && session.date > to) return false;
  return true;
}

export function sortSessionsNewestFirst(sessions: DialysisSession[]) {
  return [...sessions].sort((a, b) => {
    const aKey = `${a.date}T${a.sessionTime ?? "00:00"}`;
    const bKey = `${b.date}T${b.sessionTime ?? "00:00"}`;
    return bKey.localeCompare(aKey) || b.createdAt.localeCompare(a.createdAt);
  });
}

export function filterSessions(
  sessions: DialysisSession[],
  filter: SessionHistoryFilter,
  today = new Date(),
  customRange: CustomDateRange = {},
) {
  const sorted = sortSessionsNewestFirst(sessions);

  if (filter === "all") return sorted;

  if (filter === "custom") {
    return sorted.filter((session) => isWithin(session, customRange.from, customRange.to));
  }

  const todayKey = toDateOnly(today);
  const from =
    filter === "week"
      ? toDateOnly(startOfWeek(today))
      : filter === "month"
        ? toDateOnly(startOfMonth(today))
        : toDateOnly(addMonths(today, -3));

  return sorted.filter((session) => isWithin(session, from, todayKey));
}

export function groupSessionsByMonth(sessions: DialysisSession[]) {
  const groups = new Map<string, DialysisSession[]>();

  for (const session of sortSessionsNewestFirst(sessions)) {
    const monthKey = session.date.slice(0, 7);
    groups.set(monthKey, [...(groups.get(monthKey) ?? []), session]);
  }

  return Array.from(groups.entries()).map(([monthKey, groupedSessions]) => {
    const [year, month] = monthKey.split("-");
    const label = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(
      new Date(Number(year), Number(month) - 1, 1),
    );

    return {
      monthKey,
      label,
      sessions: groupedSessions,
    };
  });
}
