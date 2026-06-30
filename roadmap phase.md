# DialyCare MVP Development Roadmap

## Product Goal

Build **DialyCare** as a mobile-first offline web application that works like a clean digital dialysis booklet for one caregiver managing one dialysis patient.

The MVP must help the caregiver:

- Set up one patient profile.
- Add dialysis sessions in under 30 seconds.
- Track pre/post weight, BP, UF removed, dialyzer use, medicines, and reports.
- Review session history and basic trends.
- Export/import local backup data.
- Generate doctor-friendly summaries.

## MVP Architecture Direction

| Area | Decision | ER Status |
|---|---|---|
| Application type | Mobile-first Progressive Web App | Incomplete |
| Frontend | React / Next.js or Vite React | Complete |
| Styling | Tailwind CSS with clean medical theme | Complete |
| Component style | Simple reusable UI components, ShadCN-style patterns optional | Complete |
| Local database | IndexedDB via Dexie.js | Complete |
| Charts | Recharts | Incomplete |
| Export | JSON backup, PDF summary using jsPDF or pdfmake | Complete |
| Storage model | Offline-first local device storage | Complete |
| Authentication | No login for MVP | Incomplete |
| Backend | No backend for MVP | Incomplete |

## MVP Scope Rules

| Rule | Description | ER Status |
|---|---|---|
| Build a digital dialysis booklet first | Focus on repeated dialysis record entry and review | Incomplete |
| Keep one-patient flow | Avoid multi-patient complexity in MVP | Incomplete |
| Keep offline-first | Data should work without internet | Incomplete |
| Add backup from day one | Export/import must be treated as a safety feature | Complete |
| Avoid diagnosis | App must not provide medical decisions or treatment advice | Incomplete |
| Avoid AI in MVP | OCR, AI summaries, and abnormal trend explanations come later | Incomplete |
| Avoid clinic SaaS features | No staff roles, billing, audit trail, cloud sync, or clinic dashboard in MVP | Incomplete |

---

# Phase 1: Project Foundation & Product Skeleton

## Objective

Create the technical foundation for a reliable mobile-first offline PWA.

## Deliverables

| ER Step | Task | Acceptance Criteria | ER Status |
|---|---|---|---|
| 1.1 | Initialize web application project | App runs locally in browser without errors | Complete |
| 1.2 | Configure TypeScript | Strict enough to protect data model mistakes | Complete |
| 1.3 | Configure Tailwind CSS | Base theme, spacing, typography, and responsive utilities work | Complete |
| 1.4 | Add app layout shell | Mobile-first layout with header, main content, and bottom navigation | Complete |
| 1.5 | Define routes/screens | Dashboard, patient setup, add session, history, dialyzer, medicines, documents, analytics, backup | Complete |
| 1.6 | Add reusable UI components | Buttons, inputs, cards, dialogs, tabs, empty states, status badges | Complete |
| 1.7 | Add design tokens | Blue/white medical theme with green status indicators | Complete |
| 1.8 | Add medical safety disclaimer location | Disclaimer available in settings/about/export footer | Complete |
| 1.9 | Add basic error boundary | User sees recoverable error state instead of blank screen | Complete |
| 1.10 | Add empty/loading states | Every main screen has clean empty and loading state | Complete |

## Engineering Notes

- Keep visual design calm, clean, and elderly-friendly.
- Avoid heavy animations, dark default UI, tiny text, and overloaded dashboards.
- Optimize first for phone and tablet usage.

---

# Phase 2: Local Database & Core Data Model

## Objective

Create a durable IndexedDB data layer for all MVP entities.

## Deliverables

| ER Step | Task | Acceptance Criteria | ER Status |
|---|---|---|---|
| 2.1 | Install and configure Dexie.js | IndexedDB database opens and persists records locally | Complete |
| 2.2 | Define Patient entity | Patient profile fields match MVP requirements | Complete |
| 2.3 | Define DialysisSession entity | Session fields include date, time, weights, BP, UF, dialyzer, remarks | Complete |
| 2.4 | Define Dialyzer entity | Dialyzer name, start date, max usage, current usage, status supported | Complete |
| 2.5 | Define Medicine entity | Medicine name, dose, frequency, timing, dates, notes supported | Complete |
| 2.6 | Define Document entity | Document title, category, file type, date, notes, file/blob reference supported | Complete |
| 2.7 | Add database versioning | Future schema changes can be migrated safely | Complete |
| 2.8 | Add repository/service layer | UI reads/writes through typed data functions, not raw Dexie calls everywhere | Complete |
| 2.9 | Add seed/demo data utility | Developer can load sample patient/session data for testing | Complete |
| 2.10 | Add local data validation | Required fields and numeric ranges are validated before save | Complete |

