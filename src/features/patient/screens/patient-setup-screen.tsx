"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { LoadingState } from "@/components/common/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePatientSetup } from "@/features/patient/hooks/use-patient-setup";
import type { Gender } from "@/types/core";

interface PatientFormState {
  name: string;
  uhid: string;
  age: string;
  gender: Gender | "";
  hospital: string;
  consultant: string;
  emergencyContact: string;
  dryWeightKg: string;
  dialysisFrequency: string;
  defaultHospital: string;
  defaultDoctor: string;
}

interface DialyzerFormState {
  enabled: boolean;
  name: string;
  startedOn: string;
  currentUsage: string;
  maxUsage: string;
}

const dialysisWeekdays = [
  { aliases: ["mon", "monday"], label: "Mon", value: "Mon" },
  { aliases: ["tue", "tues", "tuesday"], label: "Tue", value: "Tue" },
  { aliases: ["wed", "wednesday"], label: "Wed", value: "Wed" },
  { aliases: ["thu", "thur", "thurs", "thursday"], label: "Thu", value: "Thu" },
  { aliases: ["fri", "friday"], label: "Fri", value: "Fri" },
  { aliases: ["sat", "saturday"], label: "Sat", value: "Sat" },
  { aliases: ["sun", "sunday"], label: "Sun", value: "Sun" },
] as const;

type DialysisWeekday = (typeof dialysisWeekdays)[number]["value"];

