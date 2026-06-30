import { DialyCareDatabase } from "@/data/db/dialycare-db";
import { DialyzerRepository, DocumentRepository, MedicineRepository, PatientRepository, SessionRepository } from "@/data/repositories";

import { buildDemoDialyzer, buildDemoDocument, buildDemoMedicine, buildDemoSessions, demoPatient } from "./demo-data";

export async function seedDemoData(database = new DialyCareDatabase()) {
  const patientRepository = new PatientRepository(database);
  const dialyzerRepository = new DialyzerRepository(database);
  const sessionRepository = new SessionRepository(database);
  const medicineRepository = new MedicineRepository(database);
  const documentRepository = new DocumentRepository(database);

  const patient = await patientRepository.create(demoPatient);
  const dialyzer = await dialyzerRepository.create(buildDemoDialyzer(patient.id));
  const sessions = await Promise.all(buildDemoSessions(patient.id, dialyzer.id).map((session) => sessionRepository.create(session)));
  const medicine = await medicineRepository.create(buildDemoMedicine(patient.id));
  const document = await documentRepository.create(buildDemoDocument(patient.id));

  return { patient, dialyzer, sessions, medicine, document };
}
