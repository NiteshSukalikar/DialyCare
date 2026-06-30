import { FilterTabs, ModulePlaceholder } from "@/components/common/module-placeholder";

export function HistoryScreen() {
  return (
    <ModulePlaceholder
      description="Review dialysis sessions by week, month, or custom range once records exist."
      emptyDescription="Saved sessions will appear here newest first, grouped by month for quick doctor review."
      emptyTitle="No dialysis sessions yet"
      eyebrow="Records"
      title="Session history"
    >
      <FilterTabs />
    </ModulePlaceholder>
  );
}
