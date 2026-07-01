# DialyCare MVP Release Notes

## Release Scope

DialyCare MVP is a mobile-first offline dialysis record tracker for one caregiver managing one patient. It replaces the paper dialysis booklet workflow with local records for patient profile, dialysis sessions, dialyzer usage, medicines, documents, analytics, backup, and PDF summaries.

## Included

- One-patient setup with dialysis baseline and initial dialyzer.
- Fast dialysis session entry with weight, BP, UF, dialyzer use, remarks, and optional notes.
- Session history with filters, monthly grouping, detail, edit, and delete.
- Dashboard with latest session, weight, dry weight, dialyzer status, next dialysis estimate, and quick actions.
- Dialyzer tracker with active/archived dialyzers and near-limit warning states.
- Medicine list with active/stopped status.
- Local document storage for image/PDF reports and booklet photos.
- Analytics cards and trends for recorded dialysis values.
- Full JSON backup/export and restore.
- Monthly and doctor summary PDF export.
- PWA manifest, service worker, icons, and offline-first local storage.

## Known Limitations

- No login, backend, cloud sync, or multi-device sync.
- Records are stored in the current browser on the current device.
- Clearing browser data, losing the device, or uninstalling the browser can remove records unless a JSON backup was exported.
- JSON backup includes document metadata, but uploaded file blobs are not embedded in the backup file.
- PDF summaries are compact record summaries, not clinical reports.
- No reminders, OCR, AI summaries, lab interpretation, or clinic workflows in MVP.

## Medical Safety

DialyCare is a personal record-tracking tool. It does not provide medical advice, diagnosis, or treatment. Always consult your nephrologist or dialysis care team for medical decisions.

The app should not recommend dialysis settings, medication changes, or clinical conclusions. Analytics and PDFs summarize recorded values only.

## Verification

Current automated checks:

- Unit tests cover calculations, analytics summaries, dashboard view model, patient setup service, data repositories, session history utilities, dialyzer tracker utilities, medicine service, document service, and backup restore validation.
- TypeScript typecheck verifies application and test code.
- ESLint verifies code style and common React/TypeScript issues.

Manual release checks are tracked in `docs/mvp-qa-checklist.md`.
