import { DialyzerRepository, PatientRepository, SessionRepository } from "@/data/repositories";
import type { CreateDialyzerInput, UpdateDialyzerInput } from "@/data/repositories";
import type { DialysisSession, Dialyzer, Patient } from "@/types/core";

export interface DialyzerWithSessionCount extends Dialyzer {
  sessionCount: number;
}

export interface DialyzerSnapshot {
  patient?: Patient;
  activeDialyzer?: DialyzerWithSessionCount;
  archivedDialyzers: DialyzerWithSessionCount[];
}

export class DialyzerService {
  constructor(
    private readonly patients: PatientRepository = new PatientRepository(),
    private readonly dialyzers: DialyzerRepository = new DialyzerRepository(),
    private readonly sessions: SessionRepository = new SessionRepository(),
  ) {}

  async getSnapshot(): Promise<DialyzerSnapshot> {
    const patient = await this.patients.getPrimaryPatient();
    if (!patient) return { archivedDialyzers: [] };

    const [dialyzers, sessions] = await Promise.all([
      this.dialyzers.listByPatient(patient.id),
      this.sessions.listByPatient(patient.id),
    ]);
    const withCounts = this.attachSessionCounts(dialyzers, sessions);

    return {
      patient,
      activeDialyzer: withCounts.find((dialyzer) => dialyzer.status === "active"),
      archivedDialyzers: withCounts.filter((dialyzer) => dialyzer.status === "archived"),
    };
  }

  async saveDialyzer(patientId: string, input: Omit<CreateDialyzerInput, "patientId" | "status">, dialyzerId?: string) {
    if (dialyzerId) {
      return this.dialyzers.update(dialyzerId, {
        ...input,
        patientId,
        status: "active",
      } satisfies UpdateDialyzerInput);
    }

    return this.dialyzers.createAsOnlyActive({
      ...input,
      patientId,
      status: "active",
    });
  }

  async archiveDialyzer(id: string) {
    return this.dialyzers.archive(id);
  }

  private attachSessionCounts(dialyzers: Dialyzer[], sessions: DialysisSession[]): DialyzerWithSessionCount[] {
    const counts = new Map<string, number>();

    for (const session of sessions) {
      if (!session.dialyzerId) continue;
      counts.set(session.dialyzerId, (counts.get(session.dialyzerId) ?? 0) + 1);
    }

    return dialyzers.map((dialyzer) => ({
      ...dialyzer,
      sessionCount: counts.get(dialyzer.id) ?? 0,
    }));
  }
}

export const dialyzerService = new DialyzerService();
