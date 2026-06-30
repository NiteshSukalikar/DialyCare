import { db as defaultDb, type DialyCareDatabase } from "@/data/db/dialycare-db";
import type { AppSettings } from "@/types/core";

import { withNewRecord, withUpdatedAt } from "./record-utils";

const DEFAULT_SETTINGS_ID = "settings_default";

export type UpdateSettingsInput = Partial<Omit<AppSettings, "id" | "createdAt" | "updatedAt">>;

export class SettingsRepository {
  constructor(private readonly database: DialyCareDatabase = defaultDb) {}

  async get() {
    const existing = await this.database.settings.get(DEFAULT_SETTINGS_ID);
    if (existing) return existing;

    const settings = {
      ...withNewRecord("settings", {
        theme: "system",
        firstRunComplete: false,
        backupReminderEnabled: true,
        backupReminderDays: 7,
      } satisfies Omit<AppSettings, "id" | "createdAt" | "updatedAt">),
      id: DEFAULT_SETTINGS_ID,
    };

    await this.database.settings.put(settings);
    return settings;
  }

  async update(input: UpdateSettingsInput) {
    const existing = await this.get();
    const updated = withUpdatedAt({ ...existing, ...input });
    await this.database.settings.put(updated);
    return updated;
  }
}

export const settingsRepository = new SettingsRepository();
