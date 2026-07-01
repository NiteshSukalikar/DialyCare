import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function Input({ className = "", hint, id, label, ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replaceAll(" ", "-");

  return (
    <label className="block min-w-0" htmlFor={inputId}>
      <span className="mb-1.5 block text-sm font-medium text-brand-muted">{label}</span>
      <input
        id={inputId}
        className={`min-h-12 w-full min-w-0 max-w-full rounded-lg border border-brand-border bg-brand-surface px-3.5 py-2.5 text-base text-brand-ink outline-none transition placeholder:text-brand-muted/60 focus:border-brand-primary focus:ring-4 focus:ring-brand-mint ${className}`}
        {...props}
      />
      {hint ? <span className="mt-1 block text-xs text-brand-muted">{hint}</span> : null}
    </label>
  );
}
