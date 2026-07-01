# DialyCare MVP QA Checklist

Use this checklist before calling the MVP ready for real daily use. Run it on a phone-width viewport first, then repeat the main review flows on a tablet-width viewport.

## Environment

- Run `npm.cmd test`.
- Run `npm.cmd run typecheck`.
- Run `npm.cmd run lint`.
- Run `npm.cmd run build`.
- Open the app after a fresh browser storage clear.

## Patient Setup

- New visitor is sent to patient setup when no patient exists.
- Required fields block save when empty.
- Patient profile and dialysis baseline save successfully.
- Initial dialyzer is created during setup.
- Setup success redirects to dashboard.
- Editing the patient profile persists after refresh.

## Add Session

- Add Session is reachable from dashboard and bottom navigation.
- Common fields can be entered without scrolling back to the top.
- Numeric fields use mobile-friendly keyboards.
- Invalid weight, BP, UF, and missing date values are rejected.
- Weight loss and dry-weight difference update from entered values.
- Active dialyzer usage defaults to the next use number and can be adjusted.
- Saving creates a history record and refreshes dashboard values.
- Editing an old session updates the record and dialyzer usage.
- Deleting a session requires confirmation.

## Review Flows

- Dashboard shows latest weight, dry weight, weight difference, active dialyzer, next dialysis estimate, quick actions, and recent session.
- History sorts newest first, groups by month, filters by date range, and opens detail view.
- Dialyzer tracker shows active and archived dialyzers with warning states near max usage.
- Medicines can be created, edited, stopped, reactivated, and deleted.
- Documents can upload image/PDF files, open previews, edit metadata, and delete after confirmation.
- Analytics handles empty state and displays cards/charts when session data exists.

## Backup And Export

- JSON export downloads a DialyCare backup file.
- Invalid JSON and non-DialyCare backup files are rejected.
- Import asks for overwrite confirmation before replacing local data.
- Exported backup restores patient, sessions, dialyzers, medicines, document metadata, and settings into fresh browser storage.
- Doctor summary PDF downloads for a selected date range.
- Monthly PDF downloads for a selected month.
- Backup reminder settings save and persist.

## Accessibility And Responsive Pass

- Every visible input has a text label or accessible label.
- Icon-only visuals are hidden from assistive technology when decorative.
- Error and success states use `role="alert"` or `role="status"` where appropriate.
- Main tap targets are at least 44 px high.
- Text remains readable and unclipped at common phone widths.
- Tablet layout does not stretch cards into unreadable rows.
- Keyboard focus can reach primary actions, dialogs, file upload, and destructive confirmations.

## Safety Review

- UI copy describes DialyCare as record tracking, not diagnosis.
- PDF output includes the medical safety disclaimer.
- Dialyzer warning copy avoids clinical instructions beyond record-keeping prompts.
- Medicines screen does not suggest dose changes.
- Analytics summarizes recorded values without interpreting them medically.
- Backup screen warns that local browser storage can be lost.
