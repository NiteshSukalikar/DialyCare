import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type DialogProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function DialogPreview({ children, description, title }: DialogProps) {
  return (
    <div className="rounded-xl border border-brand-border bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-brand-ink">{title}</p>
      <p className="mt-1 text-sm leading-6 text-brand-muted">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
      <div className="mt-4 flex gap-2">
        <Button className="flex-1" type="button">
          Confirm
        </Button>
        <Button className="flex-1" type="button" variant="ghost">
          Cancel
        </Button>
      </div>
    </div>
  );
}
