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
  favorite?: boolean;
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

  async setFavorite(id: string, favorite: boolean) {
    return this.documents.update(id, { favorite });
  }

  createPreviewUrl(document: PatientDocument) {
    if (!document.fileBlob) return undefined;
    return URL.createObjectURL(document.fileBlob);
  }

  private async cleanInput(patientId: string, input: DocumentFormInput, isEditing: boolean): Promise<CreateDocumentInput> {
    const storedFile = input.file ? await compressImageFile(input.file) : undefined;
    const fileDetails = storedFile
      ? {
          fileBlob: storedFile.file,
          fileName: storedFile.file.name,
          fileType: detectFileType(storedFile.file),
          mimeType: storedFile.file.type || undefined,
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
      favorite: input.favorite ?? false,
    };
  }
}

export function detectFileType(file: File): StoredFileType {
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) return "pdf";
  return "other";
}

export async function compressImageFile(file: File, maxSize = 1600, quality = 0.82): Promise<{ file: File; compressed: boolean }> {
  if (!file.type.startsWith("image/") || typeof document === "undefined" || typeof createImageBitmap === "undefined") {
    return { file, compressed: false };
  }

  let image: ImageBitmap;
  try {
    image = await createImageBitmap(file);
  } catch {
    return { file, compressed: false };
  }
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  if (scale === 1 && file.type === "image/jpeg") {
    image.close();
    return { file, compressed: false };
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  if (!context) {
    image.close();
    return { file, compressed: false };
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob || blob.size >= file.size) return { file, compressed: false };

  const compressedName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
  return {
    file: new File([blob], compressedName, { type: "image/jpeg", lastModified: Date.now() }),
    compressed: true,
  };
}

export function matchesDocumentSearch(document: PatientDocument, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return [document.title, document.fileName, document.notes, document.date, documentCategoryLabels[document.category]]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().includes(normalized));
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
