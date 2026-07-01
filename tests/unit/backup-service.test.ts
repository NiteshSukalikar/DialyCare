import { afterEach, describe, expect, it } from "vitest";

import { DialyCareDatabase } from "@/data/db/dialycare-db";
import { DialyzerRepository, DocumentRepository, MedicineRepository, PatientRepository, SessionRepository, SettingsRepository } from "@/data/repositories";
import { buildDemoDialyzer, buildDemoMedicine, buildDemoSessions, demoPatient } from "@/data/seed/demo-data";
import { BackupService } from "@/features/backup/services/backup-service";

function createTestDb(name = `dialycare_backup_test_${crypto.randomUUID()}`) {
  return new DialyCareDatabase(name);
}

describe("backup service", () => {
  let databases: DialyCareDatabase[] = [];

  afterEach(async () => {
    await Promise.all(
      databases.map(async (database) => {
        await database.delete();
        database.close();
      }),
    );
    databases = [];
  });

  it("exports and restores core MVP records into a fresh database", async () => {
    const sourceDb = createTestDb();
    const targetDb = createTestDb();
    databases.push(sourceDb, targetDb);

    const patients = new PatientRepository(sourceDb);
    const dialyzers = new DialyzerRepository(sourceDb);
    const sessions = new SessionRepository(sourceDb);
    const medicines = new MedicineRepository(sourceDb);
    const documents = new DocumentRepository(sourceDb);
    const settings = new SettingsRepository(sourceDb);

    const patient = await patients.create(demoPatient);
    const dialyzer = await dialyzers.create(buildDemoDialyzer(patient.id));
    const [sessionInput] = buildDemoSessions(patient.id, dialyzer.id);
    if (!sessionInput) throw new Error("Demo session fixture is missing.");

    await sessions.create(sessionInput);
    await medicines.create(buildDemoMedicine(patient.id));
    await documents.create({
      patientId: patient.id,
      title: "June booklet",
      category: "dialysis-booklet",
      fileType: "image",
      fileName: "booklet.jpg",
      mimeType: "image/jpeg",
      date: "2026-06-22",
      notes: "Stored metadata is included in JSON backup.",
    });
    await settings.update({ backupReminderEnabled: true, backupReminderDays: 3 });

    const sourceService = new BackupService(sourceDb);
    const targetService = new BackupService(targetDb);
    const json = await sourceService.exportBackupJson();
    const backup = targetService.parseBackupJson(json);
    expect(backup.data.medicines).toHaveLength(1);
    expect(backup.data.medicines[0]?.name).toBe("Calcium Tablet");

    const result = await targetService.restoreBackup(backup);

    expect(result).toMatchObject({
      patients: 1,
      sessions: 1,
      dialyzers: 1,
      medicines: 1,
      documents: 1,
      settings: 1,
    });

    const restoredSnapshot = await targetService.getSnapshot();
    expect(restoredSnapshot.patient?.name).toBe(demoPatient.name);
    expect(restoredSnapshot.sessions[0]?.preWeightKg).toBe(sessionInput.preWeightKg);
    expect(restoredSnapshot.medicines[0]?.name).toBe("Calcium Tablet");
    expect(restoredSnapshot.documents[0]?.title).toBe("June booklet");
    expect(restoredSnapshot.settings[0]?.backupReminderDays).toBe(3);
  });

  it("exports and restores uploaded document files through the full backup package", async () => {
    const sourceDb = createTestDb();
    const targetDb = createTestDb();
    databases.push(sourceDb, targetDb);

    const patients = new PatientRepository(sourceDb);
    const documents = new DocumentRepository(sourceDb);
    const patient = await patients.create(demoPatient);
    const fileBlob = new Blob(["booklet image bytes"], { type: "image/jpeg" });

    await documents.create({
      patientId: patient.id,
      title: "Booklet page with file",
      category: "dialysis-booklet",
      fileType: "image",
      fileName: "booklet.jpg",
      mimeType: "image/jpeg",
      fileBlob,
      date: "2026-06-22",
      notes: "This file should travel with the backup package.",
    });

    const sourceService = new BackupService(sourceDb);
    const targetService = new BackupService(targetDb);
    const backupPackage = await sourceService.exportBackupPackage();
    const preview = await targetService.parseBackupPackage(backupPackage);

    expect(preview.backup.data.documents[0]?.backupFilePath).toContain("documents/");
    expect(preview.missingFiles).toHaveLength(0);

    const result = await targetService.restoreBackupPackage(preview);
    expect(result).toMatchObject({ patients: 1, documents: 1, missingFiles: 0 });

    const restoredSnapshot = await targetService.getSnapshot();
    const restoredDocument = restoredSnapshot.documents[0];
    expect(restoredDocument?.title).toBe("Booklet page with file");
    expect(restoredDocument?.fileBlob).toBeInstanceOf(Blob);
    await expect(restoredDocument?.fileBlob?.text()).resolves.toBe("booklet image bytes");
  });

  it("rejects invalid backup files before restore", () => {
    const database = createTestDb();
    databases.push(database);
    const service = new BackupService(database);

    expect(() => service.parseBackupJson("not-json")).toThrow("Backup file is not valid JSON.");
    expect(() => service.parseBackupJson(JSON.stringify({ appName: "OtherApp" }))).toThrow("This does not look like a DialyCare backup.");
  });

  it("rejects malformed medicine records before import", async () => {
    const database = createTestDb();
    databases.push(database);
    const service = new BackupService(database);
    const backup = await service.buildBackup();

    expect(() =>
      service.parseBackupJson(
        JSON.stringify({
          ...backup,
          data: {
            ...backup.data,
            medicines: [{ id: "medicine_1", patientId: "patient_1" }],
          },
        }),
      ),
    ).toThrow("Backup contains an invalid medicine record.");
  });
});
