import { ModulePlaceholder } from "@/components/common/module-placeholder";

export function DocumentsScreen() {
  return (
    <ModulePlaceholder
      description="Store booklet photos, prescriptions, reports, bills, and notes locally on this device."
      emptyDescription="Uploaded images and PDFs will appear here with category, date, and notes."
      emptyTitle="No documents uploaded yet"
      eyebrow="Reports"
      title="Documents"
    />
  );
}