## Core Entities

| Entity | Purpose | ER Status |
|---|---|---|
| Patient | Stores one patient profile and dialysis baseline details | Complete |
| DialysisSession | Stores every dialysis session record | Complete |
| Dialyzer | Tracks dialyzer lifecycle and usage count | Complete |
| Medicine | Tracks dialysis-related medicines | Complete |
| Document | Stores booklet photos, prescriptions, reports, bills, and notes | Complete |
| AppSettings | Stores backup reminder settings, theme preferences, and first-run flags | Complete |

---

# Phase 3: Patient Setup & First-Time Workflow

## Objective

Allow the caregiver to set up the patient once and start tracking immediately.

## Deliverables

| ER Step | Task | Acceptance Criteria | ER Status |
|---|---|---|---|
| 3.1 | Build welcome/setup screen | First launch sends user to setup if no patient exists | Complete |
| 3.2 | Add patient profile form | Name, UHID, age, gender, hospital, consultant, emergency contact captured | Complete |
| 3.3 | Add dialysis baseline form | Dry weight, dialysis frequency, default hospital, default doctor captured | Complete |
| 3.4 | Add initial dialyzer setup | Current dialyzer name, start date, max usage, current usage captured | Complete |
| 3.5 | Add form validation | Required fields cannot be saved empty | Complete |
| 3.6 | Save patient locally | Patient data persists after browser refresh | Complete |
| 3.7 | Add edit patient profile | User can update patient details after setup | Complete |
| 3.8 | Add setup completion redirect | After setup, user lands on dashboard | Complete |
| 3.9 | Add setup success state | User receives clear confirmation that setup is complete | Complete |

## Success Metric

| Metric | Target | ER Status |
|---|---|---|
| Patient setup time | Under 2 minutes | Incomplete |

---

# Phase 4: Add Dialysis Session

## Objective

Build the fastest and most important MVP workflow: adding a dialysis session.

## Deliverables

| ER Step | Task | Acceptance Criteria | ER Status |
|---|---|---|---|
| 4.1 | Build add session screen | Accessible from dashboard and bottom navigation | Complete |
| 4.2 | Add required fields | Date, session time, pre/post weight, pre/post BP, UF removed, dialyzer, remarks | Complete |
| 4.3 | Add optional fields | Hospital, doctor, complications, injections, medicine changes, machine notes | Complete |
| 4.4 | Add numeric input UX | Large mobile-friendly numeric inputs for weight, BP, and UF | Complete |
| 4.5 | Add smart calculations | Weight loss and weight gain vs dry weight auto-calculate | Complete |
| 4.6 | Auto-increment dialyzer usage | Saving session increments active dialyzer usage count | Complete |
| 4.7 | Add dialyzer usage confirmation | User can confirm or adjust usage number before saving | Complete |
| 4.8 | Add validation rules | Prevent invalid weights, BP values, negative UF, missing date | Complete |
| 4.9 | Add fixed mobile save action | Save button remains easy to reach on mobile | Complete |
| 4.10 | Save session locally | New session persists and appears in history | Complete |
| 4.11 | Update dashboard after save | Latest weight, last dialysis date, and dialyzer usage refresh automatically | Complete |
| 4.12 | Add edit session | User can correct mistakes in previous entries | Complete |
| 4.13 | Add delete session with confirmation | User can remove an incorrect entry after explicit confirmation | Complete |

## Success Metric

| Metric | Target | ER Status |
|---|---|---|
| New session entry time | Under 30 seconds for common fields | Incomplete |

---

# Phase 5: Home Dashboard

## Objective

Show the caregiver the most important current status at a glance.

## Deliverables

