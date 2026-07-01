import type { CreateDialyzerInput, CreateDocumentInput, CreateMedicineInput, CreatePatientInput, CreateSessionInput } from "@/data/repositories";

export const demoPatient: CreatePatientInput = {
  name: "Nitinkumar Sukalikar",
  uhid: "ANM10000554002",
  age: 62,
  gender: "male",
  hospital: "Apollo Hospitals",
  consultant: "Dr. Ravindra Nikalje",
  emergencyContact: "Family caregiver",
  dryWeightKg: 57,
  dialysisFrequency: "3 times per week",
  defaultHospital: "Apollo Hospitals",
  defaultDoctor: "Dr. Ravindra Nikalje",
};

export function buildDemoDialyzer(patientId: string): CreateDialyzerInput {
  return {
    patientId,
    name: "F8HPS",
    startedOn: "2026-06-01",
    maxUsage: 12,
    currentUsage: 6,
    lastUsedDate: "2026-06-20",
    status: "active",
  };
}

export function buildDemoSessions(patientId: string, dialyzerId: string): CreateSessionInput[] {
  return [
    {
      patientId,
      date: "2026-06-22",
      sessionTime: "09:00",
      preWeightKg: 62.4,
      postWeightKg: 58.5,
      weightLossKg: 3.9,
      preBpSystolic: 160,
      preBpDiastolic: 90,
      postBpSystolic: 130,
      postBpDiastolic: 80,
      ufRemovedLiters: 3.9,
      dialyzerId,
      dialyzerUseNumber: 7,
      hospital: "Apollo Hospitals",
      doctor: "Dr. Ravindra Nikalje",
      remarks: "Stable",
    },
    {
      patientId,
      date: "2026-06-20",
      sessionTime: "09:00",
      preWeightKg: 61.8,
      postWeightKg: 58.2,
      weightLossKg: 3.6,
      preBpSystolic: 150,
      preBpDiastolic: 88,
      postBpSystolic: 128,
      postBpDiastolic: 78,
      ufRemovedLiters: 3.6,
      dialyzerId,
      dialyzerUseNumber: 6,
      hospital: "Apollo Hospitals",
      doctor: "Dr. Ravindra Nikalje",
      remarks: "No complications",
    },
  ];
}

export function buildDemoMedicine(patientId: string): CreateMedicineInput {
  return {
    patientId,
    name: "Calcium Tablet",
    dosage: "500 mg",
    frequency: "Morning + Night",
    timing: "After food",
    startDate: "2026-06-01",
    instructions: "Track only as prescribed by doctor.",
    status: "active",
  };
}

export function buildDemoDocument(patientId: string): CreateDocumentInput {
  return {
    patientId,
    title: "June dialysis booklet photo",
    category: "dialysis-booklet",
    fileType: "image",
    fileName: "june-booklet.jpg",
    mimeType: "image/jpeg",
    date: "2026-06-22",
    notes: "Sample metadata only; no file blob included.",
  };
}
