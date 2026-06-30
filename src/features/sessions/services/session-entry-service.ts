import { DialyzerRepository, PatientRepository, SessionRepository } from "@/data/repositories";
import type { CreateSessionInput, UpdateSessionInput } from "@/data/repositories";
import type { DialysisSession, Dialyzer, Patient } from "@/types/core";

export interface SessionEntrySnapshot {
  patient?: Patient;
  activeDialyzer?: Dialyzer;
  session?: DialysisSession;
}

export class SessionEntryService {
  constructor(
    private readonly patients: PatientRepository = new PatientRepository(),
    private readonly dialyzers: DialyzerRepository = new DialyzerRepository(),
    private readonly sessions: SessionRepository = new SessionRepository(),
  ) {}

  async getSnapshot(sessionId?: string): Promise<SessionEntrySnapshot> {
    const patient = await this.patients.getPrimaryPatient();
    if (!patient) return {};

    const [activeDialyzer, session] = await Promise.all([
      this.dialyzers.getActive(patient.id),
      sessionId ? this.sessions.get(sessionId) : Promise.resolve(undefined),
    ]);

    return { patient, activeDialyzer, session };
  }

  async listSessions(patientId: string) {
    return this.sessions.listByPatient(patientId);
  }

  async saveSession(input: CreateSessionInput, sessionId?: string) {
    if (sessionId) {
      return this.sessions.update(sessionId, input satisfies UpdateSessionInput);
    }

    return this.sessions.create(input);
  }

  async deleteSession(sessionId: string) {
    await this.sessions.delete(sessionId);
  }
}

export const sessionEntryService = new SessionEntryService();