| ER Step | Task | Acceptance Criteria | ER Status |
|---|---|---|---|
| 5.1 | Build dashboard patient header | Shows greeting, patient name, and last dialysis date | Complete |
| 5.2 | Add current weight card | Shows latest post-HD or latest relevant weight | Complete |
| 5.3 | Add dry weight card | Shows configured dry weight | Complete |
| 5.4 | Add weight difference card | Shows latest pre-HD weight minus dry weight | Complete |
| 5.5 | Add current dialyzer card | Shows active dialyzer name and usage count | Complete |
| 5.6 | Add dialyzer warning state | Warning near max usage and change recommended at max usage | Complete |
| 5.7 | Add next dialysis card | Estimates next session based on frequency or manually configured schedule | Complete |
| 5.8 | Add quick actions | Add Session, Add Report, Add Medicine, Export Backup | Complete |
| 5.9 | Add recent session preview | Shows most recent session summary | Complete |
| 5.10 | Add empty dashboard state | New users see clear next action after setup | Complete |

---

# Phase 6: Session History

## Objective

Make past dialysis records easy to review, search visually, and open in detail.

## Deliverables

| ER Step | Task | Acceptance Criteria | ER Status |
|---|---|---|---|
| 6.1 | Build session history screen | Lists all saved dialysis sessions | Complete |
| 6.2 | Add timeline-style session cards | Cards show date, weight change, UF, BP, dialyzer use, remarks | Complete |
| 6.3 | Add monthly grouping | Sessions are grouped by month | Complete |
| 6.4 | Add filters | This week, this month, last 3 months, custom date | Complete |
| 6.5 | Add session detail view | Tapping a card opens full details | Complete |
| 6.6 | Add edit action from detail | Existing session can be updated from detail screen | Complete |
| 6.7 | Add delete action from detail | Existing session can be deleted after confirmation | Complete |
| 6.8 | Add empty filtered state | User sees helpful message if no sessions match filter | Complete |
| 6.9 | Add stable sorting | Newest sessions appear first by default | Complete |

---

# Phase 7: Dialyzer Tracker

## Objective

Help the caregiver avoid missing dialyzer change timing.

## Deliverables

| ER Step | Task | Acceptance Criteria | ER Status |
|---|---|---|---|
| 7.1 | Build dialyzer tracker screen | Shows current active dialyzer and historical dialyzers | Complete |
| 7.2 | Add dialyzer form | Name, start date, max usage, current usage, status captured | Complete |
| 7.3 | Add usage progress indicator | Shows current usage as count and progress bar | Complete |
| 7.4 | Add warning threshold | Warning appears at 10/12 or configurable near-limit usage | Complete |
| 7.5 | Add change recommended state | Clear alert appears when max usage is reached | Complete |
| 7.6 | Add change dialyzer workflow | Old dialyzer becomes archived and new one becomes active | Complete |
| 7.7 | Link sessions to dialyzer | Session records preserve which dialyzer was used | Complete |
| 7.8 | Add dialyzer history | Archived dialyzers remain viewable | Complete |

---

# Phase 8: Medicines

## Objective

Track dialysis-related medicines in a simple list.

## Deliverables

| ER Step | Task | Acceptance Criteria | ER Status |
|---|---|---|---|
| 8.1 | Build medicine list screen | Shows active and past medicines | Complete |
| 8.2 | Add medicine form | Name, dosage, frequency, timing, start/end date, instructions, doctor notes | Complete |
| 8.3 | Add active/inactive status | Medicines can be marked active or stopped | Complete |
| 8.4 | Add edit medicine | Existing medicine can be updated | Complete |
| 8.5 | Add delete medicine | Medicine can be deleted after confirmation | Complete |
| 8.6 | Show medicines in export | Active medicines appear in doctor summary PDF | Complete |

## MVP Constraint

| Constraint | Reason | ER Status |
|---|---|---|
| No reminders in MVP | Keeps first release simple and avoids notification complexity | Complete |

---

# Phase 9: Reports & Documents

## Objective

Store dialysis booklet photos, prescriptions, blood reports, hospital reports, bills, and notes locally.

## Deliverables

