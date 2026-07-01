import Dexie, { type EntityTable } from "dexie";

import { DATABASE_NAME, DATABASE_VERSION, stores } from "@/data/db/schema";
import type { AppSettings, DialysisSession, Dialyzer, Medicine, Patient, PatientDocument } from "@/types/core";

export class DialyCareDatabase extends Dexie {
  patients!: EntityTable<Patient, "id">;
  sessions!: EntityTable<DialysisSession, "id">;
  dialyzers!: EntityTable<Dialyzer, "id">;
  medicines!: EntityTable<Medicine, "id">;
  documents!: EntityTable<PatientDocument, "id">;
  settings!: EntityTable<AppSettings, "id">;

  constructor(databaseName = DATABASE_NAME) {
    super(databaseName);

    this.version(1).stores({
      patients: "id, name, uhid, createdAt, updatedAt",
      sessions: "id, patientId, date, dialyzerId, updatedAt",
      dialyzers: "id, patientId, status, startedOn, updatedAt",
      medicines: "id, patientId, status, name, updatedAt",
      documents: "id, patientId, category, date, updatedAt",
      settings: "id, firstRunComplete, updatedAt",
    });
    this.version(DATABASE_VERSION).stores(stores);
  }
}

export const db = new DialyCareDatabase();
