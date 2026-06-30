import { db as defaultDb, type DialyCareDatabase } from "@/data/db/dialycare-db";
import { assertValid, validateDocument } from "@/data/validation/core-validation";
import type { PatientDocument } from "@/types/core";

import { withNewRecord, withUpdatedAt } from "./record-utils";

export type CreateDocumentInput = Omit<PatientDocument, "id" | "createdAt" | "updatedAt">;
export type UpdateDocumentInput = Partial<CreateDocumentInput>;

export class DocumentRepository {
  constructor(private readonly database: DialyCareDatabase = defaultDb) {}

  async listByPatient(patientId: string) {
    return this.database.documents.where("patientId").equals(patientId).reverse().sortBy("date");
  }

  async get(id: string) {
    return this.database.documents.get(id);
  }

  async create(input: CreateDocumentInput) {
    assertValid(validateDocument(input));
    const document = withNewRecord("document", input);
    await this.database.documents.add(document);
    return document;
  }

  async update(id: string, input: UpdateDocumentInput) {
    const existing = await this.get(id);
    if (!existing) throw new Error("Document not found.");

    const updated = withUpdatedAt({ ...existing, ...input });
    assertValid(validateDocument(updated));
    await this.database.documents.put(updated);
    return updated;
  }

  async delete(id: string) {
    await this.database.documents.delete(id);
  }
}

export const documentRepository = new DocumentRepository();
