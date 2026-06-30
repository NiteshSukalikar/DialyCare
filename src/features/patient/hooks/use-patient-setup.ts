"use client";

import { useCallback, useEffect, useState } from "react";

import { patientSetupService, type PatientSetupInput, type PatientSetupSnapshot } from "@/features/patient/services/patient-setup-service";

export function usePatientSetup() {
  const [snapshot, setSnapshot] = useState<PatientSetupSnapshot>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    patientSetupService
      .getSnapshot()
      .then((result) => {
        if (!cancelled) setSnapshot(result);
      })
      .catch((unknownError) => {
        if (!cancelled) setError(unknownError instanceof Error ? unknownError.message : "Unable to load patient setup.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(async (input: PatientSetupInput) => {
    setSaving(true);
    setError(null);

    try {
      const result = await patientSetupService.saveSetup(input);
      setSnapshot(result);
      return result;
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Unable to save patient setup.";
      setError(message);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    error,
    loading,
    save,
    saving,
    snapshot,
  };
}
