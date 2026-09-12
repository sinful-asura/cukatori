import { DatePipe } from '@angular/common';
import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { JournalEntryDto, JournalPlaintext } from '@ascend-os/shared/journal';
import { MessageService } from 'primeng/api';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { FileUpload } from 'primeng/fileupload';
import { InputPassword } from 'primeng/inputpassword';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Tag } from 'primeng/tag';
import { Textarea } from 'primeng/textarea';
import type { FileSelectEvent } from 'primeng/types/fileupload';
import { firstValueFrom } from 'rxjs';
import { JournalApi } from '../../core/api/journal.api';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { JournalCrypto } from './journal-crypto';
import {
  JOURNAL_DEMO_DRAFTS,
  JOURNAL_WEEK_STUB,
  discomfortNote,
  entryExcerpt,
  tagSeverity,
} from './journal-demo';

type JournalView = JournalEntryDto & {
  plain?: JournalPlaintext;
  imageUrl?: string;
  decryptError?: boolean;
};

@Component({
  selector: 'app-journal-page',
  imports: [
    DatePipe,
    FormsModule,
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionPanel,
    Button,
    Card,
    Dialog,
    FileUpload,
    InputPassword,
    InputText,
    Message,
    PageHeader,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Tag,
    Textarea,
  ],
  templateUrl: './journal-page.html',
  styleUrl: './journal-page.scss',
})
export class JournalPage implements OnDestroy {
  private readonly api = inject(JournalApi);
  private readonly messages = inject(MessageService);
  readonly crypto = inject(JournalCrypto);

  readonly tagSeverity = tagSeverity;
  readonly discomfortNote = discomfortNote;
  readonly week = JOURNAL_WEEK_STUB;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly unlocking = signal(false);
  readonly error = signal<string | null>(null);
  readonly vaultConfigured = signal(false);
  readonly unlockOpen = signal(false);
  readonly composeOpen = signal(false);
  readonly tab = signal('entries');
  readonly search = signal('');
  readonly entries = signal<JournalView[]>([]);
  readonly selectedId = signal<string | null>(null);

  passphrase = '';
  confirmPassphrase = '';
  unlockError = '';
  draftTitle = '';
  draftTags = '';
  draftBody = '';
  draftImage: JournalPlaintext['image'] | null = null;
  draftImageName = '';

  readonly filtered = computed(() => {
    const needle = this.search().trim().toLowerCase();
    const rows = this.entries();
    if (!needle) {
      return rows;
    }
    return rows.filter((entry) => {
      const titleHit = entry.title.toLowerCase().includes(needle);
      const tagHit = entry.tags.some((tag) => tag.toLowerCase().includes(needle));
      const bodyHit = entry.plain?.body.toLowerCase().includes(needle) ?? false;
      return titleHit || tagHit || bodyHit;
    });
  });

  readonly selected = computed(() => {
    const id = this.selectedId();
    return this.filtered().find((entry) => entry.id === id) ?? this.filtered()[0] ?? null;
  });

  constructor() {
    void this.boot();
  }

  ngOnDestroy(): void {
    this.crypto.lock();
  }

  onTab(value: string | number | undefined): void {
    if (value != null) {
      this.tab.set(String(value));
    }
  }

  excerpt(entry: JournalView): string {
    if (!entry.plain?.body) {
      return '';
    }
    return entryExcerpt(entry.plain.body);
  }

  openUnlock(): void {
    this.unlockError = '';
    this.passphrase = '';
    this.confirmPassphrase = '';
    this.unlockOpen.set(true);
  }

  openCompose(): void {
    if (!this.crypto.unlocked()) {
      this.openUnlock();
      return;
    }
    this.draftTitle = '';
    this.draftTags = '';
    this.draftBody = '';
    this.draftImage = null;
    this.draftImageName = '';
    this.composeOpen.set(true);
  }

