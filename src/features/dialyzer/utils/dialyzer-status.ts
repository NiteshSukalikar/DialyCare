import type { Dialyzer } from "@/types/core";

export type DialyzerUsageState = "normal" | "warning" | "max-reached";

export function getDialyzerUsagePercent(dialyzer: Pick<Dialyzer, "currentUsage" | "maxUsage">) {
  if (dialyzer.maxUsage <= 0) return 0;
  return Math.min(100, Math.round((dialyzer.currentUsage / dialyzer.maxUsage) * 100));
}

export function getDialyzerUsageState(dialyzer: Pick<Dialyzer, "currentUsage" | "maxUsage">): DialyzerUsageState {
  if (dialyzer.currentUsage >= dialyzer.maxUsage) return "max-reached";

  const remainingUses = dialyzer.maxUsage - dialyzer.currentUsage;
  const nearLimitByCount = remainingUses <= 2;
  const nearLimitByRatio = dialyzer.currentUsage / dialyzer.maxUsage >= 0.8;

  return nearLimitByCount || nearLimitByRatio ? "warning" : "normal";
}

export function getDialyzerStatusLabel(dialyzer: Pick<Dialyzer, "currentUsage" | "maxUsage">) {
  const state = getDialyzerUsageState(dialyzer);

  if (state === "max-reached") return "Change recommended";
  if (state === "warning") return "Near limit";
  return "Active";
}