| ER Step | Task | Acceptance Criteria | ER Status |
|---|---|---|---|
| 9.1 | Build documents screen | Documents are grouped/listed clearly | Complete |
| 9.2 | Add upload flow | User can upload image, photo, or PDF from device | Complete |
| 9.3 | Add document metadata | Report name, date, category, notes captured | Complete |
| 9.4 | Add document categories | Dialysis Booklet, Prescription, Blood Report, KFT, CBC, Hospital Report, Bills, Other | Complete |
| 9.5 | Store file locally | File/blob is saved in IndexedDB or browser-safe local storage strategy | Complete |
| 9.6 | Add preview/open action | User can view uploaded images/PDFs | Complete |
| 9.7 | Add edit metadata | Document title, date, category, and notes can be changed | Complete |
| 9.8 | Add delete document | Document can be deleted after confirmation | Complete |
| 9.9 | Add storage warning note | User understands large files use local device storage | Complete |

## MVP Constraint

| Constraint | Reason | ER Status |
|---|---|---|
| No OCR in MVP | Manual upload is enough for first release | Complete |

---

# Phase 10: Analytics & Trends

## Objective

Provide simple visual trends that help the caregiver and doctor understand patterns.

## Deliverables

| ER Step | Task | Acceptance Criteria | ER Status |
|---|---|---|---|
| 10.1 | Build analytics screen | Screen loads summary cards and charts from session data | Incomplete |
| 10.2 | Add date range filter | User can view this month, last 3 months, or custom range | Incomplete |
| 10.3 | Add pre-HD weight trend | Chart shows pre-HD weight over time | Incomplete |
| 10.4 | Add post-HD weight trend | Chart shows post-HD weight over time | Incomplete |
| 10.5 | Add UF removed trend | Chart shows UF removed over time | Incomplete |
| 10.6 | Add pre-HD BP trend | Chart shows systolic/diastolic pre-HD BP over time | Incomplete |
| 10.7 | Add post-HD BP trend | Chart shows systolic/diastolic post-HD BP over time | Incomplete |
| 10.8 | Add summary cards | Average UF, average BP, average weight gain, highest UF, lowest post-HD BP | Incomplete |
| 10.9 | Add chart empty states | Clear message appears when there is not enough data | Incomplete |

## MVP Constraint

| Constraint | Reason | ER Status |
|---|---|---|
| No complex medical interpretation | Charts are for record review, not diagnosis | Incomplete |

---

# Phase 11: Backup, Import & PDF Export

## Objective

Protect local data and make records shareable with doctors.

## Deliverables

| ER Step | Task | Acceptance Criteria | ER Status |
|---|---|---|---|
| 11.1 | Build backup/export screen | User sees JSON backup, import, and PDF export options | Complete |
| 11.2 | Export full JSON backup | Patient, sessions, dialyzers, medicines, documents metadata, settings included | Complete |
| 11.3 | Import JSON backup | Valid backup restores data locally | Complete |
| 11.4 | Add import validation | Invalid backup files are rejected safely with clear error | Complete |
| 11.5 | Add overwrite confirmation | User confirms before import replaces existing data | Complete |
| 11.6 | Export monthly PDF summary | User can generate PDF for selected month | Complete |
| 11.7 | Export doctor summary PDF | PDF includes patient info, session table, BP/weight trend, dialyzer usage, medicines, report index | Complete |
| 11.8 | Add safety disclaimer to PDFs | PDF states app is record tracking only, not medical advice | Complete |
| 11.9 | Add manual backup reminder setting | User can configure visible reminder to export backup periodically | Complete |
| 11.10 | Test restore flow | Exported backup can be imported into fresh browser data successfully | Complete |

## Mandatory MVP Safety Feature

| Safety Feature | Reason | ER Status |
|---|---|---|
| JSON backup and import | Prevents total data loss if browser storage is cleared | Complete |
| PDF summary | Makes doctor sharing possible without app access | Complete |

---

# Phase 12: PWA, Offline Readiness & Installability

## Objective

Make the app installable and reliable for phone/tablet usage.

## Deliverables

