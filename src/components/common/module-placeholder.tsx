import type { ReactNode } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";

type ModulePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  children?: ReactNode;
};

export function ModulePlaceholder({
  children,
  description,
  emptyDescription,
  emptyTitle,
  eyebrow,
  title,
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-5">
      <PageHeader description={description} eyebrow={eyebrow} title={title} />
      <Card>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{title}</CardTitle>
          <Badge tone="neutral">Phase 1 skeleton</Badge>
        </div>
        {children ? <div className="mt-4">{children}</div> : null}
        <div className="mt-4">
          <EmptyState description={emptyDescription} title={emptyTitle} />
        </div>
      </Card>
    </div>
  );
}

export function FilterTabs() {
  return <Tabs tabs={[{ label: "This week", active: true }, { label: "This month" }, { label: "3 months" }]} />;
}