const emptyPatientForm: PatientFormState = {
  name: "",
  uhid: "",
  age: "",
  gender: "",
  hospital: "",
  consultant: "",
  emergencyContact: "",
  dryWeightKg: "",
  dialysisFrequency: "",
  defaultHospital: "",
  defaultDoctor: "",
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

const emptyDialyzerForm: DialyzerFormState = {
  enabled: false,
  name: "",
  startedOn: today(),
  currentUsage: "0",
  maxUsage: "12",
};

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseOptionalInteger(value: string) {
  if (!value.trim()) return undefined;
  return Number(value);
}

function parseRequiredNumber(value: string) {
  return Number(value);
}

function buildDialysisFrequency(days: DialysisWeekday[]) {
  if (days.length === 0) return undefined;

  const countLabel = days.length === 1 ? "1 time" : `${days.length} times`;
  return `${countLabel} per week (${days.join(", ")})`;
}

function parseDialysisWeekdays(frequency?: string): DialysisWeekday[] {
  if (!frequency) return [];

  return dialysisWeekdays
    .filter((day) => day.aliases.some((alias) => new RegExp(`\\b${alias}\\b`, "i").test(frequency)))
    .map((day) => day.value);
}

function SelectField({
  id,
  label,
  onChange,
  value,
}: {
  id: string;
  label: string;
  onChange: (value: Gender | "") => void;
  value: Gender | "";
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1.5 block text-sm font-medium text-brand-muted">{label}</span>
      <select
        className="min-h-12 w-full rounded-lg border border-brand-border bg-white px-3.5 py-2.5 text-base text-brand-ink outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-mint"
        id={id}
        onChange={(event) => onChange(event.target.value as Gender | "")}
        value={value}
      >
        <option value="">Select gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
        <option value="prefer-not-to-say">Prefer not to say</option>
      </select>
    </label>
  );
}

export function PatientSetupScreen() {
  const router = useRouter();
  const { error, loading, save, saving, snapshot } = usePatientSetup();
  const [patientForm, setPatientForm] = useState<PatientFormState>(emptyPatientForm);
  const [dialysisDays, setDialysisDays] = useState<DialysisWeekday[]>([]);
  const [dialyzerForm, setDialyzerForm] = useState<DialyzerFormState>(emptyDialyzerForm);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const isEditing = Boolean(snapshot.patient);

  useEffect(() => {
    if (!snapshot.patient) return;

    setPatientForm({
      name: snapshot.patient.name,
      uhid: snapshot.patient.uhid ?? "",
      age: snapshot.patient.age?.toString() ?? "",
      gender: snapshot.patient.gender ?? "",
      hospital: snapshot.patient.hospital ?? "",
      consultant: snapshot.patient.consultant ?? "",
      emergencyContact: snapshot.patient.emergencyContact ?? "",
      dryWeightKg: snapshot.patient.dryWeightKg.toString(),
      dialysisFrequency: snapshot.patient.dialysisFrequency ?? "",
      defaultHospital: snapshot.patient.defaultHospital ?? "",
      defaultDoctor: snapshot.patient.defaultDoctor ?? "",
    });
    setDialysisDays(parseDialysisWeekdays(snapshot.patient.dialysisFrequency));
  }, [snapshot.patient]);

  useEffect(() => {
    if (!snapshot.activeDialyzer) return;

    setDialyzerForm({
      enabled: true,
      name: snapshot.activeDialyzer.name,
      startedOn: snapshot.activeDialyzer.startedOn,
      currentUsage: snapshot.activeDialyzer.currentUsage.toString(),
      maxUsage: snapshot.activeDialyzer.maxUsage.toString(),
    });
  }, [snapshot.activeDialyzer]);

  const effectiveDefaultHospital = useMemo(
    () => patientForm.defaultHospital || patientForm.hospital,
    [patientForm.defaultHospital, patientForm.hospital],
  );

  const effectiveDefaultDoctor = useMemo(
    () => patientForm.defaultDoctor || patientForm.consultant,
    [patientForm.defaultDoctor, patientForm.consultant],
  );

  const calculatedDialysisFrequency = useMemo(() => buildDialysisFrequency(dialysisDays), [dialysisDays]);

  function updatePatientField(field: keyof PatientFormState, value: string) {
    setPatientForm((current) => ({ ...current, [field]: value }));
  }

  function toggleDialysisDay(day: DialysisWeekday) {
    setDialysisDays((current) => {
      if (current.includes(day)) return current.filter((currentDay) => currentDay !== day);
      return dialysisWeekdays.filter((weekday) => [...current, day].includes(weekday.value)).map((weekday) => weekday.value);
    });
  }

  function updateDialyzerField(field: keyof DialyzerFormState, value: string | boolean) {
    setDialyzerForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: string[] = [];
    const dryWeightKg = parseRequiredNumber(patientForm.dryWeightKg);
    const age = parseOptionalInteger(patientForm.age);
    const currentUsage = Number(dialyzerForm.currentUsage);
    const maxUsage = Number(dialyzerForm.maxUsage);

    if (!patientForm.name.trim()) nextErrors.push("Patient name is required.");
    if (!Number.isFinite(dryWeightKg)) nextErrors.push("Dry weight is required.");
    if (patientForm.age.trim() && (!Number.isInteger(age) || age === undefined)) nextErrors.push("Age must be a whole number.");

    if (dialyzerForm.enabled) {
      if (!dialyzerForm.name.trim()) nextErrors.push("Dialyzer name is required when initial dialyzer setup is enabled.");
      if (!dialyzerForm.startedOn) nextErrors.push("Dialyzer start date is required.");
      if (!Number.isInteger(currentUsage)) nextErrors.push("Current usage must be a whole number.");
      if (!Number.isInteger(maxUsage)) nextErrors.push("Max usage must be a whole number.");
      if (Number.isInteger(currentUsage) && Number.isInteger(maxUsage) && currentUsage > maxUsage) {
        nextErrors.push("Current usage cannot exceed max usage.");
      }
    }

    setFormErrors(nextErrors);
    if (nextErrors.length > 0) return;

    try {
      await save({
        patient: {
          name: patientForm.name.trim(),
          uhid: optionalText(patientForm.uhid),
          age,
          gender: patientForm.gender || undefined,
          hospital: optionalText(patientForm.hospital),
          consultant: optionalText(patientForm.consultant),
          emergencyContact: optionalText(patientForm.emergencyContact),
          dryWeightKg,
          dialysisFrequency: calculatedDialysisFrequency ?? optionalText(patientForm.dialysisFrequency),
          defaultHospital: optionalText(effectiveDefaultHospital),
          defaultDoctor: optionalText(effectiveDefaultDoctor),
        },
        initialDialyzer: dialyzerForm.enabled
          ? {
              name: dialyzerForm.name.trim(),
              startedOn: dialyzerForm.startedOn,
              currentUsage,
              maxUsage,
            }
          : undefined,
      });

      router.push("/?setup=complete");
    } catch {
      // The hook exposes the repository validation message in the page alert.
    }
  }

  if (loading) {
    return <LoadingState label="Loading patient setup..." />;
  }

  const combinedErrors = [...formErrors, ...(error ? [error] : [])];

  return (
    <div className="space-y-5">
      <PageHeader
        description="Capture the one patient profile, dialysis baseline, and current dialyzer before daily tracking."
        eyebrow={isEditing ? "Patient profile" : "Step 1 of 1"}
        title={isEditing ? "Edit patient setup" : "Patient setup"}
      />

      {combinedErrors.length > 0 ? (
        <div className="notice-alert rounded-lg p-4 text-sm" role="alert">
          <p className="font-semibold">Please fix these details:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {combinedErrors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Card>
          <CardTitle>Patient details</CardTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              label="Patient name"
              onChange={(event) => updatePatientField("name", event.target.value)}
              placeholder="Full name"
              required
              value={patientForm.name}
            />
            <Input
              label="UHID or hospital ID"
              onChange={(event) => updatePatientField("uhid", event.target.value)}
              placeholder="Optional"
              value={patientForm.uhid}
            />
            <Input
              inputMode="numeric"
              label="Age"
              onChange={(event) => updatePatientField("age", event.target.value)}
              placeholder="62"
              type="number"
              value={patientForm.age}
            />
            <SelectField
              id="patient-gender"
              label="Gender"
              onChange={(value) => updatePatientField("gender", value)}
              value={patientForm.gender}
            />
            <Input
              label="Hospital"
              onChange={(event) => updatePatientField("hospital", event.target.value)}
              placeholder="Dialysis center name"
              value={patientForm.hospital}
            />
            <Input
              label="Consultant nephrologist"
              onChange={(event) => updatePatientField("consultant", event.target.value)}
              placeholder="Doctor name"
              value={patientForm.consultant}
            />
            <Input
              className="sm:col-span-2"
              label="Emergency contact"
              onChange={(event) => updatePatientField("emergencyContact", event.target.value)}
              placeholder="Name and phone number"
              value={patientForm.emergencyContact}
            />
          </div>
        </Card>

        <Card>
          <CardTitle>Dialysis baseline</CardTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              inputMode="decimal"
              label="Dry weight (kg)"
              onChange={(event) => updatePatientField("dryWeightKg", event.target.value)}
              placeholder="57.0"
              required
              step="0.1"
              type="number"
              value={patientForm.dryWeightKg}
            />
            <fieldset className="sm:col-span-1">
              <legend className="mb-1.5 block text-sm font-medium text-brand-muted">Dialysis days</legend>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {dialysisWeekdays.map((day) => {
                  const checked = dialysisDays.includes(day.value);
                  return (
                    <label
                      className={`flex min-h-12 cursor-pointer items-center justify-center rounded-lg border px-2 text-sm font-semibold transition ${
                        checked
                          ? "border-brand-primary bg-brand-mint text-brand-primary"
                          : "border-brand-border bg-white text-brand-muted hover:border-brand-primary/50"
                      }`}
                      key={day.value}
                    >
                      <input
                        checked={checked}
                        className="sr-only"
                        onChange={() => toggleDialysisDay(day.value)}
                        type="checkbox"
                      />
                      {day.label}
                    </label>
                  );
                })}
              </div>
              <p className="mt-1 text-xs text-brand-muted">
                {calculatedDialysisFrequency
                  ? `Frequency: ${calculatedDialysisFrequency}`
                  : patientForm.dialysisFrequency
                    ? `Saved frequency: ${patientForm.dialysisFrequency}`
                    : "Select dialysis days to calculate weekly frequency."}
              </p>
            </fieldset>
            <Input
              hint="Leave blank to use the hospital from patient details."
              label="Default hospital"
              onChange={(event) => updatePatientField("defaultHospital", event.target.value)}
              placeholder={patientForm.hospital || "Same as above"}
              value={patientForm.defaultHospital}
            />
            <Input
              hint="Leave blank to use the consultant from patient details."
              label="Default doctor"
              onChange={(event) => updatePatientField("defaultDoctor", event.target.value)}
              placeholder={patientForm.consultant || "Doctor name"}
              value={patientForm.defaultDoctor}
            />
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Initial active dialyzer</CardTitle>
              <p className="mt-1 text-sm text-brand-muted">Optional, but useful if the current dialyzer is already in use.</p>
            </div>
            <label className="flex min-h-11 items-center gap-2 rounded-lg bg-brand-mint px-3 text-sm font-semibold text-brand-primary">
              <input
                checked={dialyzerForm.enabled}
                className="h-4 w-4 accent-brand-primary"
                onChange={(event) => updateDialyzerField("enabled", event.target.checked)}
                type="checkbox"
              />
              Add dialyzer
            </label>
          </div>

          {dialyzerForm.enabled ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input
                label="Dialyzer name"
                onChange={(event) => updateDialyzerField("name", event.target.value)}
                placeholder="F8HPS"
                required={dialyzerForm.enabled}
                value={dialyzerForm.name}
              />
              <Input
                label="Start date"
                onChange={(event) => updateDialyzerField("startedOn", event.target.value)}
                required={dialyzerForm.enabled}
                type="date"
                value={dialyzerForm.startedOn}
              />
              <Input
                inputMode="numeric"
                label="Current usage count"
                min="0"
                onChange={(event) => updateDialyzerField("currentUsage", event.target.value)}
                placeholder="0"
                required={dialyzerForm.enabled}
                type="number"
                value={dialyzerForm.currentUsage}
              />
              <Input
                inputMode="numeric"
                label="Max usage count"
                min="1"
                onChange={(event) => updateDialyzerField("maxUsage", event.target.value)}
                placeholder="12"
                required={dialyzerForm.enabled}
                type="number"
                value={dialyzerForm.maxUsage}
              />
            </div>
          ) : null}
        </Card>

        <div className="sticky bottom-20 rounded-xl border border-brand-border bg-white p-3 shadow-soft lg:static lg:p-0 lg:shadow-none">
          <Button className="w-full" disabled={saving} type="submit">
            {saving ? "Saving..." : isEditing ? "Update patient profile" : "Save patient profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
