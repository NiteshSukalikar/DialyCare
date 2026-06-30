import { ModulePlaceholder } from "@/components/common/module-placeholder";

export function MedicinesScreen() {
  return (
    <ModulePlaceholder
      description="Maintain a simple active and stopped medicine list for doctor summaries."
      emptyDescription="Medicines will be listed with dose, frequency, timing, dates, and doctor notes."
      emptyTitle="No medicines added yet"
      eyebrow="Medicines"
      title="Medicines"
    />
  );
}
