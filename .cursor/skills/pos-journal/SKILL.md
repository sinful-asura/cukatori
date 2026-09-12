---
name: pos-journal
description: Implements encrypted journal entries with client-side AES-GCM. Use when implementing the journal scenario or A private space card.
---

# Journal

Project skill only. Allowed: `api/src/modules/journal/**`, `src/app/features/journal/**`, `src/app/core/api/journal.api.ts`, `shared/journal/**`.

## Privacy

- Angular encrypts body with Web Crypto AES-GCM before `POST`. Store `ciphertext` + `iv` only. Never log plaintext.
- `GET` returns ciphertext; decrypt in the client after passphrase.
- Tags and title may be plaintext for list UI. Emit `JOURNAL_CREATED` with **no body** in payload (15 XP).

## UI

Port `personal-os/modules/JournalView.tsx` onto PrimeNG (`Tabs`, `Textarea`, `InputText`, `Dialog`, `FileUpload`, `Tag`). `app-page-header` title Journal, kicker `Write it down while it’s still clear.` Keep ciphertext + IV. Export `journal.routes.ts`.

Hedged fitness language if discomfort tags appear. Not medical.

## Do not

- Put a passphrase in git or seed plaintext bodies in the API.
- Edit hotspots.
