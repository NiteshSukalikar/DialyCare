"use client";

import { useCallback, useEffect, useState } from "react";

import {
  sessionEntryService,
  type SessionEntrySnapshot,
} from "@/features/sessions/services/session-entry-service";
import type { CreateSessionInput } from "@/data/repositories";

export function useSessionEntry(sessionId?: string) {
  const [snapshot, setSnapshot] = useState<SessionEntrySnapshot>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setSnapshot(await sessionEntryService.getSnapshot(sessionId));
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : "Unable to load session entry.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (input: CreateSessionInput) => {
      setSaving(true);
      setError(null);

      try {
        const session = await sessionEntryService.saveSession(input, sessionId);
        setSnapshot((current) => ({ ...current, session }));
        return session;
      } catch (unknownError) {
        const message = unknownError instanceof Error ? unknownError.message : "Unable to save dialysis session.";
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [sessionId],
  );

  const remove = useCallback(async () => {
    if (!sessionId) return;
    setDeleting(true);
    setError(null);

    try {
      await sessionEntryService.deleteSession(sessionId);
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Unable to delete dialysis session.";
      setError(message);
      throw new Error(message);
    } finally {
      setDeleting(false);
    }
  }, [sessionId]);

  return { deleting, error, loading, refresh: load, remove, save, saving, snapshot };
}

