import { db as defaultDb, type DialyCareDatabase } from "@/data/db/dialycare-db";
import { assertValid, validateMedicine } from "@/data/validation/core-validation";
import type { Medicine } from "@/types/core";

import { withNewRecord, withUpdatedAt } from "./record-utils";

export type CreateMedicineInput = Omit<Medicine, "id" | "createdAt" | "updatedAt">;
export type UpdateMedicineInput = Partial<CreateMedicineInput>;

export class MedicineRepository {
  constructor(private readonly database: DialyCareDatabase = defaultDb) {}

  async listByPatient(patientId: string) {
    return this.database.medicines.where("patientId").equals(patientId).sortBy("name");
  }

  async get(id: string) {
    return this.database.medicines.get(id);
  }

  async create(input: CreateMedicineInput) {
    assertValid(validateMedicine(input));
    const medicine = withNewRecord("medicine", input);
    await this.database.medicines.add(medicine);
    return medicine;
  }

  async update(id: string, input: UpdateMedicineInput) {
    const existing = await this.get(id);
    if (!existing) throw new Error("Medicine not found.");

    const updated = withUpdatedAt({ ...existing, ...input });
    assertValid(validateMedicine(updated));
    await this.database.medicines.put(updated);
    return updated;
  }

  async delete(id: string) {
    await this.database.medicines.delete(id);
  }
}

export const medicineRepository = new MedicineRepository();
