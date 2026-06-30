# Folder Structure

```text
DialyCare/
  README.md
  roadmap phase.md
  dialycare_workflow_mvp_feature_roadmap (2).md
  docs/
    architecture.md
    folder-structure.md
  public/
    icons/
    images/
  src/
    app/
    assets/
    components/
      common/
      layout/
      ui/
    config/
    data/
      db/
      repositories/
      seed/
    features/
      analytics/
      backup/
      dashboard/
      dialyzer/
      documents/
      medicines/
      patient/
      sessions/
    hooks/
    lib/
    routes/
    services/
      export/
      files/
      pwa/
    styles/
    types/
    utils/
  tests/
    e2e/
    fixtures/
    unit/
```

## Folder Responsibilities

| Folder | Responsibility |
|---|---|
| `docs/` | Product, architecture, implementation notes, and technical decisions |
| `public/` | Static files such as PWA icons, images, and manifest assets |
| `src/app/` | App bootstrap, providers, root layout, and app-wide composition |
| `src/assets/` | Source-controlled images, local icons, and visual assets used by code |
| `src/components/common/` | Shared non-domain components such as empty states and error states |
| `src/components/layout/` | App shell, navigation, headers, and page layouts |
| `src/components/ui/` | Reusable primitive UI components such as Button, Input, Card, Dialog |
| `src/config/` | App constants, theme config, feature flags, and environment config |
| `src/data/db/` | Dexie database setup, schema versions, and migrations |
| `src/data/repositories/` | Shared persistence functions used by features |
| `src/data/seed/` | Demo/sample data for development and testing |
| `src/features/` | Domain modules. Each major product area gets its own folder |
| `src/hooks/` | Shared reusable hooks used by more than one feature |
| `src/lib/` | Third-party library wrappers and integration helpers |
| `src/routes/` | Route definitions and route metadata |
| `src/services/export/` | PDF, JSON backup, and future CSV export services |
| `src/services/files/` | Browser file handling, blob handling, and document helpers |
| `src/services/pwa/` | Service worker, install, and offline helpers |
| `src/styles/` | Global styles and Tailwind entry files |
| `src/types/` | Shared TypeScript types used across multiple features |
| `src/utils/` | Pure utility functions such as formatting, calculations, and date helpers |
| `tests/` | Unit, fixture, and end-to-end test assets |

## Feature Folder Responsibilities

Each feature folder can grow using this structure:

```text
feature-name/
  components/
  hooks/
  screens/
  services/
  types/
  utils/
```

For small features, do not create every subfolder immediately. Add subfolders only when the feature needs them.

