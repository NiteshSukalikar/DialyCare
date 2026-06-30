import type { ReactNode } from "react";

type BadgeTone = "success" | "warning" | "neutral";

const toneClasses: Record<BadgeTone, string> = {
  success: "bg-brand-mint text-brand-primary",
  warning: "bg-brand-alert/10 text-brand-alert",
  neutral: "bg-brand-neutral text-brand-muted",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}
