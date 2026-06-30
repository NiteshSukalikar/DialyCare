import { afterEach, describe, expect, it } from "vitest";

import { DialyCareDatabase } from "@/data/db/dialycare-db";
import { MedicineRepository, PatientRepository } from "@/data/repositories";
import { demoPatient } from "@/data/seed/demo-data";
import { MedicineService } from "@/features/medicines/services/medicine-service";

function createTestDb() {
  return new DialyCareDatabase(`dialycare_medicine_test_${crypto.randomUUID()}`);
}

describe("medicine service", () => {
  let database: DialyCareDatabase;

  afterEach(async () => {
    if (database) {
      await database.delete();
      database.close();
    }
  });

  it("groups active and stopped medicines for the primary patient", async () => {
    database = createTestDb();
    const patients = new PatientRepository(database);
    const medicines = new MedicineRepository(database);
    const service = new MedicineService(patients, medicines);

    const patient = await patients.create(demoPatient);
    await service.saveMedicine(patient.id, {
      name: "Calcium tablet",
      dosage: "500 mg",
      frequency: "Morning",
      timing: "After food",
      startDate: "2026-06-01",
      status: "active",
    });
    await service.saveMedicine(patient.id, {
      name: "Old medicine",
      endDate: "2026-06-10",
      status: "stopped",
    });

    const snapshot = await service.getSnapshot();

    expect(snapshot.patient?.id).toBe(patient.id);
    expect(snapshot.activeMedicines.map((medicine) => medicine.name)).toEqual(["Calcium tablet"]);
    expect(snapshot.stoppedMedicines.map((medicine) => medicine.name)).toEqual(["Old medicine"]);
  });

  it("can stop, reactivate, edit, and delete a medicine", async () => {
    database = createTestDb();
    const patients = new PatientRepository(database);
    const medicines = new MedicineRepository(database);
    const service = new MedicineService(patients, medicines);

    const patient = await patients.create(demoPatient);
    const medicine = await service.saveMedicine(patient.id, {
      name: "Calcium tablet",
      status: "active",
    });

    const stopped = await service.setMedicineStatus(medicine.id, "stopped");
    expect(stopped.status).toBe("stopped");
    expect(stopped.endDate).toBeTruthy();

    const reactivated = await service.setMedicineStatus(medicine.id, "active");
    expect(reactivated.status).toBe("active");

    const updated = await service.saveMedicine(
      patient.id,
      {
        name: "Calcium carbonate",
        dosage: "500 mg",
        status: "active",
      },
      medicine.id,
    );
    expect(updated.name).toBe("Calcium carbonate");
    expect(updated.dosage).toBe("500 mg");

    await service.deleteMedicine(medicine.id);
    const snapshot = await service.getSnapshot();
    expect(snapshot.activeMedicines).toHaveLength(0);
  });
});
