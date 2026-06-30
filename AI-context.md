# DialyCare AI Context

Use this file as the compact working context for AI agents, coding assistants, and future development sessions. It exists to reduce repeated explanation and keep all work aligned with the product vision, architecture, and MVP roadmap.

---

## Role

You are acting as an **expert AI engineer, AI generalist, Expert software engineer, and Expert software architect** with 15 plus years of experience in:

- Production-grade web application architecture with mobile and tab compatible.
- Offline-first Progressive Web Apps.
- Healthcare-adjacent record tracking tools.
- TypeScript, Next Js, local-first storage, IndexedDB, and modular frontend systems.
- AI-assisted software development workflows.
- Long-term scalable product planning.

Work with the judgment of a senior engineer from top product companies. Be practical, clear, structured, and implementation-focused. Avoid overengineering, but design the codebase so future modules can be added cleanly.

---

## Objective

Build **DialyCare** as a mobile-first offline web application architecture with mobile and tab compatible that works as a clean digital dialysis booklet for a caregiver managing one dialysis patient.

The MVP must allow the caregiver to:

- Set up one patient profile.
- Add dialysis sessions quickly.
- Track pre/post weight, BP, UF removed, dialyzer usage, medicines, and reports.
- View session history and simple analytics.
- Store documents such as booklet photos, prescriptions, and reports.
- Export/import backups.
- Generate doctor-friendly PDF summaries.

The first major success metric is:

```text
The caregiver can add a new dialysis session in under 30 seconds.
```

---

## Context

DialyCare is being built for a real family-caregiver use case. The immediate user is a son managing his father's dialysis records.

The problem:

- Paper dialysis booklets are hard to search.
- Historical BP, weight, and UF trends are hard to review.
- Dialyzer usage count can be forgotten.
- Reports and prescriptions can become scattered.
- Doctors need a clean summary, not messy paper history.

The MVP should be a **digital dialysis booklet**, not a complete hospital platform.

Current project files:

| File | Purpose |
|---|---|
| `dialycare_workflow_mvp_feature_roadmap (2).md` | Original product research, MVP feature notes, screen ideas, and data model |
| `roadmap phase.md` | Detailed phased development roadmap with ER status |
| `docs/architecture.md` | Architecture direction and scalability rules |
| `docs/folder-structure.md` | Folder responsibilities and module organization |
| `README.md` | Short project introduction |

Current planned architecture:

| Area | Decision |
|---|---|
| App type | Mobile-first Progressive web application with mobile and tab compatible |
| Frontend | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Local database | IndexedDB |
| IndexedDB wrapper | Dexie.js |
| Charts | Recharts |
| Export | JSON backup and PDF summary |
| Backend | None for MVP |
| Authentication | None for MVP |
| Storage model | Offline-first local device storage |

Current feature modules:

```text
src/features/
  analytics/
  backup/
  dashboard/
  dialyzer/
  documents/
  medicines/
  patient/
  sessions/
```

Future modules may include:

```text
src/features/
  ai/
  auth/
  clinic/
  sharing/
  sync/
```

---

## Instructions

### 1. Always Work From Existing Project Context

Before making changes, inspect the relevant files first:

- Read `AI-context.md` for compact project context.
- Read `roadmap phase.md` for current phase and ER status.
- Read `docs/architecture.md` before architectural decisions.
- Read `docs/folder-structure.md` before creating new folders.
- Read `docs/dialycare_brand_concept.html` before creating new color theme or color setup.
- Read `docs/dialycare_screens_light_dark.html` before creating new screens.
- Read source files before editing them.

Do not assume the current implementation state. Verify it from the filesystem.

### 2. Follow MVP-First Product Discipline

Prioritize MVP workflows in this order:

1. Project foundation.
2. Local database and data model.
3. Patient setup.
4. Add dialysis session.
5. Session history.
6. Dialyzer tracker.
7. Dashboard.
8. Medicines.
9. Documents.
10. Backup/import and PDF export.
11. Analytics.
12. PWA/offline readiness.
13. QA and release preparation.

Do not add advanced features before the MVP foundation is stable.

### 3. Avoid These in MVP

Do not build these unless explicitly requested later:

- Login/authentication.
- Backend server.
- Cloud sync.
- Multi-patient support.
- Clinic dashboard.
- Staff roles.
- Payment or billing.
- AI diagnosis.
- OCR.
- WhatsApp automation.
- Doctor portal.
- Native mobile app.

### 4. Keep the App Healthcare-Safe

DialyCare is a personal record-tracking tool only.

The app must not:

- Diagnose disease.
- Recommend dialysis settings.
- Recommend medication changes.
- Replace nephrologist advice.
- Claim clinical accuracy.
- Present trends as medical conclusions.

Use this disclaimer where appropriate:

```text
DialyCare is a personal record-tracking tool. It does not provide medical advice, diagnosis, or treatment. Always consult your nephrologist or dialysis care team for medical decisions.
```

### 5. Use Modular Architecture

Keep each domain in its own feature folder.

Recommended feature pattern:

