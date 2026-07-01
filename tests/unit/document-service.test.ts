import { afterEach, describe, expect, it } from "vitest";

import { DialyCareDatabase } from "@/data/db/dialycare-db";
import { DocumentRepository, PatientRepository } from "@/data/repositories";
import { demoPatient } from "@/data/seed/demo-data";
import { compressImageFile, detectFileType, DocumentService, matchesDocumentSearch } from "@/features/documents/services/document-service";

function createTestDb() {
  return new DialyCareDatabase(`dialycare_document_test_${crypto.randomUUID()}`);
}

function makeFile(name: string, type: string, content = "sample") {
  return new File([content], name, { type });
}

describe("document service", () => {
  let database: DialyCareDatabase;

  afterEach(async () => {
    if (database) {
      await database.delete();
      database.close();
    }
  });

  it("detects MVP file types for images and PDFs", () => {
    expect(detectFileType(makeFile("booklet.jpg", "image/jpeg"))).toBe("image");
    expect(detectFileType(makeFile("report.pdf", "application/pdf"))).toBe("pdf");
    expect(detectFileType(makeFile("report.pdf", ""))).toBe("pdf");
    expect(detectFileType(makeFile("notes.txt", "text/plain"))).toBe("other");
  });

  it("stores document metadata and file blobs for the primary patient", async () => {
    database = createTestDb();
    const patients = new PatientRepository(database);
    const documents = new DocumentRepository(database);
    const service = new DocumentService(patients, documents);

    const patient = await patients.create(demoPatient);
    const file = makeFile("june-booklet.jpg", "image/jpeg", "image-data");

    const saved = await service.saveDocument(patient.id, {
      title: " June booklet ",
      category: "dialysis-booklet",
      date: "2026-06-22",
      notes: " Booklet page ",
      file,
    });

    const snapshot = await service.getSnapshot();

    expect(snapshot.patient?.id).toBe(patient.id);
    expect(snapshot.documents).toHaveLength(1);
    expect(snapshot.groupedDocuments["dialysis-booklet"].map((document) => document.id)).toEqual([saved.id]);
    expect(snapshot.documents[0]).toMatchObject({
      title: "June booklet",
      fileName: "june-booklet.jpg",
      fileType: "image",
      mimeType: "image/jpeg",
      notes: "Booklet page",
    });
    await expect(snapshot.documents[0]?.fileBlob?.text()).resolves.toBe("image-data");
  });

  it("can edit metadata while keeping the existing file and delete the document", async () => {
    database = createTestDb();
    const patients = new PatientRepository(database);
    const documents = new DocumentRepository(database);
    const service = new DocumentService(patients, documents);

    const patient = await patients.create(demoPatient);
    const saved = await service.saveDocument(patient.id, {
      title: "Prescription",
      category: "prescription",
      date: "2026-06-01",
      file: makeFile("rx.pdf", "application/pdf", "pdf-data"),
    });

    const updated = await service.saveDocument(
      patient.id,
      {
        title: "Updated prescription",
        category: "prescription",
        date: "2026-06-02",
        notes: "Dose reviewed by doctor",
        existingFile: saved,
      },
      saved.id,
    );

    expect(updated.title).toBe("Updated prescription");
    expect(updated.fileName).toBe("rx.pdf");
    await expect(updated.fileBlob?.text()).resolves.toBe("pdf-data");

    await service.deleteDocument(saved.id);
    const snapshot = await service.getSnapshot();
    expect(snapshot.documents).toHaveLength(0);
  });

  it("can mark documents as favorite and match document search text", async () => {
    database = createTestDb();
    const patients = new PatientRepository(database);
    const documents = new DocumentRepository(database);
    const service = new DocumentService(patients, documents);

    const patient = await patients.create(demoPatient);
    const saved = await service.saveDocument(patient.id, {
      title: "Important KFT report",
      category: "kft",
      date: "2026-06-15",
      notes: "Carry to doctor visit",
      favorite: true,
      file: makeFile("kft.pdf", "application/pdf", "pdf-data"),
    });

    expect(saved.favorite).toBe(true);
    expect(matchesDocumentSearch(saved, "doctor")).toBe(true);
    expect(matchesDocumentSearch(saved, "KFT")).toBe(true);
    expect(matchesDocumentSearch(saved, "missing")).toBe(false);

    const updated = await service.setFavorite(saved.id, false);
    expect(updated.favorite).toBe(false);
  });

  it("keeps unsupported image compression environments on the original file", async () => {
    const file = makeFile("notes.txt", "text/plain", "plain-data");

    await expect(compressImageFile(file)).resolves.toEqual({ file, compressed: false });
  });

  it("requires a file when creating a document", async () => {
    database = createTestDb();
    const patients = new PatientRepository(database);
    const documents = new DocumentRepository(database);
    const service = new DocumentService(patients, documents);

    const patient = await patients.create(demoPatient);

    await expect(
      service.saveDocument(patient.id, {
        title: "Missing file",
        category: "other",
        date: "2026-06-22",
      }),
    ).rejects.toThrow("Upload an image or PDF before saving the document.");
  });
});
