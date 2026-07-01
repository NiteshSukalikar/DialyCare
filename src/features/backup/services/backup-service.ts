import { jsPDF } from "jspdf";
import JSZip from "jszip";

import { appConfig } from "@/config/app";
import { db as defaultDb, type DialyCareDatabase } from "@/data/db/dialycare-db";
import { getSessionWeightLossKg } from "@/features/sessions/utils/session-calculations";
import type { AppSettings, DialysisSession, Dialyzer, Medicine, Patient, PatientDocument, ThemePreference } from "@/types/core";

export const BACKUP_SCHEMA_VERSION = 1;

type BackupDocument = Omit<PatientDocument, "fileBlob"> & {
  hasStoredFile: boolean;
  backupFilePath?: string;
};

export interface DialyCareBackup {
  appName: "DialyCare";
  schemaVersion: typeof BACKUP_SCHEMA_VERSION;
  exportedAt: string;
  data: {
    patients: Patient[];
    sessions: DialysisSession[];
    dialyzers: Dialyzer[];
    medicines: Medicine[];
    documents: BackupDocument[];
    settings: AppSettings[];
  };
}

export interface BackupSnapshot {
  patient?: Patient;
  patients: Patient[];
  sessions: DialysisSession[];
  dialyzers: Dialyzer[];
  medicines: Medicine[];
  documents: PatientDocument[];
  settings: AppSettings[];
}

export interface RestoreResult {
  patients: number;
  sessions: number;
  dialyzers: number;
  medicines: number;
  documents: number;
  settings: number;
  missingFiles?: number;
}

export interface BackupPackagePreview {
  backup: DialyCareBackup;
  zip: JSZip;
  missingFiles: string[];
}

export class BackupService {
  constructor(private readonly database: DialyCareDatabase = defaultDb) {}

  async getSnapshot(): Promise<BackupSnapshot> {
    const [patients, sessions, dialyzers, medicines, documents, settings] = await Promise.all([
      this.database.patients.toArray(),
      this.database.sessions.toArray(),
      this.database.dialyzers.toArray(),
      this.database.medicines.toArray(),
      this.database.documents.toArray(),
      this.database.settings.toArray(),
    ]);

    return {
      patient: patients[0],
      patients,
      sessions: sessions.sort(sortSessionsNewestFirst),
      dialyzers: dialyzers.sort((a, b) => b.startedOn.localeCompare(a.startedOn)),
      medicines: medicines.sort((a, b) => a.name.localeCompare(b.name)),
      documents: documents.sort((a, b) => b.date.localeCompare(a.date)),
      settings,
    };
  }