  onImageSelect(event: FileSelectEvent): void {
    const file = Array.from(event.files)[0];
    if (!file) {
      return;
    }
    if (file.size > 1_500_000) {
      this.messages.add({
        severity: 'warn',
        summary: 'Image too large',
        detail: 'Keep journal images under 1.5 MB.',
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? '');
      const comma = result.indexOf(',');
      this.draftImage = {
        mime: file.type || 'image/jpeg',
        data: comma >= 0 ? result.slice(comma + 1) : result,
      };
      this.draftImageName = file.name;
    };
    reader.readAsDataURL(file);
  }

  clearImage(): void {
    this.draftImage = null;
    this.draftImageName = '';
  }

  select(id: string): void {
    this.selectedId.set(id);
  }

  async submitUnlock(): Promise<void> {
    const passphrase = this.passphrase;
    if (passphrase.length < 8) {
      this.unlockError = 'Use at least 8 characters.';
      return;
    }
    if (!this.vaultConfigured() && passphrase !== this.confirmPassphrase) {
      this.unlockError = 'Passphrases do not match.';
      return;
    }

    this.unlocking.set(true);
    this.unlockError = '';
    try {
      if (this.vaultConfigured()) {
        const vault = await firstValueFrom(this.api.vault());
        if (!vault.configured) {
          this.unlockError = 'Vault is not configured yet.';
          return;
        }
        const ok = await this.crypto.unlock(passphrase, vault.salt, vault.verifier, vault.verifierIv);
        if (!ok) {
          this.unlockError = 'That passphrase did not unlock this journal.';
          return;
        }
      } else {
        const created = await this.crypto.createVault(passphrase);
        await firstValueFrom(this.api.createVault(created));
        this.vaultConfigured.set(true);
      }
      this.unlockOpen.set(false);
      this.passphrase = '';
      this.confirmPassphrase = '';
      await this.decryptLoaded();
      if (this.entries().length === 0) {
        await this.seedDemo();
      }
    } catch {
      this.unlockError = 'Could not unlock the journal right now.';
    } finally {
      this.unlocking.set(false);
    }
  }

  async saveEntry(): Promise<void> {
    if (!this.crypto.unlocked()) {
      this.openUnlock();
      return;
    }
    const title = this.draftTitle.trim();
    if (!title || !this.draftBody.trim()) {
      this.messages.add({
        severity: 'warn',
        summary: 'Missing fields',
        detail: 'Add a title and a few words before saving.',
      });
      return;
    }

    this.saving.set(true);
    try {
      const plain: JournalPlaintext = {
        body: this.draftBody,
        image: this.draftImage ?? undefined,
      };
      const sealed = await this.crypto.encrypt(plain);
      const created = await firstValueFrom(
        this.api.create({
          title,
          tags: this.draftTags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
          ciphertext: sealed.ciphertext,
          iv: sealed.iv,
        }),
      );
      const view = await this.toView(created);
      this.entries.update((rows) => [view, ...rows]);
      this.selectedId.set(view.id);
      this.composeOpen.set(false);
      this.messages.add({
        severity: 'success',
        summary: 'Entry saved',
        detail: '+15 XP',
      });
    } catch {
      this.messages.add({
        severity: 'error',
        summary: 'Save failed',
        detail: 'The entry was not stored.',
      });
    } finally {
      this.saving.set(false);
    }
  }

  private async boot(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const [vault, rows] = await Promise.all([
        firstValueFrom(this.api.vault()),
        firstValueFrom(this.api.list()),
      ]);
      this.vaultConfigured.set(vault.configured);
      const views = rows.map((row) => ({ ...row }) satisfies JournalView);
      this.entries.set(views);
      this.selectedId.set(views[0]?.id ?? null);
      this.unlockOpen.set(true);
    } catch {
      this.error.set('Journal API is not wired yet. Import JournalModule — see INTEGRATION.md.');
    } finally {
      this.loading.set(false);
    }
  }

  private async decryptLoaded(): Promise<void> {
    const next: JournalView[] = [];
    for (const entry of this.entries()) {
      next.push(await this.toView(entry));
    }
    this.entries.set(next);
  }

  private async seedDemo(): Promise<void> {
    const created: JournalView[] = [];
    for (const draft of JOURNAL_DEMO_DRAFTS) {
      const sealed = await this.crypto.encrypt(draft.plain);
      const row = await firstValueFrom(
        this.api.create({
          title: draft.title,
          tags: draft.tags,
          ciphertext: sealed.ciphertext,
          iv: sealed.iv,
          createdAt: draft.createdAt,
        }),
      );
      created.push(await this.toView(row, draft.plain));
    }
    created.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    this.entries.set(created);
    this.selectedId.set(created[0]?.id ?? null);
  }

  private async toView(entry: JournalEntryDto, known?: JournalPlaintext): Promise<JournalView> {
    if (!this.crypto.unlocked()) {
      return { ...entry };
    }
    if (known) {
      return {
        ...entry,
        plain: known,
        imageUrl: known.image ? `data:${known.image.mime};base64,${known.image.data}` : undefined,
      };
    }
    try {
      const plain = await this.crypto.decrypt(entry.ciphertext, entry.iv);
      return {
        ...entry,
        plain,
        imageUrl: plain.image ? `data:${plain.image.mime};base64,${plain.image.data}` : undefined,
      };
    } catch {
      return { ...entry, decryptError: true };
    }
  }
}
