export type Gender = "male" | "female" | "other" | "prefer-not-to-say";

export type DialyzerStatus = "active" | "archived";

export type MedicineStatus = "active" | "stopped";

export type DocumentCategory =
  | "dialysis-booklet"
  | "prescription"
  | "blood-report"
  | "kft"
  | "cbc"
  | "hospital-report"
  | "bill"
  | "other";

export type StoredFileType = "image" | "pdf" | "other";

export type ThemePreference = "system" | "light" | "dark";

export interface TimestampedRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Patient extends TimestampedRecord {
  name: string;
  uhid?: string;
  age?: number;
  gender?: Gender;
  hospital?: string;
  consultant?: string;
  emergencyContact?: string;
  dryWeightKg: number;
  dialysisFrequency?: string;
  defaultHospital?: string;
  defaultDoctor?: string;
}

export interface DialysisSession extends TimestampedRecord {
  patientId: string;
  date: string;
  sessionTime?: string;
  preWeightKg: number;
  postWeightKg: number;
  preBpSystolic: number;
  preBpDiastolic: number;
  postBpSystolic: number;
  postBpDiastolic: number;
  ufRemovedLiters: number;
  dialyzerId?: string;
  dialyzerUseNumber?: number;
  hospital?: string;
  doctor?: string;
  complications?: string;
  injectionsGiven?: string;
  medicineChanges?: string;
  machineNotes?: string;
  remarks?: string;
}

export interface Dialyzer extends TimestampedRecord {
  patientId: string;
  name: string;
  startedOn: string;
  maxUsage: number;
  currentUsage: number;
  lastUsedDate?: string;
  status: DialyzerStatus;
}

export interface Medicine extends TimestampedRecord {
  patientId: string;
  name: string;
  dosage?: string;
  frequency?: string;
  timing?: string;
  startDate?: string;
  endDate?: string;
  instructions?: string;
  doctorNotes?: string;
  status: MedicineStatus;
}

export interface PatientDocument extends TimestampedRecord {
  patientId: string;
  title: string;
  category: DocumentCategory;
  fileType: StoredFileType;
  fileName?: string;
  mimeType?: string;
  fileBlob?: Blob;
  date: string;
  notes?: string;
}

export interface AppSettings extends TimestampedRecord {
  theme: ThemePreference;
  firstRunComplete: boolean;
  backupReminderEnabled: boolean;
  backupReminderDays?: number;
  lastBackupAt?: string;
}

export type EntityName = "patient" | "session" | "dialyzer" | "medicine" | "document" | "settings";
