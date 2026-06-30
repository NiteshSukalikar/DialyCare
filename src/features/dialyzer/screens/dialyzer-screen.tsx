import { ModulePlaceholder } from "@/components/common/module-placeholder";

export function DialyzerScreen() {
  return (
    <ModulePlaceholder
      description="Track current dialyzer usage and keep archived dialyzers attached to past sessions."
      emptyDescription="The active dialyzer, usage count, and near-limit warnings will appear after setup."
      emptyTitle="No active dialyzer configured"
      eyebrow="Tracker"
      title="Dialyzer"
    />
  );
}
