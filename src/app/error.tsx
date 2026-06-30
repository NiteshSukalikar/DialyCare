"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-xl border border-brand-alert/30 bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-brand-alert/10 p-2 text-brand-alert">
          <AlertTriangle aria-hidden="true" size={20} />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-brand-ink">Something went wrong</h1>
          <p className="mt-1 text-sm leading-6 text-brand-muted">
            Your records are local to this device. Try reloading this screen, and export a backup
            regularly once backup is available.
          </p>
          {error.digest ? (
            <p className="mt-2 text-xs text-brand-muted">Error reference: {error.digest}</p>
          ) : null}
        </div>
      </div>
      <Button className="mt-4 w-full sm:w-auto" onClick={reset} type="button">
        Try again
      </Button>
    </div>
  );
}
