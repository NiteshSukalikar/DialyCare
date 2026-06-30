import type { TimestampedRecord } from "@/types/core";

export function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function withNewRecord<T extends object>(prefix: string, data: T): T & TimestampedRecord {
  const now = nowIso();

  return {
    ...data,
    id: createId(prefix),
    createdAt: now,
    updatedAt: now,
  };
}

export function withUpdatedAt<T extends object>(data: T): T & { updatedAt: string } {
  return {
    ...data,
    updatedAt: nowIso(),
  };
}
