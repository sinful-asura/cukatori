import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class QuickLogPaletteService {
  readonly open = signal(false);
  readonly draft = signal('');

  show(seed = ''): void {
    if (seed) {
      this.draft.set(seed);
    }
    this.open.set(true);
  }

  hide(): void {
    this.open.set(false);
  }

  toggle(): void {
    this.open.update((value) => !value);
  }
}
