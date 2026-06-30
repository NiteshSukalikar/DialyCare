export const DATABASE_NAME = "dialycare";
export const DATABASE_VERSION = 1;

export const stores = {
  patients: "id, name, uhid, createdAt, updatedAt",
  sessions: "id, patientId, date, dialyzerId, updatedAt",
  dialyzers: "id, patientId, status, startedOn, updatedAt",
  medicines: "id, patientId, status, name, updatedAt",
  documents: "id, patientId, category, date, updatedAt",
  settings: "id, firstRunComplete, updatedAt",
} as const;
