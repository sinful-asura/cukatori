import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import type { CelebrationHint } from '@ascend-os/shared/nlp';

@Injectable({ providedIn: 'root' })
export class CelebrationService {
  private readonly messages = inject(MessageService);

  celebrate(hint: CelebrationHint): void {
    this.messages.add({
      severity: 'success',
      summary: hint.title,
      detail: hint.detail,
      life: 4200,
    });
  }

  fromQuickLog(hints: CelebrationHint[], preview?: string): void {
    if (!hints.length && preview) {
      this.messages.add({
        severity: 'success',
        summary: 'Logged',
        detail: preview,
        life: 2800,
      });
      return;
    }
    for (const hint of hints) {
      this.celebrate(hint);
    }
  }

  info(detail: string): void {
    this.messages.add({
      severity: 'info',
      summary: 'Quick log',
      detail,
      life: 3200,
    });
  }
}
