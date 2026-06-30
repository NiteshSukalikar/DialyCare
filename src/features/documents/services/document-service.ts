import { DocumentRepository, PatientRepository } from "@/data/repositories";
import type { CreateDocumentInput } from "@/data/repositories";
import type { DocumentCategory, Patient, PatientDocument, StoredFileType } from "@/types/core";

export interface DocumentSnapshot {
  patient?: Patient;
  documents: PatientDocument[];
  groupedDocuments: Record<DocumentCategory, PatientDocument[]>;
}

export interface DocumentFormInput {
  title: string;
  category: DocumentCategory;
  date: string;
  notes?: string;
  file?: File;
  existingFile?: Pick<PatientDocument, "fileBlob" | "fileName" | "fileType" | "mimeType">;
}

export const documentCategoryLabels: Record<DocumentCategory, string> = {
  "dialysis-booklet": "Dialysis Booklet",
  prescription: "Prescription",
  "blood-report": "Blood Report",
  kft: "KFT",
  cbc: "CBC",
  "hospital-report": "Hospital Report",
  bill: "Bills",
  other: "Other",
};

export const documentCategories = Object.keys(documentCategoryLabels) as DocumentCategory[];

export class DocumentService {
  constructor(
    private readonly patients: PatientRepository = new PatientRepository(),
    private readonly documents: DocumentRepository = new DocumentRepository(),
  ) {}

  async getSnapshot(): Promise<DocumentSnapshot> {
    const patient = await this.patients.getPrimaryPatient();
    if (!patient) return { documents: [], groupedDocuments: emptyGroupedDocuments() };

    const documents = await this.documents.listByPatient(patient.id);
    return {
      patient,
      documents,
      groupedDocuments: groupDocuments(documents),
    };
  }

  async saveDocument(patientId: string, input: DocumentFormInput, documentId?: string) {
    const cleanedInput = await this.cleanInput(patientId, input, Boolean(documentId));

    if (documentId) {
      return this.documents.update(documentId, cleanedInput);
    }

    return this.documents.create(cleanedInput as CreateDocumentInput);
  }

  async deleteDocument(id: string) {
    await this.documents.delete(id);
  }

  createPreviewUrl(document: PatientDocument) {
    if (!document.fileBlob) return undefined;
    return URL.createObjectURL(document.fileBlob);
  }

  private async cleanInput(patientId: string, input: DocumentFormInput, isEditing: boolean): Promise<CreateDocumentInput> {
    const fileDetails = input.file
      ? {
          fileBlob: input.file,
          fileName: input.file.name,
          fileType: detectFileType(input.file),
          mimeType: input.file.type || undefined,
        }
      : input.existingFile;

    if (!isEditing && !fileDetails?.fileBlob) {
      throw new Error("Upload an image or PDF before saving the document.");
    }

    return {
      patientId,
      title: input.title.trim(),
      category: input.category,
      fileType: fileDetails?.fileType ?? "other",
      fileName: cleanOptional(fileDetails?.fileName),
      mimeType: cleanOptional(fileDetails?.mimeType),
      fileBlob: fileDetails?.fileBlob,
      date: input.date,
      notes: cleanOptional(input.notes),
    };
  }
}

export function detectFileType(file: File): StoredFileType {
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) return "pdf";
  return "other";
}

function cleanOptional(value: string | undefined) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : undefined;
}

function emptyGroupedDocuments(): Record<DocumentCategory, PatientDocument[]> {
  return documentCategories.reduce(
    (groups, category) => {
      groups[category] = [];
      return groups;
    },
    {} as Record<DocumentCategory, PatientDocument[]>,
  );
}

function groupDocuments(documents: PatientDocument[]) {
  const groups = emptyGroupedDocuments();
  documents.forEach((document) => {
    groups[document.category].push(document);
  });
  return groups;
}

export const documentService = new DocumentService();
