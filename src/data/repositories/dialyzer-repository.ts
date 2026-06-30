import { db as defaultDb, type DialyCareDatabase } from "@/data/db/dialycare-db";
import { assertValid, validateDialyzer } from "@/data/validation/core-validation";
import type { Dialyzer } from "@/types/core";

import { withNewRecord, withUpdatedAt } from "./record-utils";

export type CreateDialyzerInput = Omit<Dialyzer, "id" | "createdAt" | "updatedAt">;
export type UpdateDialyzerInput = Partial<CreateDialyzerInput>;

export class DialyzerRepository {
  constructor(private readonly database: DialyCareDatabase = defaultDb) {}

  async listByPatient(patientId: string) {
    return this.database.dialyzers.where("patientId").equals(patientId).reverse().sortBy("startedOn");
  }

  async get(id: string) {
    return this.database.dialyzers.get(id);
  }

  async getActive(patientId: string) {
    const dialyzers = await this.database.dialyzers
      .where("patientId")
      .equals(patientId)
      .filter((dialyzer) => dialyzer.status === "active")
      .toArray();
    return dialyzers[0];
  }

  async create(input: CreateDialyzerInput) {
    assertValid(validateDialyzer(input));
    const dialyzer = withNewRecord("dialyzer", input);
    await this.database.dialyzers.add(dialyzer);
    return dialyzer;
  }

  async update(id: string, input: UpdateDialyzerInput) {
    const existing = await this.get(id);
    if (!existing) throw new Error("Dialyzer not found.");

    const updated = withUpdatedAt({ ...existing, ...input });
    assertValid(validateDialyzer(updated));
    await this.database.dialyzers.put(updated);
    return updated;
  }

  async incrementUsage(id: string, usedOn: string) {
    const existing = await this.get(id);
    if (!existing) throw new Error("Dialyzer not found.");

    return this.update(id, {
      currentUsage: existing.currentUsage + 1,
      lastUsedDate: usedOn,
    });
  }

  async archive(id: string) {
    return this.update(id, { status: "archived" });
  }
}

export const dialyzerRepository = new DialyzerRepository();
