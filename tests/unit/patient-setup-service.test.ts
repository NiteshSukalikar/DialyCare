import { afterEach, describe, expect, it } from "vitest";

import { DialyCareDatabase } from "@/data/db/dialycare-db";
import { DialyzerRepository, PatientRepository, SettingsRepository } from "@/data/repositories";
import { demoPatient } from "@/data/seed/demo-data";
import { PatientSetupService } from "@/features/patient/services/patient-setup-service";

function createTestDb() {
  return new DialyCareDatabase(`dialycare_patient_setup_${crypto.randomUUID()}`);
}

describe("patient setup service", () => {
  let database: DialyCareDatabase | undefined;

  afterEach(async () => {
    if (database) {
      await database.delete();
      database.close();
    }
  });

  it("creates one patient profile, optional active dialyzer, and completes first run", async () => {
    database = createTestDb();
    const service = new PatientSetupService(
      new PatientRepository(database),
      new DialyzerRepository(database),
      new SettingsRepository(database),
    );

    const result = await service.saveSetup({
      patient: demoPatient,
      initialDialyzer: {
        name: "F8HPS",
        startedOn: "2026-06-01",
        currentUsage: 3,
        maxUsage: 12,
      },
    });

    const snapshot = await service.getSnapshot();
    const settings = await new SettingsRepository(database).get();
    const databaseName = database.name;

    expect(result.patient.name).toBe(demoPatient.name);
    expect(snapshot.patient?.id).toBe(result.patient.id);
    expect(snapshot.activeDialyzer).toMatchObject({
      patientId: result.patient.id,
      name: "F8HPS",
      currentUsage: 3,
      maxUsage: 12,
      status: "active",
    });
    expect(settings.firstRunComplete).toBe(true);

    database.close();
    const reopened = new DialyCareDatabase(databaseName);

    expect(await reopened.patients.get(result.patient.id)).toMatchObject({ name: demoPatient.name });
    expect(await reopened.dialyzers.get(result.activeDialyzer?.id ?? "")).toMatchObject({ name: "F8HPS" });

    await reopened.delete();
    reopened.close();
    database = undefined;
  });

  it("updates the existing one-patient setup instead of creating another patient", async () => {
    database = createTestDb();
    const service = new PatientSetupService(
      new PatientRepository(database),
      new DialyzerRepository(database),
      new SettingsRepository(database),
    );

    const created = await service.saveSetup({ patient: demoPatient });
    const updated = await service.saveSetup({
      patient: {
        ...demoPatient,
        name: "Updated Patient",
        dryWeightKg: 58,
      },
    });

    expect(updated.patient.id).toBe(created.patient.id);
    expect(await database.patients.count()).toBe(1);
    expect((await service.getSnapshot()).patient).toMatchObject({
      name: "Updated Patient",
      dryWeightKg: 58,
    });
  });
});
