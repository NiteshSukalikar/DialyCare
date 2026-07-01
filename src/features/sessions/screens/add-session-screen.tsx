"use client";

import { Mic, MicOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { LoadingState } from "@/components/common/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSessionEntry } from "@/features/sessions/hooks/use-session-entry";
import {
  calculateUfVarianceFromWeightLossLiters,
  calculateWeightGainVsDryKg,
  calculateWeightLossKg,
  nextDialyzerUseNumber,
} from "@/features/sessions/utils/session-calculations";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

interface SessionFormState {
  date: string;
  sessionTime: string;
  preWeightKg: string;
  postWeightKg: string;
  weightLossKg: string;
  preBpSystolic: string;
  preBpDiastolic: string;
  postBpSystolic: string;
  postBpDiastolic: string;
  ufRemovedLiters: string;
  dialyzerId: string;
  dialyzerUseNumber: string;
  hospital: string;
  doctor: string;
  complications: string;
  injectionsGiven: string;
  medicineChanges: string;
  machineNotes: string;
  remarks: string;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

const emptyForm: SessionFormState = {
  date: today(),
  sessionTime: "",
  preWeightKg: "",
  postWeightKg: "",
  weightLossKg: "",
  preBpSystolic: "",
  preBpDiastolic: "",
  postBpSystolic: "",
  postBpDiastolic: "",
  ufRemovedLiters: "",
  dialyzerId: "",
  dialyzerUseNumber: "",
  hospital: "",
  doctor: "",
  complications: "",
  injectionsGiven: "",
  medicineChanges: "",
  machineNotes: "",
  remarks: "",
};

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function numericValue(value: string) {
  if (!value.trim()) return Number.NaN;
  return Number(value);
}

function integerValue(value: string) {
  return Number.parseInt(value, 10);
}

export function AddSessionScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId") ?? undefined;
  const { deleting, error, loading, remove, save, saving, snapshot } = useSessionEntry(sessionId);
  const [form, setForm] = useState<SessionFormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const isEditing = Boolean(sessionId);

  useEffect(() => {
    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    setVoiceSupported(Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition));
  }, []);

  useEffect(() => {
    if (!snapshot.patient) return;

    setForm((current) => ({
      ...current,
      hospital: current.hospital || snapshot.patient?.defaultHospital || snapshot.patient?.hospital || "",
      doctor: current.doctor || snapshot.patient?.defaultDoctor || snapshot.patient?.consultant || "",
    }));
  }, [snapshot.patient]);

  useEffect(() => {
    if (!snapshot.activeDialyzer || snapshot.session) return;

    setForm((current) => ({
      ...current,
      dialyzerId: snapshot.activeDialyzer?.id ?? "",
      dialyzerUseNumber: nextDialyzerUseNumber(snapshot.activeDialyzer?.currentUsage ?? 0).toString(),
    }));
  }, [snapshot.activeDialyzer, snapshot.session]);

  useEffect(() => {
    if (!snapshot.session) return;

    setForm({
      date: snapshot.session.date,
      sessionTime: snapshot.session.sessionTime ?? "",
      preWeightKg: snapshot.session.preWeightKg.toString(),
      postWeightKg: snapshot.session.postWeightKg.toString(),
      weightLossKg: (snapshot.session.weightLossKg ?? calculateWeightLossKg(snapshot.session.preWeightKg, snapshot.session.postWeightKg) ?? "").toString(),
      preBpSystolic: snapshot.session.preBpSystolic.toString(),
      preBpDiastolic: snapshot.session.preBpDiastolic.toString(),
      postBpSystolic: snapshot.session.postBpSystolic.toString(),
      postBpDiastolic: snapshot.session.postBpDiastolic.toString(),
      ufRemovedLiters: snapshot.session.ufRemovedLiters.toString(),
      dialyzerId: snapshot.session.dialyzerId ?? "",
      dialyzerUseNumber: snapshot.session.dialyzerUseNumber?.toString() ?? "",
      hospital: snapshot.session.hospital ?? "",
      doctor: snapshot.session.doctor ?? "",
      complications: snapshot.session.complications ?? "",
      injectionsGiven: snapshot.session.injectionsGiven ?? "",
      medicineChanges: snapshot.session.medicineChanges ?? "",
      machineNotes: snapshot.session.machineNotes ?? "",
      remarks: snapshot.session.remarks ?? "",
    });
  }, [snapshot.session]);

  const calculations = useMemo(() => {
    const preWeightKg = numericValue(form.preWeightKg);
    const postWeightKg = numericValue(form.postWeightKg);
    const weightLossKg = numericValue(form.weightLossKg);
    const dryWeightKg = snapshot.patient?.dryWeightKg;

    return {
      calculatedWeightLossKg: calculateWeightLossKg(preWeightKg, postWeightKg),
      weightLossKg: Number.isFinite(weightLossKg) ? weightLossKg : undefined,
      gainVsDryKg: dryWeightKg === undefined ? undefined : calculateWeightGainVsDryKg(preWeightKg, dryWeightKg),
      ufVarianceLiters: calculateUfVarianceFromWeightLossLiters(Number.isFinite(weightLossKg) ? weightLossKg : undefined, numericValue(form.ufRemovedLiters)),
    };
  }, [form.postWeightKg, form.preWeightKg, form.ufRemovedLiters, form.weightLossKg, snapshot.patient?.dryWeightKg]);

  function updateField(field: keyof SessionFormState, value: string) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "preWeightKg" || field === "postWeightKg") {
        const calculatedWeightLossKg = calculateWeightLossKg(numericValue(next.preWeightKg), numericValue(next.postWeightKg));
        next.weightLossKg = calculatedWeightLossKg === undefined ? "" : calculatedWeightLossKg.toString();
      }
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!snapshot.patient) {
      router.replace("/patient-setup");
      return;
    }

    const nextErrors: string[] = [];
    const preWeightKg = numericValue(form.preWeightKg);
    const postWeightKg = numericValue(form.postWeightKg);
    const preBpSystolic = integerValue(form.preBpSystolic);
    const preBpDiastolic = integerValue(form.preBpDiastolic);
    const postBpSystolic = integerValue(form.postBpSystolic);
    const postBpDiastolic = integerValue(form.postBpDiastolic);
    const ufRemovedLiters = numericValue(form.ufRemovedLiters);
    const weightLossKg = numericValue(form.weightLossKg);
    const dialyzerUseNumber = form.dialyzerUseNumber.trim() ? integerValue(form.dialyzerUseNumber) : undefined;

    if (!form.date) nextErrors.push("Session date is required.");
    if (!Number.isFinite(preWeightKg)) nextErrors.push("Pre-HD weight is required.");
    if (!Number.isFinite(postWeightKg)) nextErrors.push("Post-HD weight is required.");
    if (!Number.isFinite(weightLossKg)) nextErrors.push("Weight loss is required.");
    if (!Number.isInteger(preBpSystolic) || !Number.isInteger(preBpDiastolic)) nextErrors.push("Pre-HD BP needs systolic and diastolic numbers.");
    if (!Number.isInteger(postBpSystolic) || !Number.isInteger(postBpDiastolic)) nextErrors.push("Post-HD BP needs systolic and diastolic numbers.");
    if (!Number.isFinite(ufRemovedLiters)) nextErrors.push("UF removed is required.");
    if (form.dialyzerId && (!Number.isInteger(dialyzerUseNumber) || dialyzerUseNumber === undefined)) {
      nextErrors.push("Dialyzer use number is required when a dialyzer is selected.");
    }

    setFormErrors(nextErrors);
    if (nextErrors.length > 0) return;

    try {
      await save({
        patientId: snapshot.patient.id,
        date: form.date,
        sessionTime: optionalText(form.sessionTime),
        preWeightKg,
        postWeightKg,
        weightLossKg,
        preBpSystolic,
        preBpDiastolic,
        postBpSystolic,
        postBpDiastolic,
        ufRemovedLiters,
        dialyzerId: optionalText(form.dialyzerId),
        dialyzerUseNumber,
        hospital: optionalText(form.hospital),
        doctor: optionalText(form.doctor),
        complications: optionalText(form.complications),
        injectionsGiven: optionalText(form.injectionsGiven),
        medicineChanges: optionalText(form.medicineChanges),
        machineNotes: optionalText(form.machineNotes),
        remarks: optionalText(form.remarks),
      });

      router.push("/history?session=saved");
    } catch {
      // The hook exposes the repository validation message in the page alert.
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this dialysis session? This cannot be undone.")) return;
    await remove();
    router.push("/history?session=deleted");
  }

  function toggleVoiceRemarks() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (transcript) {
        setForm((current) => ({
          ...current,
          remarks: current.remarks.trim() ? `${current.remarks.trim()} ${transcript}` : transcript,
        }));
      }
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  if (loading) {
    return <LoadingState label="Loading session form..." />;
  }

  if (!snapshot.patient) {
    return (
      <Card>
        <CardTitle>Patient setup required</CardTitle>
        <p className="mt-2 text-sm text-brand-muted">Create the patient profile before adding dialysis sessions.</p>
        <Button className="mt-4" onClick={() => router.push("/patient-setup")} type="button">
          Go to patient setup
        </Button>
      </Card>
    );
  }

  const combinedErrors = [...formErrors, ...(error ? [error] : [])];

  return (
    <div className="space-y-5">
      <PageHeader
        description="Large fields and a fixed save action keep the common session entry flow fast on phone."
        eyebrow="Dialysis record"
        title={isEditing ? "Edit dialysis session" : "Add dialysis session"}
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
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Session basics</CardTitle>
            <Badge tone="success">Target under 30 sec</Badge>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="Date" onChange={(event) => updateField("date", event.target.value)} required type="date" value={form.date} />
            <Input label="Session time" onChange={(event) => updateField("sessionTime", event.target.value)} type="time" value={form.sessionTime} />
            <Input
              inputMode="decimal"
              label="Pre-HD weight (kg)"
              onChange={(event) => updateField("preWeightKg", event.target.value)}
              placeholder="62.4"
              required
              step="0.1"
              type="number"
              value={form.preWeightKg}
            />
            <Input
              inputMode="decimal"
              label="Post-HD weight (kg)"
              onChange={(event) => updateField("postWeightKg", event.target.value)}
              placeholder="58.5"
              required
              step="0.1"
              type="number"
              value={form.postWeightKg}
            />
            <Input
              hint={
                calculations.calculatedWeightLossKg === undefined
                  ? "Auto-fills after pre and post weight."
                  : `Auto-calculated: ${calculations.calculatedWeightLossKg} kg`
              }
              inputMode="decimal"
              label="Weight loss (kg)"
              onChange={(event) => updateField("weightLossKg", event.target.value)}
              placeholder="3.7"
              required
              step="0.1"
              type="number"
              value={form.weightLossKg}
            />
          </div>
          <div className="mt-4 grid gap-3 rounded-lg bg-brand-neutral p-3 text-sm sm:grid-cols-2">
            <p>
              <span className="text-brand-muted">Weight loss: </span>
              <strong className="text-brand-ink">{calculations.weightLossKg === undefined ? "--" : `${calculations.weightLossKg} kg`}</strong>
            </p>
            <p>
              <span className="text-brand-muted">Gain vs dry weight: </span>
              <strong className="text-brand-ink">{calculations.gainVsDryKg === undefined ? "--" : `${calculations.gainVsDryKg} kg`}</strong>
            </p>
            <p>
              <span className="text-brand-muted">UF variance: </span>
              <strong className="text-brand-ink">
                {calculations.ufVarianceLiters === undefined ? "--" : `${calculations.ufVarianceLiters > 0 ? "+" : ""}${calculations.ufVarianceLiters} L`}
              </strong>
            </p>
          </div>
        </Card>

        <Card>
          <CardTitle>BP and UF</CardTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input inputMode="numeric" label="Pre-HD systolic BP" onChange={(event) => updateField("preBpSystolic", event.target.value)} placeholder="160" required type="number" value={form.preBpSystolic} />
            <Input inputMode="numeric" label="Pre-HD diastolic BP" onChange={(event) => updateField("preBpDiastolic", event.target.value)} placeholder="90" required type="number" value={form.preBpDiastolic} />
            <Input inputMode="numeric" label="Post-HD systolic BP" onChange={(event) => updateField("postBpSystolic", event.target.value)} placeholder="130" required type="number" value={form.postBpSystolic} />
            <Input inputMode="numeric" label="Post-HD diastolic BP" onChange={(event) => updateField("postBpDiastolic", event.target.value)} placeholder="80" required type="number" value={form.postBpDiastolic} />
            <Input
              inputMode="decimal"
              label="UF removed (L)"
              onChange={(event) => updateField("ufRemovedLiters", event.target.value)}
              placeholder="3.9"
              required
              step="0.1"
              type="number"
              value={form.ufRemovedLiters}
            />
          </div>
        </Card>

        <Card>
          <CardTitle>Dialyzer confirmation</CardTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block" htmlFor="dialyzer-used">
              <span className="mb-1.5 block text-sm font-medium text-brand-muted">Dialyzer used</span>
              <select
                className="min-h-12 w-full rounded-lg border border-brand-border bg-white px-3.5 py-2.5 text-base text-brand-ink outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-mint"
                id="dialyzer-used"
                onChange={(event) => updateField("dialyzerId", event.target.value)}
                value={form.dialyzerId}
              >
                <option value="">No dialyzer selected</option>
                {snapshot.activeDialyzer ? <option value={snapshot.activeDialyzer.id}>{snapshot.activeDialyzer.name}</option> : null}
              </select>
            </label>
            <Input
              hint={snapshot.activeDialyzer ? `Current saved usage: ${snapshot.activeDialyzer.currentUsage} / ${snapshot.activeDialyzer.maxUsage}` : "Set up an active dialyzer from patient setup."}
              inputMode="numeric"
              label="Use number"
              min="0"
              onChange={(event) => updateField("dialyzerUseNumber", event.target.value)}
              placeholder="7"
              type="number"
              value={form.dialyzerUseNumber}
            />
          </div>
        </Card>

        <Card>
          <CardTitle>Optional session details</CardTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="Hospital" onChange={(event) => updateField("hospital", event.target.value)} placeholder="Dialysis center" value={form.hospital} />
            <Input label="Doctor" onChange={(event) => updateField("doctor", event.target.value)} placeholder="Doctor on duty" value={form.doctor} />
            <Input label="Complications" onChange={(event) => updateField("complications", event.target.value)} placeholder="Cramps, dizziness..." value={form.complications} />
            <Input label="Injections given" onChange={(event) => updateField("injectionsGiven", event.target.value)} placeholder="Optional" value={form.injectionsGiven} />
            <Input label="Medicine changes" onChange={(event) => updateField("medicineChanges", event.target.value)} placeholder="Optional" value={form.medicineChanges} />
            <Input label="Machine notes" onChange={(event) => updateField("machineNotes", event.target.value)} placeholder="Optional" value={form.machineNotes} />
          </div>
          <label className="mt-4 block" htmlFor="remarks">
            <span className="mb-1.5 flex items-center justify-between gap-3 text-sm font-medium text-brand-muted">
              Remarks
              {voiceSupported ? (
                <button
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-mint px-3 text-sm font-semibold text-brand-primary transition hover:bg-[#D3EFE5]"
                  onClick={toggleVoiceRemarks}
                  type="button"
                >
                  {listening ? <MicOff aria-hidden="true" size={17} /> : <Mic aria-hidden="true" size={17} />}
                  {listening ? "Stop" : "Voice note"}
                </button>
              ) : null}
            </span>
            <textarea
              className="min-h-28 w-full rounded-lg border border-brand-border bg-white px-3.5 py-2.5 text-base text-brand-ink outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-mint"
              id="remarks"
              onChange={(event) => updateField("remarks", event.target.value)}
              placeholder="Stable, symptoms, observations..."
              value={form.remarks}
            />
          </label>
        </Card>

        <div className="sticky bottom-20 flex gap-3 rounded-xl border border-brand-border bg-white p-3 shadow-soft lg:static lg:p-0 lg:shadow-none">
          {isEditing ? (
            <Button className="shrink-0" disabled={deleting || saving} onClick={handleDelete} type="button" variant="danger">
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          ) : null}
          <Button className="w-full" disabled={saving || deleting} type="submit">
            {saving ? "Saving..." : isEditing ? "Update session" : "Save session"}
          </Button>
        </div>
      </form>
    </div>
  );
}