| ER Step | Task | Acceptance Criteria | ER Status |
|---|---|---|---|
| 12.1 | Add PWA manifest | App has name, icons, theme color, and display mode | Incomplete |
| 12.2 | Add service worker | App shell loads offline after first visit | Incomplete |
| 12.3 | Add install metadata | Browser supports install/add-to-home-screen where available | Incomplete |
| 12.4 | Add offline state handling | App shows helpful message if network-dependent action is unavailable | Incomplete |
| 12.5 | Verify IndexedDB offline flow | Patient/session/document data works offline | Incomplete |
| 12.6 | Add app icons | Icons look professional on home screen | Incomplete |
| 12.7 | Test mobile viewport | Main flows work at common phone widths | Incomplete |
| 12.8 | Test tablet viewport | Layout remains readable and not stretched | Incomplete |

---

# Phase 13: Quality, Testing & Release Preparation

## Objective

Stabilize the MVP for real daily use.

## Deliverables

| ER Step | Task | Acceptance Criteria | ER Status |
|---|---|---|---|
| 13.1 | Add unit tests for calculations | Weight loss, dry-weight difference, averages, dialyzer thresholds tested | Incomplete |
| 13.2 | Add data service tests | CRUD flows for patient, sessions, dialyzer, medicines, documents tested | Incomplete |
| 13.3 | Add backup/import tests | Export and restore data integrity tested | Incomplete |
| 13.4 | Add manual QA checklist | First setup, add session, history, dialyzer, documents, export all covered | Incomplete |
| 13.5 | Run accessibility pass | Inputs have labels, contrast is acceptable, tap targets are large enough | Incomplete |
| 13.6 | Run responsive QA | Core screens tested on mobile and tablet widths | Incomplete |
| 13.7 | Run performance check | App loads quickly and session entry remains responsive | Incomplete |
| 13.8 | Validate no clinical claims | UI and PDF wording avoid diagnosis or treatment suggestions | Incomplete |
| 13.9 | Prepare MVP release notes | Known limitations and usage guidance documented | Incomplete |

---

# MVP Completion Checklist

The MVP is complete only when all of these are done.

| Area | Completion Requirement | ER Status |
|---|---|---|
| Patient setup | One patient can be created, edited, and persisted | Complete |
| Add session | Dialysis session can be added in under 30 seconds | Complete |
| History | Past sessions can be reviewed, filtered, opened, edited, and deleted | Complete |
| Dialyzer | Dialyzer usage increments and warns near limit | Complete |
| Medicines | Medicine list can be managed and exported | Complete |
| Documents | Reports/booklet images can be uploaded and reviewed locally | Complete |
| Dashboard | Latest patient, weight, dialyzer, and quick actions are visible | Complete |
| Analytics | Basic trends and summary cards are available | Incomplete |
| Backup | Full JSON export/import works reliably | Complete |
| PDF | Doctor/monthly PDF export works with disclaimer | Complete |
| PWA | App is installable and works offline after first load | Incomplete |
| Safety | App clearly states it is not medical advice | Incomplete |

---

# Post-MVP Roadmap

## Phase 14: Better Usability

| ER Step | Feature | Reason | ER Status |
|---|---|---|---|
| 14.1 | Search records | Quickly find old sessions, reports, or notes | Incomplete |
| 14.2 | Calendar view | Easier monthly review of dialysis schedule | Incomplete |
| 14.3 | Smart filters | Faster review by date range, high UF, BP ranges, dialyzer | Incomplete |
| 14.4 | Favorite reports | Quickly access important prescriptions or lab reports | Incomplete |
| 14.5 | Voice note remarks | Faster note capture after dialysis | Incomplete |
| 14.6 | Photo compression | Reduce local storage usage | Incomplete |
| 14.7 | Dark mode | Optional comfort feature, not default | Incomplete |
| 14.8 | UF variance calculation | Compare expected vs actual fluid removal | Incomplete |

## Phase 15: Smart Health Tracking

| ER Step | Feature | Reason | ER Status |
|---|---|---|---|
| 15.1 | Fluid intake tracker | Useful for dialysis patients after core workflow is stable | Incomplete |
| 15.2 | Daily urine output tracker | Adds kidney-care context beyond sessions | Incomplete |
| 15.3 | Dry weight history | Track changes in target dry weight over time | Incomplete |
| 15.4 | Symptoms log | Track cramps, dizziness, nausea, weakness after dialysis | Incomplete |
| 15.5 | Injection tracker | Track dialysis-related injections separately | Incomplete |
| 15.6 | Lab value tracker | Track creatinine, potassium, hemoglobin, urea, phosphorus | Incomplete |
| 15.7 | Lab normal range indicators | Show reference ranges without diagnosing | Incomplete |

