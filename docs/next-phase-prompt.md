# Next Phase Prompt: Phase 6 Session History

Use this prompt to start the next DialyCare development session.

```text
You are working in S:\Other\DialyCare on DialyCare, a mobile-first offline Next.js/TypeScript dialysis record tracker.

Read these first:
- AI-context.md
- roadmap phase.md
- docs/architecture.md
- docs/folder-structure.md
- docs/dialycare_brand_concept.html
- docs/dialycare_screens_light_dark.html

Current state:
- Phase 1, Phase 2, Phase 3 are implemented.
- Phase 4 Add Dialysis Session is implemented and committed.
- A minimal real session history list exists because Phase 4 needed saved sessions to appear and support edit/delete.

Next phase:
Build Phase 6: Session History.

Scope:
- Keep the existing repository/service flow.
- Improve src/features/sessions/screens/history-screen.tsx without overbuilding.
- Add timeline-style session cards with clear date, weight change, UF, BP, dialyzer use, and remarks.
- Group sessions by month.
- Add filters: This week, This month, Last 3 months, and a simple custom date range.
- Add a session detail view or detail section that exposes full saved fields.
- Preserve edit and delete access through the existing add-session edit route.
- Add empty filtered states.
- Keep newest sessions first by default.
- Add focused tests for date filtering/grouping helpers if new logic is introduced.
- Update roadmap phase.md only for ER steps that are implemented and verified.

Verification before finishing:
- npm.cmd run typecheck
- npm.cmd run lint
- npm.cmd test
- npm.cmd run build

After completion:
- Clean up any temporary files.
- Commit the Phase 6 work.
- Create/update docs/next-phase-prompt.md for the following phase, which should be Phase 7 Dialyzer Tracker unless the roadmap changes.
```

