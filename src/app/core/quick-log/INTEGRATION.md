# Assist — frontend integration

Do not edit hotspots from this scenario. Orchestrator wires the following.

## Drop-in chrome

Root `App` already has `<p-toast>` and `MessageService`. Add the host next to it:

```html
<p-toast position="top-right" />
<app-celebration-host />
<router-outlet />
```

```ts
import { CelebrationHost } from './shared/ui/celebration-host';
```

`CelebrationHost` mounts the quick-log `CommandMenu` and listens for Ctrl/⌘ K. Celebrations use the existing toast — no extra HUD.

## App shell search

The header search should open the same palette:

```ts
inject(QuickLogPaletteService).show();
```

Optional: pass the current input as `show(draft)`.

## Shared parser

Import from `@ascend-os/shared/nlp` (`parseQuickLog`, `formatQuickLog`). Do not add an export to `shared/index.ts` unless you want a barrel; the existing `@ascend-os/shared/*` path already resolves `shared/nlp`.
