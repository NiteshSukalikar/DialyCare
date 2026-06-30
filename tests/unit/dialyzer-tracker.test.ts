import { afterEach, describe, expect, it } from "vitest";

import { DialyCareDatabase } from "@/data/db/dialycare-db";
import { buildDemoDialyzer, buildDemoSessions, demoPatient } from "@/data/seed/demo-data";
import { DialyzerRepository, PatientRepository, SessionRepository } from "@/data/repositories";
import { DialyzerService } from "@/features/dialyzer/services/dialyzer-service";
import {
  getDialyzerStatusLabel,
  getDialyzerUsagePercent,
  getDialyzerUsageState,
} from "@/features/dialyzer/utils/dialyzer-status";

function createTestDb() {
  return new DialyCareDatabase(`dialycare_dialyzer_test_${crypto.randomUUID()}`);
}

describe("dialyzer tracker utilities", () => {
  it("classifies normal, near-limit, and max-reached usage", () => {
    expect(getDialyzerUsagePercent({ currentUsage: 6, maxUsage: 12 })).toBe(50);
    expect(getDialyzerUsageState({ currentUsage: 6, maxUsage: 12 })).toBe("normal");
    expect(getDialyzerUsageState({ currentUsage: 10, maxUsage: 12 })).toBe("warning");
    expect(getDialyzerUsageState({ currentUsage: 12, maxUsage: 12 })).toBe("max-reached");
    expect(getDialyzerStatusLabel({ currentUsage: 12, maxUsage: 12 })).toBe("Change recommended");
  });
});

describe("dialyzer tracker service", () => {
  let database: DialyCareDatabase;

  afterEach(async () => {
    if (database) {
      await database.delete();
      database.close();
    }
  });

  it("archives the old active dialyzer when a new active dialyzer is saved", async () => {
    database = createTestDb();
    const patients = new PatientRepository(database);
    const dialyzers = new DialyzerRepository(database);
    const sessions = new SessionRepository(database);
    const service = new DialyzerService(patients, dialyzers, sessions);

    const patient = await patients.create(demoPatient);
    const firstDialyzer = await dialyzers.create(buildDemoDialyzer(patient.id));
    const [firstSession] = buildDemoSessions(patient.id, firstDialyzer.id);
    if (!firstSession) throw new Error("Demo session fixture is missing.");
    await sessions.create(firstSession);

    const nextDialyzer = await service.saveDialyzer(patient.id, {
      name: "FX80",
      startedOn: "2026-06-30",
      currentUsage: 0,
      maxUsage: 12,
    });

    const snapshot = await service.getSnapshot();

    expect(snapshot.activeDialyzer?.id).toBe(nextDialyzer.id);
    expect(snapshot.archivedDialyzers.map((dialyzer) => dialyzer.id)).toContain(firstDialyzer.id);
    expect(snapshot.archivedDialyzers.find((dialyzer) => dialyzer.id === firstDialyzer.id)?.sessionCount).toBe(1);
  });
});
