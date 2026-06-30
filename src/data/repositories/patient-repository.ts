import { db as defaultDb, type DialyCareDatabase } from "@/data/db/dialycare-db";
import { assertValid, validatePatient } from "@/data/validation/core-validation";
import type { Patient } from "@/types/core";

import { withNewRecord, withUpdatedAt } from "./record-utils";

export type CreatePatientInput = Omit<Patient, "id" | "createdAt" | "updatedAt">;
export type UpdatePatientInput = Partial<CreatePatientInput>;

export class PatientRepository {
  constructor(private readonly database: DialyCareDatabase = defaultDb) {}

  async list() {
    return this.database.patients.orderBy("updatedAt").reverse().toArray();
  }

  async get(id: string) {
    return this.database.patients.get(id);
  }

  async getPrimaryPatient() {
    return this.database.patients.orderBy("createdAt").first();
  }

  async create(input: CreatePatientInput) {
    assertValid(validatePatient(input));
    const patient = withNewRecord("patient", input);
    await this.database.patients.add(patient);
    return patient;
  }

  async update(id: string, input: UpdatePatientInput) {
    const existing = await this.get(id);
    if (!existing) throw new Error("Patient not found.");

    const updated = withUpdatedAt({ ...existing, ...input });
    assertValid(validatePatient(updated));
    await this.database.patients.put(updated);
    return updated;
  }

  async delete(id: string) {
    await this.database.transaction("rw", this.database.patients, this.database.sessions, this.database.dialyzers, this.database.medicines, this.database.documents, async () => {
      await this.database.sessions.where("patientId").equals(id).delete();
      await this.database.dialyzers.where("patientId").equals(id).delete();
      await this.database.medicines.where("patientId").equals(id).delete();
      await this.database.documents.where("patientId").equals(id).delete();
      await this.database.patients.delete(id);
    });
  }
}

export const patientRepository = new PatientRepository();
