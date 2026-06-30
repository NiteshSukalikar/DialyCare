import { DialyzerRepository, PatientRepository, SettingsRepository } from "@/data/repositories";
import type { CreateDialyzerInput, CreatePatientInput } from "@/data/repositories";
import type { Dialyzer, Patient } from "@/types/core";

export interface PatientSetupInput {
  patient: CreatePatientInput;
  initialDialyzer?: Omit<CreateDialyzerInput, "patientId" | "status">;
}

export interface PatientSetupSnapshot {
  patient?: Patient;
  activeDialyzer?: Dialyzer;
}

export class PatientSetupService {
  constructor(
    private readonly patients: PatientRepository = new PatientRepository(),
    private readonly dialyzers: DialyzerRepository = new DialyzerRepository(),
    private readonly settings: SettingsRepository = new SettingsRepository(),
  ) {}

  async getSnapshot(): Promise<PatientSetupSnapshot> {
    const patient = await this.patients.getPrimaryPatient();
    if (!patient) return {};

    return {
      patient,
      activeDialyzer: await this.dialyzers.getActive(patient.id),
    };
  }

  async hasCompletedSetup() {
    const patient = await this.patients.getPrimaryPatient();
    return Boolean(patient);
  }

  async saveSetup(input: PatientSetupInput) {
    const existingPatient = await this.patients.getPrimaryPatient();
    const patient = existingPatient
      ? await this.patients.update(existingPatient.id, input.patient)
      : await this.patients.create(input.patient);

    let activeDialyzer: Dialyzer | undefined;

    if (input.initialDialyzer) {
      const existingDialyzer = await this.dialyzers.getActive(patient.id);
      const dialyzerInput = {
        ...input.initialDialyzer,
        patientId: patient.id,
        status: "active" as const,
      };

      activeDialyzer = existingDialyzer
        ? await this.dialyzers.update(existingDialyzer.id, dialyzerInput)
        : await this.dialyzers.create(dialyzerInput);
    }

    await this.settings.update({ firstRunComplete: true });

    return { patient, activeDialyzer };
  }
}

export const patientSetupService = new PatientSetupService();