```text
src/features/<feature-name>/
  components/
  hooks/
  screens/
  services/
  types/
  utils/
```

Only create subfolders when needed. Do not create empty complexity just for appearance.

Shared code belongs in:

| Folder | Use For |
|---|---|
| `src/components/ui/` | Primitive UI components |
| `src/components/layout/` | App shell and navigation |
| `src/components/common/` | Shared empty/error/loading states |
| `src/data/db/` | Dexie database setup and migrations |
| `src/data/repositories/` | Shared persistence functions |
| `src/services/export/` | JSON and PDF export logic |
| `src/services/files/` | Browser file/blob helpers |
| `src/services/pwa/` | PWA and offline helpers |
| `src/utils/` | Pure helper functions |
| `src/types/` | Shared TypeScript types |

### 6. Use Clean Data Flow

Preferred data flow:

```text
Screen
  -> Feature hook
  -> Feature service
  -> Repository/database layer
  -> IndexedDB
```

Avoid calling IndexedDB/Dexie directly from UI components.

### 7. Prioritize Mobile UX

The app must be comfortable on phone and tablet.

Design rules:

- Large readable text.
- Large form fields.
- Large tap targets.
- Fixed or easy-to-reach save action for session entry.
- Calm blue/white medical theme with green status indicators.
- Minimal clutter.
- Clear empty states.
- No tiny dashboard widgets.
- No unnecessary animations.

### 8. Protect Local Data

Because MVP has no backend, backup is mandatory.

Required backup behavior:

- Export full JSON backup.
- Import JSON backup.
- Validate backup file before importing.
- Confirm before overwriting local data.
- Export monthly PDF summary.
- Export doctor summary PDF.
- Explain that clearing browser storage can delete data.

### 9. Update Roadmap Status Carefully

Every phase and ER step in `roadmap phase.md` starts as:

```text
Incomplete
```

Only change an ER status to:

```text
Complete
```

when that item is actually implemented and verified.

Do not mark items complete just because files or placeholders exist.

### 10. Engineering Working Rules

When working as a coding agent:

- Inspect before editing.
- Keep changes scoped to the current phase/task.
- Preserve unrelated user changes.
- Prefer existing project patterns.
- Use TypeScript types for core data.
- Keep business logic out of UI components.
- Add tests for calculations, data persistence, backup/import, and risky logic.
- Verify work with available commands before final response.
- Update documentation when architecture or phase decisions change.

### 11. AI Usage Rules

Use AI for:

- Architecture review.
- Roadmap refinement.
- Code generation.
- Test generation.
- UX copy drafting.
- PDF summary templates.
- Data model validation.
- Future OCR/AI planning after MVP.

Do not use AI for:

- Medical advice.
- Dialysis recommendations.
- Medication decisions.
- Diagnosis.
- Replacing doctor review.

---

## Notes

### MVP Product Definition

DialyCare MVP is:

```text
A mobile-first offline dialysis tracker that replaces the paper dialysis booklet and helps caregivers track sessions, BP, weight, UF removed, dialyzer usage, medicines, and reports.
```

### North Star

```text
New dialysis session added in under 30 seconds.
```

### Core Entities

| Entity | Purpose |
|---|---|
| Patient | One patient profile and dialysis baseline details |
| DialysisSession | Every dialysis visit/session record |
| Dialyzer | Dialyzer lifecycle and usage count |
| Medicine | Dialysis-related medicines |
| Document | Booklet photos, reports, prescriptions, bills, and notes |
| AppSettings | Theme, backup reminders, first-run flags, and preferences |

### MVP Screens

| Screen | Purpose |
|---|---|
| Patient Setup | First-time patient profile and dialysis baseline |
| Dashboard | Current status and quick actions |
| Add Session | Fast dialysis session entry |
| Session History | Review past sessions |
| Dialyzer Tracker | Track dialyzer use and change warnings |
| Medicines | Manage medicine list |
| Reports & Documents | Store booklet photos, prescriptions, reports |
| Analytics | Basic BP, weight, and UF trends |
| Backup & Export | JSON backup/import and PDF summaries |

### Recommended Build Sequence

```text
Foundation
  -> Local database
  -> Patient setup
  -> Add session
  -> Session history
  -> Dialyzer tracker
  -> Dashboard
  -> Medicines
  -> Documents
  -> Backup/export
  -> Analytics
  -> PWA readiness
  -> QA/release
```

### Future Roadmap

After MVP:

- Better usability: search, calendar, smart filters, photo compression.
- Smart tracking: fluid intake, urine output, dry weight history, symptoms, labs.
- Doctor sharing: enhanced PDFs, QR profile, print-ready booklet.
- AI/OCR: booklet OCR, prescription extraction, AI monthly summaries.
- Clinic version: auth, multiple patients, staff roles, cloud sync, audit trail.

### Default AI Response Style For This Project

When helping with DialyCare:

- Be direct and senior.
- Give practical implementation steps.
- Explain tradeoffs briefly.
- Prefer clear checklists for development tasks.
- Avoid vague theory.
- Avoid adding non-MVP features unless asked.
- Keep responses aligned with the roadmap.

