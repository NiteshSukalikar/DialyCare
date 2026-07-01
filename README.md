# DialyCare

DialyCare is a mobile-first offline web application for tracking dialysis sessions, dialyzer usage, medicines, reports, and backups.

The project is structured for an MVP first, with room to scale into future modules such as analytics, doctor sharing, AI/OCR, and clinic workflows.

## Development

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000` or the localhost URL printed by Next.js.

On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm.ps1`.

## Verification

```bash
npm.cmd test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Manual MVP release checks live in `docs/mvp-qa-checklist.md`, and release scope/limitations live in `docs/mvp-release-notes.md`.
