import { FilterTabs, ModulePlaceholder } from "@/components/common/module-placeholder";

export function AnalyticsScreen() {
  return (
    <ModulePlaceholder
      description="Show basic BP, weight, and UF trends as records accumulate without medical interpretation."
      emptyDescription="Charts need saved sessions before trends can be drawn."
      emptyTitle="Not enough session data"
      eyebrow="Trends"
      title="Analytics"
    >
      <FilterTabs />
    </ModulePlaceholder>
  );
}