  async buildBackup(): Promise<DialyCareBackup> {
    const snapshot = await this.getSnapshot();

    return {
      appName: "DialyCare",
      schemaVersion: BACKUP_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        patients: snapshot.patients,
        sessions: snapshot.sessions,
        dialyzers: snapshot.dialyzers,
        medicines: snapshot.medicines,
        documents: snapshot.documents.map(({ fileBlob, ...document }) => ({
          ...document,
          hasStoredFile: Boolean(fileBlob),
        })),
        settings: snapshot.settings,
      },
    };
  }

  async exportBackupJson() {
    const backup = await this.buildBackup();
    const json = JSON.stringify(backup, null, 2);
    await this.markBackupExported(backup.exportedAt);
    return json;
  }

  async exportBackupPackage(): Promise<Blob> {
    const snapshot = await this.getSnapshot();
    const zip = new JSZip();
    const documentsFolder = zip.folder("documents");

    const documents: BackupDocument[] = [];

    for (const { fileBlob, ...document } of snapshot.documents) {
      const backupFilePath = fileBlob ? buildDocumentBackupPath(document) : undefined;
      if (fileBlob && backupFilePath) {
        documentsFolder?.file(backupFilePath.replace("documents/", ""), await fileBlob.arrayBuffer());
      }

      documents.push({
        ...document,
        hasStoredFile: Boolean(fileBlob),
        backupFilePath,
      });
    }

    const backup: DialyCareBackup = {
      appName: "DialyCare",
      schemaVersion: BACKUP_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        patients: snapshot.patients,
        sessions: snapshot.sessions,
        dialyzers: snapshot.dialyzers,
        medicines: snapshot.medicines,
        documents,
        settings: snapshot.settings,
      },
    };

    zip.file("backup.json", JSON.stringify(backup, null, 2));
    const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
    await this.markBackupExported(backup.exportedAt);
    return blob;
  }

  parseBackupJson(json: string): DialyCareBackup {
    let parsed: unknown;

    try {
      parsed = JSON.parse(json);
    } catch {
      throw new Error("Backup file is not valid JSON.");
    }

    assertValidBackup(parsed);
    return parsed;
  }

  async parseBackupPackage(file: Blob): Promise<BackupPackagePreview> {
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const backupFile = zip.file("backup.json");
    if (!backupFile) throw new Error("Backup package is missing backup.json.");

    const backup = this.parseBackupJson(await backupFile.async("string"));
    const missingFiles = backup.data.documents
      .filter((document) => document.hasStoredFile && document.backupFilePath && !zip.file(document.backupFilePath))
      .map((document) => document.title);

    return { backup, zip, missingFiles };
  }

  async restoreBackup(backup: DialyCareBackup, filesByDocumentId: Map<string, Blob> = new Map()): Promise<RestoreResult> {
    assertValidBackup(backup);

    const documents: PatientDocument[] = backup.data.documents.map((document) => {
      const restoredDocument: Partial<PatientDocument & BackupDocument> = { ...document };
      delete restoredDocument.hasStoredFile;
      delete restoredDocument.backupFilePath;
      const fileBlob = filesByDocumentId.get(document.id);
      if (fileBlob) restoredDocument.fileBlob = fileBlob;
      return restoredDocument as PatientDocument;
    });

    await this.database.transaction(
      "rw",
      [this.database.patients, this.database.sessions, this.database.dialyzers, this.database.medicines, this.database.documents, this.database.settings],
      async () => {
        await Promise.all([
          this.database.patients.clear(),
          this.database.sessions.clear(),
          this.database.dialyzers.clear(),
          this.database.medicines.clear(),
          this.database.documents.clear(),
          this.database.settings.clear(),
        ]);

        await Promise.all([
          this.database.patients.bulkAdd(backup.data.patients),
          this.database.sessions.bulkAdd(backup.data.sessions),
          this.database.dialyzers.bulkAdd(backup.data.dialyzers),
          this.database.medicines.bulkAdd(backup.data.medicines),
          this.database.documents.bulkAdd(documents),
          this.database.settings.bulkAdd(backup.data.settings),
        ]);
      },
    );

    return {
      patients: backup.data.patients.length,
      sessions: backup.data.sessions.length,
      dialyzers: backup.data.dialyzers.length,
      medicines: backup.data.medicines.length,
      documents: documents.length,
      settings: backup.data.settings.length,
      missingFiles: backup.data.documents.filter((document) => document.hasStoredFile && !filesByDocumentId.has(document.id)).length,
    };
  }

  async restoreBackupPackage(preview: BackupPackagePreview): Promise<RestoreResult> {
    const filesByDocumentId = new Map<string, Blob>();

    for (const document of preview.backup.data.documents) {
      if (!document.backupFilePath) continue;
      const zippedFile = preview.zip.file(document.backupFilePath);
      if (!zippedFile) continue;
      const blob = await zippedFile.async("blob");
      filesByDocumentId.set(document.id, blob);
    }

    return this.restoreBackup(preview.backup, filesByDocumentId);
  }

  async updateBackupReminder(enabled: boolean, days: number) {
    const settings = await this.database.settings.toArray();
    const existing = settings[0];
    const now = new Date().toISOString();

    const nextSettings: AppSettings = existing
      ? {
          ...existing,
          backupReminderEnabled: enabled,
          backupReminderDays: days,
          updatedAt: now,
        }
      : {
          id: "settings_default",
          createdAt: now,
          updatedAt: now,
          theme: "system",
          firstRunComplete: true,
          backupReminderEnabled: enabled,
          backupReminderDays: days,
        };

    await this.database.settings.put(nextSettings);
    return nextSettings;
  }

  async updateTheme(theme: ThemePreference) {
    const settings = await this.database.settings.toArray();
    const existing = settings[0];
    const now = new Date().toISOString();

    const nextSettings: AppSettings = existing
      ? {
          ...existing,
          theme,
          updatedAt: now,
        }
      : {
          id: "settings_default",
          createdAt: now,
          updatedAt: now,
          theme,
          firstRunComplete: true,
          backupReminderEnabled: true,
          backupReminderDays: 7,
        };

    await this.database.settings.put(nextSettings);
    return nextSettings;
  }

  async generateDoctorSummaryPdf(range: { from?: string; to?: string; title?: string } = {}) {
    const snapshot = await this.getSnapshot();
    const sessions = filterSessionsByRange(snapshot.sessions, range.from, range.to);
    return buildSummaryPdf(snapshot, sessions, range.title ?? "Doctor Summary");
  }

  async generateMonthlySummaryPdf(month: string) {
    const from = `${month}-01`;
    const to = lastDayOfMonth(month);
    return this.generateDoctorSummaryPdf({ from, to, title: `Monthly Summary - ${month}` });
  }

  private async markBackupExported(exportedAt: string) {
    const settings = await this.database.settings.toArray();
    const existing = settings[0];
    if (!existing) return;

    await this.database.settings.put({
      ...existing,
      lastBackupAt: exportedAt,
      updatedAt: exportedAt,
    });
  }
}

