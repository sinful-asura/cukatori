import { Component, ViewEncapsulation, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { formatQuickLog, parseQuickLog } from '@ascend-os/shared/nlp';
import type { MenuItem, MenuItemCommandEvent } from 'primeng/api';
import { Button } from 'primeng/button';
import { CommandMenu } from 'primeng/commandmenu';
import { Dialog } from 'primeng/dialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { CelebrationService } from '../../shared/ui/celebration-host/celebration.service';
import { QuickLogApi } from './quick-log.api';
import { QuickLogPaletteService } from './quick-log-palette.service';
import { SpeechToTextService } from './speech-to-text.service';

const EXAMPLES = [
  { label: 'Bench 100 kilos 8 reps', icon: 'pi pi-bolt' },
  { label: 'Bench 100 for 8, 100 for 7, 95 for 9', icon: 'pi pi-list' },
  { label: 'Spent 35 euros on lunch', icon: 'pi pi-wallet' },
  { label: 'Finished watching Dune', icon: 'pi pi-video' },
  { label: 'Read 20 pages', icon: 'pi pi-book' },
  { label: "Completed today's workout", icon: 'pi pi-check' },
];

@Component({
  selector: 'app-quick-log-command',
  imports: [FormsModule, Dialog, CommandMenu, IconField, InputIcon, InputText, Button],
  templateUrl: './quick-log-command.html',
  styleUrl: './quick-log-command.scss',
  encapsulation: ViewEncapsulation.None,
})
export class QuickLogCommand {
  private readonly palette = inject(QuickLogPaletteService);
  private readonly api = inject(QuickLogApi);
  private readonly speech = inject(SpeechToTextService);
  private readonly celebrations = inject(CelebrationService);

  readonly text = signal('');
  readonly busy = signal(false);
  readonly listening = this.speech.listening;
  readonly speechSupported = this.speech.supported;
  readonly visible = this.palette.open;

  readonly preview = computed(() => {
    const value = this.text().trim();
    if (!value) {
      return '';
    }
    return formatQuickLog(parseQuickLog(value));
  });

  readonly commands = computed<MenuItem[]>(() => {
    const draft = this.text().trim();
    const parsed = draft ? parseQuickLog(draft) : null;
    const logItem: MenuItem | null =
      draft && parsed
        ? {
            label: parsed.kind === 'unknown' ? `Log “${draft}”` : `Log · ${formatQuickLog(parsed)}`,
            icon: 'pi pi-send',
            styleClass: 'ql-log-item',
            command: () => {
              void this.submit();
            },
          }
        : null;

    const groups: MenuItem[] = [];
    if (logItem) {
      groups.push({ label: 'Log now', items: [logItem] });
    }
    groups.push({
      label: 'Examples',
      items: EXAMPLES.map((example) => ({
        label: example.label,
        icon: example.icon,
        command: (event: MenuItemCommandEvent) => {
          event.originalEvent?.preventDefault();
          this.text.set(example.label);
          void this.submit();
        },
      })),
    });
    return groups;
  });

  constructor() {
    effect(() => {
      if (this.palette.open()) {
        const seed = this.palette.draft();
        if (seed) {
          this.text.set(seed);
          this.palette.draft.set('');
        }
      }
    });
  }

  onVisibleChange(open: boolean): void {
    this.palette.open.set(open);
    if (!open) {
      this.speech.stop();
    }
  }

  onDraft(value: string): void {
    this.text.set(value);
  }

  keepExamples = (item: MenuItem, search: string): number => {
    if (!search.trim()) {
      return 1;
    }
    if (item.icon === 'pi pi-send') {
      return 100;
    }
    const hay = `${item.label ?? ''}`.toLowerCase();
    return hay.includes(search.toLowerCase()) ? 1 : 0;
  };

  toggleListen(): void {
    if (this.speech.listening()) {
      this.speech.stop();
      return;
    }
    this.speech.start(
      (transcript) => this.text.set(transcript),
      (message) => this.celebrations.info(message),
    );
  }

  onSelect(): void {
    // Item commands already run submit or fill.
  }

  async submit(): Promise<void> {
    const value = this.text().trim();
    if (!value || this.busy()) {
      return;
    }
    this.busy.set(true);
    this.api.submit(value).subscribe({
      next: (res) => {
        this.celebrations.fromQuickLog(res.celebrations, res.preview);
        this.text.set('');
        this.palette.hide();
        this.busy.set(false);
      },
      error: () => {
        this.celebrations.info('Could not log that just now.');
        this.busy.set(false);
      },
    });
  }
}
