# DialyCare Architecture

## Architecture Style

DialyCare should be built as a modular, offline-first web application.

The MVP should avoid backend, authentication, cloud sync, and clinic complexity. The codebase should still be organized so those capabilities can be added later without rewriting the core product.

## Recommended Stack

| Layer | Recommendation |
|---|---|
| App | React / Next.js or Vite React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Local database | IndexedDB |
| IndexedDB wrapper | Dexie.js |
| Charts | Recharts |
| PDF export | jsPDF or pdfmake |
| PWA | next-pwa or Vite PWA |

## Top-Level Structure

```text
DialyCare/
  docs/
  public/
  src/
    app/
    assets/
    components/
    config/
    data/
    features/
    hooks/
    lib/
    routes/
    services/
    styles/
    types/
    utils/
  tests/
```

## Main Design Principle

Feature modules should own their own screens, components, hooks, services, and types wherever possible.

Shared code should be placed in common folders only when it is genuinely reused by multiple features.

## Feature Module Pattern

```text
src/features/session/
  components/
  hooks/
  screens/
  services/
  types/
  utils/
```

Use this pattern for patient, dialysis sessions, dialyzer, medicines, documents, analytics, backup/export, and future modules.

## Data Flow

```text
Screen
  -> Feature hook
  -> Feature service
  -> Shared data/database layer
  -> IndexedDB
```

UI components should not directly call Dexie or IndexedDB. This keeps the app easier to test and easier to migrate later if cloud sync is added.

## Future Scalability

The structure supports future modules without disturbing MVP modules:

- `src/features/sharing/` for doctor sharing.
- `src/features/ai/` for OCR and AI summaries.
- `src/features/clinic/` for clinic dashboards and staff workflows.
- `src/features/auth/` for login when cloud/clinic mode is introduced.
- `src/features/sync/` for cloud sync later.

These should remain unused during MVP unless the scope changes.

