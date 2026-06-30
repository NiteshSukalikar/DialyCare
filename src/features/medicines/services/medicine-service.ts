import { MedicineRepository, PatientRepository } from "@/data/repositories";
import type { CreateMedicineInput, UpdateMedicineInput } from "@/data/repositories";
import type { Medicine, MedicineStatus, Patient } from "@/types/core";

export interface MedicineSnapshot {
  patient?: Patient;
  activeMedicines: Medicine[];
  stoppedMedicines: Medicine[];
}

export type MedicineFormInput = Omit<CreateMedicineInput, "patientId">;

export class MedicineService {
  constructor(
    private readonly patients: PatientRepository = new PatientRepository(),
    private readonly medicines: MedicineRepository = new MedicineRepository(),
  ) {}

  async getSnapshot(): Promise<MedicineSnapshot> {
    const patient = await this.patients.getPrimaryPatient();
    if (!patient) return { activeMedicines: [], stoppedMedicines: [] };

    const medicines = await this.medicines.listByPatient(patient.id);

    return {
      patient,
      activeMedicines: medicines.filter((medicine) => medicine.status === "active"),
      stoppedMedicines: medicines.filter((medicine) => medicine.status === "stopped"),
    };
  }

  async saveMedicine(patientId: string, input: MedicineFormInput, medicineId?: string) {
    const cleanedInput = this.cleanInput({ ...input, patientId });

    if (medicineId) {
      return this.medicines.update(medicineId, cleanedInput);
    }

    return this.medicines.create(cleanedInput as CreateMedicineInput);
  }

  async setMedicineStatus(id: string, status: MedicineStatus) {
    const update: UpdateMedicineInput = {
      status,
      endDate: status === "stopped" ? new Date().toISOString().slice(0, 10) : undefined,
    };

    return this.medicines.update(id, update);
  }

  async deleteMedicine(id: string) {
    await this.medicines.delete(id);
  }

  private cleanInput(input: CreateMedicineInput): CreateMedicineInput {
    return {
      patientId: input.patientId,
      name: input.name.trim(),
      dosage: cleanOptional(input.dosage),
      frequency: cleanOptional(input.frequency),
      timing: cleanOptional(input.timing),
      startDate: cleanOptional(input.startDate),
      endDate: cleanOptional(input.endDate),
      instructions: cleanOptional(input.instructions),
      doctorNotes: cleanOptional(input.doctorNotes),
      status: input.status,
    };
  }
}

function cleanOptional(value: string | undefined) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : undefined;
}

export const medicineService = new MedicineService();
