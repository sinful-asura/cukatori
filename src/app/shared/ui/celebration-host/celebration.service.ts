import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import type { CelebrationHint, CelebrationKind } from '@ascend-os/shared/nlp';

const TOAST_KEY = 'celebration';

const ICONS: Record<CelebrationKind, string> = {
  personal_record: 'pi pi-star',
  first_workout: 'pi pi-flag',
  tenth_workout: 'pi pi-check',
  streak_7: 'pi pi-calendar',
  level_up: 'pi pi-arrow-up',
};

@Injectable({ providedIn: 'root' })
export class CelebrationService {
  private readonly messages = inject(MessageService);

  celebrate(hint: CelebrationHint): void {
    this.messages.add({
      key: TOAST_KEY,
      severity: 'success',
      summary: hint.title,
      detail: hint.detail,
      icon: ICONS[hint.kind] ?? 'pi pi-check',
      styleClass: 'pos-celeb-message',
      life: 4200,
    });
  }

  fromQuickLog(hints: CelebrationHint[], preview?: string): void {
    if (!hints.length && preview) {
      this.messages.add({
        key: TOAST_KEY,
        severity: 'success',
        summary: 'Logged',
        detail: preview,
        icon: 'pi pi-check',
        styleClass: 'pos-celeb-message',
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
      key: TOAST_KEY,
      severity: 'info',
      summary: 'Quick log',
      detail,
      icon: 'pi pi-info-circle',
      styleClass: 'pos-celeb-message',
      life: 3200,
    });
  }
}
