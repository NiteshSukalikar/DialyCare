import { afterEach, describe, expect, it } from "vitest";

import { DialyCareDatabase } from "@/data/db/dialycare-db";
import { buildDemoDialyzer, buildDemoSessions, demoPatient } from "@/data/seed/demo-data";
import { DialyzerRepository, PatientRepository, SessionRepository } from "@/data/repositories";
import { validateDialysisSession, validatePatient } from "@/data/validation/core-validation";
import {
  calculateWeightGainVsDryKg,
  calculateWeightLossKg,
  nextDialyzerUseNumber,
} from "@/features/sessions/utils/session-calculations";
import type { CreateSessionInput } from "@/data/repositories";

function createTestDb() {
  return new DialyCareDatabase(`dialycare_test_${crypto.randomUUID()}`);
}

function firstSession(patientId: string, dialyzerId: string): CreateSessionInput {
  const [session] = buildDemoSessions(patientId, dialyzerId);
  if (!session) throw new Error("Demo session fixture is missing.");
  return session;
}

describe("core validation", () => {
  it("accepts MVP patient fields and rejects unsafe ranges", () => {
    expect(validatePatient(demoPatient).valid).toBe(true);
    expect(validatePatient({ ...demoPatient, name: "", dryWeightKg: 0 }).errors).toContain("Patient name is required.");
  });

  it("validates session required fields and numeric ranges", () => {
    const validSession = firstSession("patient_1", "dialyzer_1");

    expect(validateDialysisSession(validSession).valid).toBe(true);
    expect(validateDialysisSession({ ...validSession, postWeightKg: 70, ufRemovedLiters: -1 }).valid).toBe(false);
  });
});

describe("session calculations", () => {
  it("calculates weight loss, dry-weight gain, and next dialyzer usage", () => {
    expect(calculateWeightLossKg(62.4, 58.5)).toBe(3.9);
    expect(calculateWeightGainVsDryKg(62.4, 57)).toBe(5.4);
    expect(nextDialyzerUseNumber(7)).toBe(8);
  });
});

describe("repository data flow", () => {
  let database: DialyCareDatabase;

  afterEach(async () => {
    if (database) {
      await database.delete();
      database.close();
    }
  });

  it("persists patient, dialyzer, and session records in IndexedDB", async () => {
    database = createTestDb();
    const patients = new PatientRepository(database);
    const dialyzers = new DialyzerRepository(database);
    const sessions = new SessionRepository(database);

    const patient = await patients.create(demoPatient);
    const dialyzer = await dialyzers.create(buildDemoDialyzer(patient.id));
    const sessionInput = firstSession(patient.id, dialyzer.id);
    const session = await sessions.create(sessionInput);

    await database.close();

    const reopened = new DialyCareDatabase(database.name);
    const savedPatient = await reopened.patients.get(patient.id);
    const savedSession = await reopened.sessions.get(session.id);
    const savedDialyzer = await reopened.dialyzers.get(dialyzer.id);

    expect(savedPatient?.name).toBe(demoPatient.name);
    expect(savedSession?.preWeightKg).toBe(sessionInput.preWeightKg);
    expect(savedDialyzer?.currentUsage).toBe(sessionInput.dialyzerUseNumber);

    await reopened.delete();
    reopened.close();
  });

  it("lists newest sessions first and refreshes dialyzer usage on edit", async () => {
    database = createTestDb();
    const patients = new PatientRepository(database);
    const dialyzers = new DialyzerRepository(database);
    const sessions = new SessionRepository(database);

    const patient = await patients.create(demoPatient);
    const dialyzer = await dialyzers.create(buildDemoDialyzer(patient.id));
    const sessionInput = firstSession(patient.id, dialyzer.id);

    const older = await sessions.create({ ...sessionInput, date: "2026-06-20", dialyzerUseNumber: 4 });
    const newer = await sessions.create({ ...sessionInput, date: "2026-06-22", dialyzerUseNumber: 5 });
    const ordered = await sessions.listByPatient(patient.id);

    expect(ordered.map((session) => session.id)).toEqual([newer.id, older.id]);

    await sessions.update(older.id, { dialyzerUseNumber: 6, date: "2026-06-23" });
    const updatedDialyzer = await dialyzers.get(dialyzer.id);

    expect(updatedDialyzer?.currentUsage).toBe(6);
    expect(updatedDialyzer?.lastUsedDate).toBe("2026-06-23");
  });

  it("keeps UI-facing code behind typed repositories", async () => {
    database = createTestDb();
    const patients = new PatientRepository(database);
    const patient = await patients.create(demoPatient);

    const updated = await patients.update(patient.id, { dryWeightKg: 58 });

    expect(updated.dryWeightKg).toBe(58);
    expect(await patients.getPrimaryPatient()).toMatchObject({ id: patient.id });
  });
});
