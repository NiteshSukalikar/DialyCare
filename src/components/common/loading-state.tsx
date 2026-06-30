export function LoadingState({ label = "Loading records..." }: { label?: string }) {
  return (
    <div className="rounded-xl border border-brand-border bg-white p-5">
      <div className="h-3 w-28 animate-pulse rounded-full bg-brand-neutral" />
      <div className="mt-4 space-y-3">
        <div className="h-12 animate-pulse rounded-lg bg-brand-neutral" />
        <div className="h-12 animate-pulse rounded-lg bg-brand-neutral" />
      </div>
      <p className="mt-4 text-sm text-brand-muted">{label}</p>
    </div>
  );
}
