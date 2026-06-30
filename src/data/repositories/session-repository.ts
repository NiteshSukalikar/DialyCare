import { db as defaultDb, type DialyCareDatabase } from "@/data/db/dialycare-db";
import { assertValid, validateDialysisSession } from "@/data/validation/core-validation";
import type { DialysisSession } from "@/types/core";

import { withNewRecord, withUpdatedAt } from "./record-utils";

export type CreateSessionInput = Omit<DialysisSession, "id" | "createdAt" | "updatedAt">;
export type UpdateSessionInput = Partial<CreateSessionInput>;

export class SessionRepository {
  constructor(private readonly database: DialyCareDatabase = defaultDb) {}

  async listByPatient(patientId: string) {
    return this.database.sessions.where("patientId").equals(patientId).reverse().sortBy("date");
  }

  async get(id: string) {
    return this.database.sessions.get(id);
  }

  async getLatest(patientId: string) {
    const sessions = await this.listByPatient(patientId);
    return sessions[0];
  }

  async create(input: CreateSessionInput) {
    assertValid(validateDialysisSession(input));
    const session = withNewRecord("session", input);

    await this.database.transaction("rw", this.database.sessions, this.database.dialyzers, async () => {
      await this.database.sessions.add(session);

      if (session.dialyzerId) {
        const dialyzer = await this.database.dialyzers.get(session.dialyzerId);
        if (dialyzer) {
          await this.database.dialyzers.put(
            withUpdatedAt({
              ...dialyzer,
              currentUsage: Math.max(dialyzer.currentUsage, session.dialyzerUseNumber ?? dialyzer.currentUsage + 1),
              lastUsedDate: session.date,
            }),
          );
        }
      }
    });

    return session;
  }

  async update(id: string, input: UpdateSessionInput) {
    const existing = await this.get(id);
    if (!existing) throw new Error("Session not found.");

    const updated = withUpdatedAt({ ...existing, ...input });
    assertValid(validateDialysisSession(updated));
    await this.database.sessions.put(updated);
    return updated;
  }

  async delete(id: string) {
    await this.database.sessions.delete(id);
  }
}

export const sessionRepository = new SessionRepository();