## Phase 16: Doctor Sharing

| ER Step | Feature | Reason | ER Status |
|---|---|---|---|
| 16.1 | Enhanced doctor summary PDF | Better visit preparation and doctor review | Incomplete |
| 16.2 | QR code patient profile | Fast sharing of static patient summary | Incomplete |
| 16.3 | Read-only report package | Share selected date range safely | Incomplete |
| 16.4 | Print-ready booklet | Generate paper-like output for clinics | Incomplete |
| 16.5 | Visit preparation checklist | Help caregiver prepare questions and recent changes | Incomplete |

## Phase 17: AI & OCR

| ER Step | Feature | Reason | ER Status |
|---|---|---|---|
| 17.1 | OCR from booklet photos | Reduce manual data entry from old paper records | Incomplete |
| 17.2 | Auto-read BP and weight | Extract common dialysis booklet values | Incomplete |
| 17.3 | AI monthly summary | Summarize trends for caregiver review | Incomplete |
| 17.4 | AI questions for doctor | Suggest discussion points based on tracked data | Incomplete |
| 17.5 | AI prescription extraction | Convert prescription image into medicine list draft | Incomplete |
| 17.6 | AI abnormal trend explanation | Explain possible meaning carefully with medical-safety guardrails | Incomplete |

## Phase 18: Clinic Version

| ER Step | Feature | Reason | ER Status |
|---|---|---|---|
| 18.1 | Login/authentication | Required for multi-user clinic use | Incomplete |
| 18.2 | Multiple patients | Clinic staff need patient-wise records | Incomplete |
| 18.3 | Staff roles | Separate admin, nurse, doctor, viewer permissions | Incomplete |
| 18.4 | Clinic dashboard | Manage many patient sessions and upcoming dialysis schedules | Incomplete |
| 18.5 | Appointment scheduling | Support clinic operations | Incomplete |
| 18.6 | Cloud sync | Required for multiple devices and clinic continuity | Incomplete |
| 18.7 | Audit trail | Track who changed medical records and when | Incomplete |
| 18.8 | Doctor/nurse notes | Support clinical communication | Incomplete |
| 18.9 | Billing module | Optional only after operational workflows are validated | Incomplete |

---

# Recommended Build Order

| Build Order | Phase | Why It Comes Here | ER Status |
|---|---|---|---|
| 1 | Phase 1: Foundation | Needed before feature work | Incomplete |
| 2 | Phase 2: Local Database | Core app depends on durable local data | Complete |
| 3 | Phase 3: Patient Setup | Required before meaningful tracking | Complete |
| 4 | Phase 4: Add Dialysis Session | Main MVP workflow and north-star metric | Incomplete |
| 5 | Phase 6: Session History | Makes entered data useful immediately | Complete |
| 6 | Phase 7: Dialyzer Tracker | Critical dialysis-specific safety workflow | Complete |
| 7 | Phase 5: Dashboard | Better once real session/dialyzer data exists | Complete |
| 8 | Phase 8: Medicines | Important supporting record area | Incomplete |
| 9 | Phase 9: Reports & Documents | Replaces paper booklet storage | Complete |
| 10 | Phase 11: Backup & PDF Export | Mandatory before real-world daily use | Complete |
| 11 | Phase 10: Analytics & Trends | Useful after enough session data exists | Incomplete |
| 12 | Phase 12: PWA Readiness | Install/offline hardening for actual phone use | Incomplete |
| 13 | Phase 13: QA & Release | Stabilize before calling MVP complete | Incomplete |

---

# Definition of Done for Every ER Step

| Requirement | ER Status |
|---|---|
| Feature works on mobile viewport | Incomplete |
| Feature handles empty state | Incomplete |
| Feature handles invalid input or error state | Incomplete |
| Feature persists data after refresh when applicable | Incomplete |
| Feature does not break existing flows | Incomplete |
| Feature has clear labels and accessible controls | Incomplete |
| Feature follows medical safety positioning | Incomplete |
| Feature is manually tested before marking complete | Incomplete |
