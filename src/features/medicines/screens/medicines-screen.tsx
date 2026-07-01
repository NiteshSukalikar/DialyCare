"use client";

import { Pencil, Pill, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { medicineService, type MedicineSnapshot } from "@/features/medicines/services/medicine-service";
import type { Medicine, MedicineStatus } from "@/types/core";

interface MedicineFormState {
  name: string;
  dosage: string;
  frequency: string;
  timing: string;
  startDate: string;
  endDate: string;
  instructions: string;
  doctorNotes: string;
  status: MedicineStatus;
}

const emptyForm: MedicineFormState = {
  name: "",
  dosage: "",
  frequency: "",
  timing: "",
  startDate: "",
  endDate: "",
  instructions: "",
  doctorNotes: "",
  status: "active",
};

function buildFormFromMedicine(medicine: Medicine): MedicineFormState {
  return {
    name: medicine.name,
    dosage: medicine.dosage ?? "",
    frequency: medicine.frequency ?? "",
    timing: medicine.timing ?? "",
    startDate: medicine.startDate ?? "",
    endDate: medicine.endDate ?? "",
    instructions: medicine.instructions ?? "",
    doctorNotes: medicine.doctorNotes ?? "",
    status: medicine.status,
  };
}

function formatDate(date?: string) {
  return date || "Not recorded";
}

function MedicineCard({
  medicine,
  onDelete,
  onEdit,
  onStatusChange,
}: {
  medicine: Medicine;
  onDelete: (medicine: Medicine) => void;
  onEdit: (medicine: Medicine) => void;
  onStatusChange: (medicine: Medicine, status: MedicineStatus) => void;
}) {
  const isActive = medicine.status === "active";

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{medicine.name}</CardTitle>
            <Badge tone={isActive ? "success" : "neutral"}>{isActive ? "Active" : "Stopped"}</Badge>
          </div>
          <p className="mt-1 text-sm text-brand-muted">
            {[medicine.dosage, medicine.frequency, medicine.timing].filter(Boolean).join(" / ") || "No dose schedule recorded"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => onEdit(medicine)} type="button" variant="ghost">
            <Pencil aria-hidden="true" size={18} />
            Edit
          </Button>
          <Button onClick={() => onStatusChange(medicine, isActive ? "stopped" : "active")} type="button" variant="secondary">
            <RotateCcw aria-hidden="true" size={18} />
            {isActive ? "Stop" : "Reactivate"}
          </Button>
          <Button onClick={() => onDelete(medicine)} type="button" variant="danger">
            <Trash2 aria-hidden="true" size={18} />
            Delete
          </Button>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-brand-muted">Start date</dt>
          <dd className="mt-1 text-brand-ink">{formatDate(medicine.startDate)}</dd>
        </div>
        <div>
          <dt className="font-medium text-brand-muted">End date</dt>
          <dd className="mt-1 text-brand-ink">{formatDate(medicine.endDate)}</dd>
        </div>
        {medicine.instructions ? (
          <div>
            <dt className="font-medium text-brand-muted">Instructions</dt>
            <dd className="mt-1 text-brand-ink">{medicine.instructions}</dd>
          </div>
        ) : null}
        {medicine.doctorNotes ? (
          <div>
            <dt className="font-medium text-brand-muted">Doctor notes</dt>
            <dd className="mt-1 text-brand-ink">{medicine.doctorNotes}</dd>
          </div>
        ) : null}
      </dl>
    </Card>
  );
}