function assertValidBackup(value: unknown): asserts value is DialyCareBackup {
  if (!isRecord(value)) throw new Error("Backup format is invalid.");
  if (value.appName !== "DialyCare") throw new Error("This does not look like a DialyCare backup.");
  if (value.schemaVersion !== BACKUP_SCHEMA_VERSION) throw new Error("Backup version is not supported.");
  if (typeof value.exportedAt !== "string") throw new Error("Backup export date is missing.");
  if (!isRecord(value.data)) throw new Error("Backup data section is missing.");

  const data = value.data;
  const collections = ["patients", "sessions", "dialyzers", "medicines", "documents", "settings"] as const;
  for (const collection of collections) {
    if (!Array.isArray(data[collection])) {
      throw new Error(`Backup ${collection} section is missing.`);
    }
  }

  const patients = data.patients as unknown[];
  const sessions = data.sessions as unknown[];
  const dialyzers = data.dialyzers as unknown[];
  const medicines = data.medicines as unknown[];
  const documents = data.documents as unknown[];
  const settings = data.settings as unknown[];

  for (const patient of patients) {
    if (!isRecord(patient) || typeof patient.id !== "string" || typeof patient.name !== "string" || typeof patient.dryWeightKg !== "number") {
      throw new Error("Backup contains an invalid patient record.");
    }
  }

  for (const session of sessions) {
    if (!isRecord(session) || typeof session.id !== "string" || typeof session.patientId !== "string" || typeof session.date !== "string") {
      throw new Error("Backup contains an invalid dialysis session record.");
    }
  }

  for (const dialyzer of dialyzers) {
    if (!isRecord(dialyzer) || typeof dialyzer.id !== "string" || typeof dialyzer.patientId !== "string" || typeof dialyzer.name !== "string") {
      throw new Error("Backup contains an invalid dialyzer record.");
    }
  }

  for (const medicine of medicines) {
    if (!isRecord(medicine) || typeof medicine.id !== "string" || typeof medicine.patientId !== "string" || typeof medicine.name !== "string") {
      throw new Error("Backup contains an invalid medicine record.");
    }
  }

  for (const document of documents) {
    if (!isRecord(document) || typeof document.id !== "string" || typeof document.patientId !== "string" || typeof document.title !== "string") {
      throw new Error("Backup contains an invalid document record.");
    }
  }

  for (const setting of settings) {
    if (!isRecord(setting) || typeof setting.id !== "string") {
      throw new Error("Backup contains an invalid settings record.");
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function sortSessionsNewestFirst(a: DialysisSession, b: DialysisSession) {
  const aKey = `${a.date}T${a.sessionTime ?? "00:00"}`;
  const bKey = `${b.date}T${b.sessionTime ?? "00:00"}`;
  return bKey.localeCompare(aKey);
}

function filterSessionsByRange(sessions: DialysisSession[], from?: string, to?: string) {
  return sessions.filter((session) => {
    if (from && session.date < from) return false;
    if (to && session.date > to) return false;
    return true;
  });
}

function lastDayOfMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  if (!year || !monthNumber) throw new Error("Select a valid month before exporting.");
  return new Date(year, monthNumber, 0).toISOString().slice(0, 10);
}

function buildSummaryPdf(snapshot: BackupSnapshot, sessions: DialysisSession[], title: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 44;

  const addLine = (text: string, size = 10, gap = 16) => {
    if (y > 760) {
      doc.addPage();
      y = 44;
    }
    doc.setFontSize(size);
    doc.text(text, margin, y, { maxWidth: pageWidth - margin * 2 });
    y += gap;
  };

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  addLine(`DialyCare ${title}`, 18, 24);

  doc.setFont("helvetica", "normal");
  addLine(`Generated: ${new Date().toLocaleString("en-IN")}`);
  addLine(appConfig.disclaimer, 9, 26);

  if (snapshot.patient) {
    doc.setFont("helvetica", "bold");
    addLine("Patient", 13, 18);
    doc.setFont("helvetica", "normal");
    addLine(`Name: ${snapshot.patient.name}`);
    addLine(`UHID: ${snapshot.patient.uhid || "Not recorded"}`);
    addLine(`Hospital: ${snapshot.patient.hospital || snapshot.patient.defaultHospital || "Not recorded"}`);
    addLine(`Consultant: ${snapshot.patient.consultant || snapshot.patient.defaultDoctor || "Not recorded"}`);
    addLine(`Dry weight: ${snapshot.patient.dryWeightKg} kg`, 10, 22);
  }

  doc.setFont("helvetica", "bold");
  addLine("Dialysis Summary", 13, 18);
  doc.setFont("helvetica", "normal");
  addLine(`Sessions in report: ${sessions.length}`);
  addLine(`Average UF removed: ${formatAverage(sessions.map((session) => session.ufRemovedLiters))} L`);
  addLine(`Average weight loss: ${formatAverage(sessions.map((session) => getSessionWeightLossKg(session)).filter((value): value is number => value !== undefined))} kg`);
  addLine(`Average pre-HD BP: ${formatBpAverage(sessions, "pre")}`);
  addLine(`Average post-HD BP: ${formatBpAverage(sessions, "post")}`, 10, 22);

  doc.setFont("helvetica", "bold");
  addLine("Weight and BP Trend", 13, 18);
  doc.setFont("helvetica", "normal");
  addLine(buildTrendLine(sessions), 10, 22);

  doc.setFont("helvetica", "bold");
  addLine("Recent Sessions", 13, 18);
  doc.setFont("helvetica", "normal");
  sessions.slice(0, 16).forEach((session) => {
    addLine(
      `${session.date} | ${session.preWeightKg} -> ${session.postWeightKg} kg | Loss ${getSessionWeightLossKg(session) ?? "NA"} kg | UF ${session.ufRemovedLiters} L | BP ${session.preBpSystolic}/${session.preBpDiastolic} -> ${session.postBpSystolic}/${session.postBpDiastolic} | Dialyzer use ${session.dialyzerUseNumber ?? "NA"}`,
      9,
      14,
    );
  });

  doc.setFont("helvetica", "bold");
  addLine("Active Dialyzer", 13, 18);
  doc.setFont("helvetica", "normal");
  const activeDialyzer = snapshot.dialyzers.find((dialyzer) => dialyzer.status === "active");
  addLine(activeDialyzer ? `${activeDialyzer.name}: ${activeDialyzer.currentUsage}/${activeDialyzer.maxUsage} uses` : "No active dialyzer recorded.", 10, 22);

  doc.setFont("helvetica", "bold");
  addLine("Active Medicines", 13, 18);
  doc.setFont("helvetica", "normal");
  const activeMedicines = snapshot.medicines.filter((medicine) => medicine.status === "active");
  if (activeMedicines.length === 0) addLine("No active medicines recorded.");
  activeMedicines.forEach((medicine) => addLine(`${medicine.name} | ${[medicine.dosage, medicine.frequency, medicine.timing].filter(Boolean).join(" / ") || "Schedule not recorded"}`));

  doc.setFont("helvetica", "bold");
  addLine("Report Index", 13, 18);
  doc.setFont("helvetica", "normal");
  if (snapshot.documents.length === 0) addLine("No documents recorded.");
  snapshot.documents.slice(0, 20).forEach((document) => addLine(`${document.date} | ${document.title} | ${document.category}`));

  return doc.output("blob");
}

function formatAverage(values: number[]) {
  if (values.length === 0) return "NA";
  return (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1);
}

function formatBpAverage(sessions: DialysisSession[], type: "pre" | "post") {
  if (sessions.length === 0) return "NA";
  const systolic = sessions.map((session) => (type === "pre" ? session.preBpSystolic : session.postBpSystolic));
  const diastolic = sessions.map((session) => (type === "pre" ? session.preBpDiastolic : session.postBpDiastolic));
  return `${Math.round(Number(formatAverage(systolic)))}/${Math.round(Number(formatAverage(diastolic)))}`;
}

function buildTrendLine(sessions: DialysisSession[]) {
  if (sessions.length === 0) return "No sessions available for trend review.";

  const chronological = [...sessions].sort((a, b) => `${a.date}T${a.sessionTime ?? "00:00"}`.localeCompare(`${b.date}T${b.sessionTime ?? "00:00"}`));
  const first = chronological[0];
  const latest = chronological[chronological.length - 1];
  if (!first || !latest) return "No sessions available for trend review.";

  return [
    `First: ${first.date}, pre ${first.preWeightKg} kg, post ${first.postWeightKg} kg, BP ${first.preBpSystolic}/${first.preBpDiastolic} to ${first.postBpSystolic}/${first.postBpDiastolic}.`,
    `Latest: ${latest.date}, pre ${latest.preWeightKg} kg, post ${latest.postWeightKg} kg, BP ${latest.preBpSystolic}/${latest.preBpDiastolic} to ${latest.postBpSystolic}/${latest.postBpDiastolic}.`,
  ].join(" ");
}

export const backupService = new BackupService();

function buildDocumentBackupPath(document: Omit<PatientDocument, "fileBlob">) {
  const extension = getDocumentExtension(document);
  const baseName = sanitizeFileSegment(document.fileName ?? document.title ?? document.id);
  return `documents/${document.id}-${baseName}${extension}`;
}

function getDocumentExtension(document: Omit<PatientDocument, "fileBlob">) {
  const fileName = document.fileName ?? "";
  const existingExtension = fileName.match(/\.[a-z0-9]{1,8}$/i)?.[0];
  if (existingExtension) return existingExtension.toLowerCase();
  if (document.mimeType === "application/pdf") return ".pdf";
  if (document.mimeType === "image/png") return ".png";
  if (document.mimeType === "image/webp") return ".webp";
  if (document.mimeType?.startsWith("image/")) return ".jpg";
  return ".bin";
}

function sanitizeFileSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\.[a-z0-9]{1,8}$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "document";
}
