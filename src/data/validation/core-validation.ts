import type { DialysisSession, Dialyzer, Medicine, Patient, PatientDocument } from "@/types/core";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function result(errors: string[]): ValidationResult {
  return { valid: errors.length === 0, errors };
}

function isBlank(value: string | undefined) {
  return !value || value.trim().length === 0;
}

function isPositiveNumber(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isNonNegativeNumber(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function inRange(value: number, min: number, max: number) {
  return Number.isFinite(value) && value >= min && value <= max;
}

export function validatePatient(patient: Pick<Patient, "name" | "age" | "dryWeightKg">): ValidationResult {
  const errors: string[] = [];

  if (isBlank(patient.name)) errors.push("Patient name is required.");
  if (!isPositiveNumber(patient.dryWeightKg) || patient.dryWeightKg < 20 || patient.dryWeightKg > 200) {
    errors.push("Dry weight must be between 20 and 200 kg.");
  }
  if (patient.age !== undefined && (!Number.isInteger(patient.age) || patient.age < 0 || patient.age > 130)) {
    errors.push("Age must be between 0 and 130.");
  }

  return result(errors);
}

export function validateDialysisSession(
  session: Pick<
    DialysisSession,
    | "patientId"
    | "date"
    | "preWeightKg"
    | "postWeightKg"
    | "preBpSystolic"
    | "preBpDiastolic"
    | "postBpSystolic"
    | "postBpDiastolic"
    | "ufRemovedLiters"
    | "dialyzerUseNumber"
  >,
): ValidationResult {
  const errors: string[] = [];

  if (isBlank(session.patientId)) errors.push("Patient is required.");
  if (isBlank(session.date)) errors.push("Session date is required.");
  if (!inRange(session.preWeightKg, 20, 250)) errors.push("Pre-HD weight must be between 20 and 250 kg.");
  if (!inRange(session.postWeightKg, 20, 250)) errors.push("Post-HD weight must be between 20 and 250 kg.");
  if (session.postWeightKg > session.preWeightKg) errors.push("Post-HD weight cannot exceed pre-HD weight.");
  if (!inRange(session.preBpSystolic, 50, 260)) errors.push("Pre-HD systolic BP must be between 50 and 260.");
  if (!inRange(session.preBpDiastolic, 30, 160)) errors.push("Pre-HD diastolic BP must be between 30 and 160.");
  if (!inRange(session.postBpSystolic, 50, 260)) errors.push("Post-HD systolic BP must be between 50 and 260.");
  if (!inRange(session.postBpDiastolic, 30, 160)) errors.push("Post-HD diastolic BP must be between 30 and 160.");
  if (!isNonNegativeNumber(session.ufRemovedLiters) || session.ufRemovedLiters > 10) {
    errors.push("UF removed must be between 0 and 10 liters.");
  }
  if (
    session.dialyzerUseNumber !== undefined &&
    (!Number.isInteger(session.dialyzerUseNumber) || session.dialyzerUseNumber < 0)
  ) {
    errors.push("Dialyzer use number must be zero or greater.");
  }

  return result(errors);
}

export function validateDialyzer(dialyzer: Pick<Dialyzer, "patientId" | "name" | "startedOn" | "maxUsage" | "currentUsage">): ValidationResult {
  const errors: string[] = [];

  if (isBlank(dialyzer.patientId)) errors.push("Patient is required.");
  if (isBlank(dialyzer.name)) errors.push("Dialyzer name is required.");
  if (isBlank(dialyzer.startedOn)) errors.push("Dialyzer start date is required.");
  if (!Number.isInteger(dialyzer.maxUsage) || dialyzer.maxUsage < 1 || dialyzer.maxUsage > 100) {
    errors.push("Max usage must be between 1 and 100.");
  }
  if (!Number.isInteger(dialyzer.currentUsage) || dialyzer.currentUsage < 0) {
    errors.push("Current usage must be zero or greater.");
  }
  if (dialyzer.currentUsage > dialyzer.maxUsage) errors.push("Current usage cannot exceed max usage.");

  return result(errors);
}

export function validateMedicine(medicine: Pick<Medicine, "patientId" | "name">): ValidationResult {
  const errors: string[] = [];

  if (isBlank(medicine.patientId)) errors.push("Patient is required.");
  if (isBlank(medicine.name)) errors.push("Medicine name is required.");

  return result(errors);
}

export function validateDocument(document: Pick<PatientDocument, "patientId" | "title" | "category" | "fileType" | "date">): ValidationResult {
  const errors: string[] = [];

  if (isBlank(document.patientId)) errors.push("Patient is required.");
  if (isBlank(document.title)) errors.push("Document title is required.");
  if (isBlank(document.category)) errors.push("Document category is required.");
  if (isBlank(document.fileType)) errors.push("Document file type is required.");
  if (isBlank(document.date)) errors.push("Document date is required.");

  return result(errors);
}

export function assertValid(validation: ValidationResult) {
  if (!validation.valid) {
    throw new Error(validation.errors.join(" "));
  }
}
