import type { ReactNode } from "react";
import { Inbox } from "lucide-react";


type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-brand-border bg-white/70 p-5 text-center">
      <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-brand-mint text-brand-primary">
        <Inbox aria-hidden="true" size={20} />
      </div>
      <h2 className="mt-3 text-base font-semibold text-brand-ink">{title}</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-brand-muted">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function EmptyAction({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-brand-mint px-4 py-2.5 text-sm font-semibold text-brand-primary transition hover:bg-[#D3EFE5] sm:w-auto">
      {children}
    </span>
  );
}
