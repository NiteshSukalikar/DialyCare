import { appConfig } from "@/config/app";
import { ModulePlaceholder } from "@/components/common/module-placeholder";
import { DialogPreview } from "@/components/ui/dialog";

export function BackupScreen() {
  return (
    <ModulePlaceholder
      description="Protect local-only records with JSON backup/import and doctor-friendly PDF exports in later phases."
      emptyDescription="Backup tools will be enabled after the IndexedDB data layer is implemented."
      emptyTitle="Backup actions are not connected yet"
      eyebrow="Safety"
      title="Backup and export"
    >
      <DialogPreview
        description="Future import will ask for confirmation before replacing local records on this device."
        title="Import confirmation pattern"
      />
      <div className="mt-4 rounded-lg bg-brand-mint p-4 text-sm leading-6 text-brand-primary">
        {appConfig.disclaimer}
      </div>
    </ModulePlaceholder>
  );
}
