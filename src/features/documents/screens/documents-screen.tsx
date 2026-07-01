"use client";

import { ExternalLink, FileText, ImageIcon, Pencil, Plus, Save, Star, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  documentCategories,
  documentCategoryLabels,
  documentService,
  detectFileType,
  matchesDocumentSearch,
  type DocumentFormInput,
  type DocumentSnapshot,
} from "@/features/documents/services/document-service";
import type { DocumentCategory, PatientDocument } from "@/types/core";

interface DocumentFormState {
  title: string;
  category: DocumentCategory;
  date: string;
  notes: string;
  favorite: boolean;
  file?: File;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

const emptyForm: DocumentFormState = {
  title: "",
  category: "dialysis-booklet",
  date: today(),
  notes: "",
  favorite: false,
};

function buildFormFromDocument(document: PatientDocument): DocumentFormState {
  return {
    title: document.title,
    category: document.category,
    date: document.date,
    notes: document.notes ?? "",
    favorite: document.favorite ?? false,
  };
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${date}T00:00:00`));
}

function fileTypeLabel(document: PatientDocument) {
  if (document.fileType === "image") return "Image";
  if (document.fileType === "pdf") return "PDF";
  return "File";
}

function DocumentCard({
  document,
  onDelete,
  onEdit,
  onFavorite,
  onOpen,
}: {
  document: PatientDocument;
  onDelete: (document: PatientDocument) => void;
  onEdit: (document: PatientDocument) => void;
  onFavorite: (document: PatientDocument) => void;
  onOpen: (document: PatientDocument) => void;
}) {
  const Icon = document.fileType === "image" ? ImageIcon : FileText;

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-brand-mint p-2 text-brand-primary">
              <Icon aria-hidden="true" size={18} />
            </span>
            <CardTitle>{document.title}</CardTitle>
            <Badge tone="neutral">{fileTypeLabel(document)}</Badge>
            {document.favorite ? <Badge tone="success">Favorite</Badge> : null}
          </div>
          <p className="mt-2 text-sm text-brand-muted">
            {documentCategoryLabels[document.category]} / {formatDate(document.date)}
          </p>
          <p className="mt-1 truncate text-xs text-brand-muted">{document.fileName ?? "Stored locally"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => onFavorite(document)} type="button" variant={document.favorite ? "secondary" : "ghost"}>
            <Star aria-hidden="true" size={18} />
            {document.favorite ? "Saved" : "Favorite"}
          </Button>
          <Button onClick={() => onOpen(document)} type="button" variant="secondary">
            <ExternalLink aria-hidden="true" size={18} />
            Open
          </Button>
          <Button onClick={() => onEdit(document)} type="button" variant="ghost">
            <Pencil aria-hidden="true" size={18} />
            Edit
          </Button>
          <Button onClick={() => onDelete(document)} type="button" variant="danger">
            <Trash2 aria-hidden="true" size={18} />
            Delete
          </Button>
        </div>
      </div>

      {document.notes ? (
        <div className="mt-4 rounded-lg bg-brand-neutral p-3 text-sm text-brand-ink">
          <span className="font-medium text-brand-muted">Notes: </span>
          {document.notes}
        </div>
      ) : null}
    </Card>
  );
}

export function DocumentsScreen() {
  const [snapshot, setSnapshot] = useState<DocumentSnapshot>({ documents: [], groupedDocuments: {} as DocumentSnapshot["groupedDocuments"] });
  const [form, setForm] = useState<DocumentFormState>(emptyForm);
  const [editingDocument, setEditingDocument] = useState<PatientDocument | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function loadSnapshot() {
    const nextSnapshot = await documentService.getSnapshot();
    setSnapshot(nextSnapshot);
  }

  useEffect(() => {
    let cancelled = false;

    documentService
      .getSnapshot()
      .then((nextSnapshot) => {
        if (!cancelled) setSnapshot(nextSnapshot);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function updateField(field: keyof DocumentFormState, value: string) {
    setForm((current) => ({ ...current, [field]: field === "category" ? (value as DocumentCategory) : value }));
  }

  function updateFavorite(value: boolean) {
    setForm((current) => ({ ...current, favorite: value }));
  }

  function updateFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setForm((current) => ({ ...current, file }));
    if (file && !form.title.trim()) {
      setForm((current) => ({ ...current, title: file.name.replace(/\.[^/.]+$/, "") }));
    }
  }

  function resetForm() {
    setForm({ ...emptyForm, date: today() });
    setEditingDocument(undefined);
    setFormErrors([]);
  }

  function editDocument(document: PatientDocument) {
    setForm(buildFormFromDocument(document));
    setEditingDocument(document);
    setFormErrors([]);
    setStatusMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validateForm() {
    const nextErrors: string[] = [];
    if (!form.title.trim()) nextErrors.push("Document title is required.");
    if (!form.date) nextErrors.push("Document date is required.");
    if (!editingDocument && !form.file) nextErrors.push("Upload an image or PDF before saving.");
    if (form.file && detectFileType(form.file) === "other") {
      nextErrors.push("Only images and PDFs are supported for MVP document storage.");
    }
    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!snapshot.patient) return;

    const nextErrors = validateForm();
    setFormErrors(nextErrors);
    if (nextErrors.length > 0) return;

    const input: DocumentFormInput = {
      ...form,
      existingFile: editingDocument,
    };

    setSaving(true);
    try {
      await documentService.saveDocument(snapshot.patient.id, input, editingDocument?.id);
      await loadSnapshot();
      setStatusMessage(editingDocument ? "Document updated." : "Document uploaded.");
      resetForm();
    } catch (error) {
      setFormErrors([error instanceof Error ? error.message : "Could not save document."]);
    } finally {
      setSaving(false);
    }
  }

  function openDocument(document: PatientDocument) {
    const url = documentService.createPreviewUrl(document);
    if (!url) {
      setFormErrors(["This document file is missing from local storage."]);
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  async function handleDelete(document: PatientDocument) {
    if (!window.confirm(`Delete ${document.title}? This removes the locally stored file and metadata.`)) return;

    await documentService.deleteDocument(document.id);
    if (editingDocument?.id === document.id) resetForm();
    await loadSnapshot();
    setStatusMessage("Document deleted.");
  }

  async function toggleFavorite(document: PatientDocument) {
    await documentService.setFavorite(document.id, !document.favorite);
    await loadSnapshot();
    setStatusMessage(!document.favorite ? "Document added to favorites." : "Document removed from favorites.");
  }

  if (loading) {
    return <LoadingState label="Loading documents..." />;
  }

  if (!snapshot.patient) {
    return (
      <Card>
        <CardTitle>Patient setup required</CardTitle>
        <p className="mt-2 text-sm text-brand-muted">Create the patient profile before uploading dialysis documents.</p>
        <Link
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-brand-mint shadow-soft transition hover:bg-[#0B5D49]"
          href="/patient-setup"
        >
          Go to patient setup
        </Link>
      </Card>
    );
  }

  const visibleDocumentCount = snapshot.documents.filter(
    (document) => matchesDocumentSearch(document, searchQuery) && (!showFavoritesOnly || document.favorite),
  ).length;

  return (
    <div className="space-y-5">
      <PageHeader
        action={
          <Button onClick={resetForm} type="button" variant="secondary">
            <Plus aria-hidden="true" size={18} />
            New document
          </Button>
        }
        description="Store dialysis booklet photos, prescriptions, reports, bills, and notes on this device."
        eyebrow="Reports"
        title="Documents"
      />

      <div className="rounded-lg border border-[#F59E0B]/30 bg-[#FEF6E7] p-4 text-sm text-brand-ink">
        Uploaded files are saved in this browser&apos;s local storage. Large photos and PDFs can use device space, and clearing browser data can remove them.
        Images are compressed before storage when the browser supports it.
      </div>

      {statusMessage ? (
        <div className="rounded-lg border border-brand-primary/20 bg-brand-mint p-4 text-sm text-brand-primary" role="status">
          {statusMessage}
        </div>
      ) : null}

      {formErrors.length > 0 ? (
        <div className="rounded-lg border border-brand-alert/30 bg-[#FAECE7] p-4 text-sm text-brand-alert" role="alert">
          <p className="font-semibold">Please fix these details:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {formErrors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Card>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-brand-mint p-2 text-brand-primary">
              <Upload aria-hidden="true" size={20} />
            </div>
            <div>
              <CardTitle>{editingDocument ? "Edit document" : "Upload document"}</CardTitle>
              <p className="mt-1 text-sm text-brand-muted">Add booklet photos, prescriptions, lab reports, bills, or hospital notes for future review.</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="Report name" onChange={(event) => updateField("title", event.target.value)} placeholder="June dialysis booklet" required value={form.title} />
            <Input label="Report date" onChange={(event) => updateField("date", event.target.value)} required type="date" value={form.date} />
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-muted">Category</span>
              <select
                className="min-h-12 w-full rounded-lg border border-brand-border bg-white px-3.5 py-2.5 text-base text-brand-ink outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-mint"
                onChange={(event) => updateField("category", event.target.value)}
                value={form.category}
              >
                {documentCategories.map((category) => (
                  <option key={category} value={category}>
                    {documentCategoryLabels[category]}
                  </option>
                ))}
              </select>
            </label>
            <Input
              accept="image/*,application/pdf"
              hint={editingDocument ? `Leave empty to keep ${editingDocument.fileName ?? "the current file"}.` : "Images and PDFs are supported."}
              label="File"
              onChange={updateFile}
              required={!editingDocument}
              type="file"
            />
          </div>

          <label className="mt-4 flex min-h-12 items-center gap-3 rounded-lg border border-brand-border bg-white px-3.5 py-2.5 text-sm font-medium text-brand-ink">
            <input checked={form.favorite} className="h-5 w-5 accent-brand-primary" onChange={(event) => updateFavorite(event.target.checked)} type="checkbox" />
            Mark as favorite report
          </label>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium text-brand-muted">Notes</span>
            <textarea
              className="min-h-24 w-full rounded-lg border border-brand-border bg-white px-3.5 py-2.5 text-base text-brand-ink outline-none transition placeholder:text-brand-muted/60 focus:border-brand-primary focus:ring-4 focus:ring-brand-mint"
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="Optional context from the booklet, prescription, or report"
              value={form.notes}
            />
          </label>
        </Card>

        <div className="sticky bottom-20 rounded-xl border border-brand-border bg-white p-3 shadow-soft lg:static lg:p-0 lg:shadow-none">
          <Button className="w-full" disabled={saving} type="submit">
            <Save aria-hidden="true" size={18} />
            {saving ? "Saving..." : editingDocument ? "Update document" : "Save document"}
          </Button>
        </div>
      </form>

      <section className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <Input
            label="Search documents"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search title, category, date, notes..."
            type="search"
            value={searchQuery}
          />
          <label className="flex min-h-12 items-center gap-3 rounded-lg border border-brand-border bg-white px-3.5 py-2.5 text-sm font-medium text-brand-ink">
            <input checked={showFavoritesOnly} className="h-5 w-5 accent-brand-primary" onChange={(event) => setShowFavoritesOnly(event.target.checked)} type="checkbox" />
            Favorites only
          </label>
        </div>
        <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-brand-muted">Uploaded documents</h2>
        {snapshot.documents.length === 0 ? (
          <Card>
            <EmptyState description="Upload a booklet photo, prescription, report, bill, or note to keep it with the dialysis record." title="No documents uploaded yet" />
          </Card>
        ) : visibleDocumentCount === 0 ? (
          <Card>
            <EmptyState description="Try a broader search or turn off favorites only." title="No documents match this view" />
          </Card>
        ) : (
          documentCategories.map((category) => {
            const documents = (snapshot.groupedDocuments[category] ?? []).filter(
              (document) => matchesDocumentSearch(document, searchQuery) && (!showFavoritesOnly || document.favorite),
            );
            if (documents.length === 0) return null;
            return (
              <div className="space-y-3" key={category}>
                <h3 className="px-1 text-sm font-semibold text-brand-ink">{documentCategoryLabels[category]}</h3>
                {documents.map((document) => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    onDelete={handleDelete}
                    onEdit={editDocument}
                    onFavorite={toggleFavorite}
                    onOpen={openDocument}
                  />
                ))}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