export function MedicinesScreen() {
  const [snapshot, setSnapshot] = useState<MedicineSnapshot>({ activeMedicines: [], stoppedMedicines: [] });
  const [form, setForm] = useState<MedicineFormState>(emptyForm);
  const [editingMedicineId, setEditingMedicineId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function loadSnapshot() {
    const nextSnapshot = await medicineService.getSnapshot();
    setSnapshot(nextSnapshot);
  }

  useEffect(() => {
    let cancelled = false;

    medicineService
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

  function updateField(field: keyof MedicineFormState, value: string) {
    setForm((current) => ({ ...current, [field]: field === "status" ? (value as MedicineStatus) : value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingMedicineId(undefined);
    setFormErrors([]);
  }

  function editMedicine(medicine: Medicine) {
    setForm(buildFormFromMedicine(medicine));
    setEditingMedicineId(medicine.id);
    setFormErrors([]);
    setStatusMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!snapshot.patient) return;

    const nextErrors: string[] = [];
    if (!form.name.trim()) nextErrors.push("Medicine name is required.");
    if (form.status === "stopped" && form.startDate && form.endDate && form.endDate < form.startDate) {
      nextErrors.push("End date cannot be before start date.");
    }

    setFormErrors(nextErrors);
    if (nextErrors.length > 0) return;

    setSaving(true);
    try {
      await medicineService.saveMedicine(
        snapshot.patient.id,
        {
          ...form,
          status: form.status,
        },
        editingMedicineId,
      );
      await loadSnapshot();
      setStatusMessage(editingMedicineId ? "Medicine updated." : "Medicine added.");
      resetForm();
    } catch (error) {
      setFormErrors([error instanceof Error ? error.message : "Could not save medicine."]);
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(medicine: Medicine, status: MedicineStatus) {
    await medicineService.setMedicineStatus(medicine.id, status);
    await loadSnapshot();
    setStatusMessage(status === "active" ? "Medicine reactivated." : "Medicine marked as stopped.");
  }

  async function handleDelete(medicine: Medicine) {
    if (!window.confirm(`Delete ${medicine.name}? This removes it from the local medicine list.`)) return;

    await medicineService.deleteMedicine(medicine.id);
    if (editingMedicineId === medicine.id) resetForm();
    await loadSnapshot();
    setStatusMessage("Medicine deleted.");
  }

  if (loading) {
    return <LoadingState label="Loading medicines..." />;
  }

  if (!snapshot.patient) {
    return (
      <Card>
        <CardTitle>Patient setup required</CardTitle>
        <p className="mt-2 text-sm text-brand-muted">Create the patient profile before tracking medicines.</p>
        <Link
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-brand-mint shadow-soft transition hover:bg-[#0B5D49]"
          href="/patient-setup"
        >
          Go to patient setup
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        action={
          <Button onClick={resetForm} type="button" variant="secondary">
            <Plus aria-hidden="true" size={18} />
            New medicine
          </Button>
        }
        description="Keep a simple active and stopped medicine list for review and future doctor summaries."
        eyebrow="Medicines"
        title="Medicines"
      />

      {statusMessage ? (
        <div className="rounded-lg border border-brand-primary/20 bg-brand-mint p-4 text-sm text-brand-primary" role="status">
          {statusMessage}
        </div>
      ) : null}

      {formErrors.length > 0 ? (
        <div className="notice-alert rounded-lg p-4 text-sm" role="alert">
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
              <Pill aria-hidden="true" size={20} />
            </div>
            <div>
              <CardTitle>{editingMedicineId ? "Edit medicine" : "Add medicine"}</CardTitle>
              <p className="mt-1 text-sm text-brand-muted">Record only what the doctor prescribed. This app does not suggest medicine changes.</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              label="Medicine name"
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Calcium tablet"
              required
              value={form.name}
            />
            <Input
              label="Dosage"
              onChange={(event) => updateField("dosage", event.target.value)}
              placeholder="500 mg"
              value={form.dosage}
            />
            <Input
              label="Frequency"
              onChange={(event) => updateField("frequency", event.target.value)}
              placeholder="Morning + night"
              value={form.frequency}
            />
            <Input
              label="Timing"
              onChange={(event) => updateField("timing", event.target.value)}
              placeholder="After food"
              value={form.timing}
            />
            <Input label="Start date" onChange={(event) => updateField("startDate", event.target.value)} type="date" value={form.startDate} />
            <Input label="End date" onChange={(event) => updateField("endDate", event.target.value)} type="date" value={form.endDate} />
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-muted">Status</span>
              <select
                className="min-h-12 w-full rounded-lg border border-brand-border bg-white px-3.5 py-2.5 text-base text-brand-ink outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-mint"
                onChange={(event) => updateField("status", event.target.value)}
                value={form.status}
              >
                <option value="active">Active</option>
                <option value="stopped">Stopped</option>
              </select>
            </label>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-muted">Instructions</span>
              <textarea
                className="min-h-24 w-full rounded-lg border border-brand-border bg-white px-3.5 py-2.5 text-base text-brand-ink outline-none transition placeholder:text-brand-muted/60 focus:border-brand-primary focus:ring-4 focus:ring-brand-mint"
                onChange={(event) => updateField("instructions", event.target.value)}
                placeholder="Any instructions from the prescription"
                value={form.instructions}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-muted">Doctor notes</span>
              <textarea
                className="min-h-24 w-full rounded-lg border border-brand-border bg-white px-3.5 py-2.5 text-base text-brand-ink outline-none transition placeholder:text-brand-muted/60 focus:border-brand-primary focus:ring-4 focus:ring-brand-mint"
                onChange={(event) => updateField("doctorNotes", event.target.value)}
                placeholder="Notes from the nephrologist or dialysis team"
                value={form.doctorNotes}
              />
            </label>
          </div>
        </Card>

        <div className="sticky bottom-20 rounded-xl border border-brand-border bg-white p-3 shadow-soft lg:static lg:p-0 lg:shadow-none">
          <Button className="w-full" disabled={saving} type="submit">
            <Save aria-hidden="true" size={18} />
            {saving ? "Saving..." : editingMedicineId ? "Update medicine" : "Save medicine"}
          </Button>
        </div>
      </form>

      <section className="space-y-3">
        <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-brand-muted">Active medicines</h2>
        {snapshot.activeMedicines.length === 0 ? (
          <Card>
            <EmptyState description="Add current dialysis-related medicines to keep the record ready for doctor review." title="No active medicines" />
          </Card>
        ) : (
          snapshot.activeMedicines.map((medicine) => (
            <MedicineCard
              key={medicine.id}
              medicine={medicine}
              onDelete={handleDelete}
              onEdit={editMedicine}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-brand-muted">Stopped medicines</h2>
        {snapshot.stoppedMedicines.length === 0 ? (
          <Card>
            <EmptyState description="Medicines marked as stopped will stay here for history." title="No stopped medicines" />
          </Card>
        ) : (
          snapshot.stoppedMedicines.map((medicine) => (
            <MedicineCard
              key={medicine.id}
              medicine={medicine}
              onDelete={handleDelete}
              onEdit={editMedicine}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </section>
    </div>
  );
}
