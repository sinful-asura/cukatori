import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ActivityBus } from '../activity/activity.bus.js';
import { User } from '../users/user.entity.js';
import {
  CreateJournalEntryRequest,
  CreateJournalVaultRequest,
  UpdateJournalEntryRequest,
} from './journal.dto.js';
import { JournalEntry } from './journal.entity.js';
import { JournalVault } from './journal-vault.entity.js';

@Injectable()
export class JournalService {
  constructor(
    private readonly em: EntityManager,
    private readonly activity: ActivityBus,
  ) {}

  async vaultStatus(userId: string) {
    const vault = await this.em.findOne(JournalVault, { user: userId });
    if (!vault) {
      return { configured: false as const };
    }
    return {
      configured: true as const,
      salt: vault.salt,
      verifier: vault.verifier,
      verifierIv: vault.verifierIv,
    };
  }

  async createVault(user: User, dto: CreateJournalVaultRequest) {
    const existing = await this.em.findOne(JournalVault, { user: user.id });
    if (existing) {
      throw new ConflictException('Journal vault already exists');
    }
    const vault = this.em.create(JournalVault, {
      user,
      salt: dto.salt,
      verifier: dto.verifier,
      verifierIv: dto.verifierIv,
    });
    await this.em.persist(vault).flush();
    return {
      configured: true as const,
      salt: vault.salt,
      verifier: vault.verifier,
      verifierIv: vault.verifierIv,
    };
  }

  async list(userId: string, q?: string) {
    const entries = await this.em.find(
      JournalEntry,
      { user: userId },
      { orderBy: { createdAt: 'DESC' } },
    );
    const needle = q?.trim().toLowerCase();
    const filtered = needle
      ? entries.filter(
          (entry) =>
            entry.title.toLowerCase().includes(needle) ||
            entry.tags.some((tag) => tag.toLowerCase().includes(needle)),
        )
      : entries;
    return filtered.map((entry) => this.toDto(entry));
  }

  async get(userId: string, id: string) {
    return this.toDto(await this.requireEntry(userId, id));
  }

  async create(user: User, dto: CreateJournalEntryRequest) {
    const entry = this.em.create(JournalEntry, {
      user,
      title: dto.title.trim(),
      tags: this.cleanTags(dto.tags),
      ciphertext: dto.ciphertext,
      iv: dto.iv,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
    });
    await this.em.persist(entry).flush();

    await this.activity.emit(user.id, {
      category: 'journal',
      type: 'JOURNAL_CREATED',
      title: entry.title,
      summary: 'Wrote a private journal entry',
      payload: { entryId: entry.id },
      tags: entry.tags,
    });

    return this.toDto(entry);
  }

  async update(userId: string, id: string, dto: UpdateJournalEntryRequest) {
    const entry = await this.requireEntry(userId, id);
    if (dto.title !== undefined) {
      entry.title = dto.title.trim();
    }
    if (dto.tags !== undefined) {
      entry.tags = this.cleanTags(dto.tags);
    }
    if (dto.ciphertext !== undefined && dto.iv !== undefined) {
      entry.ciphertext = dto.ciphertext;
      entry.iv = dto.iv;
    }
    await this.em.flush();
    return this.toDto(entry);
  }

  async remove(userId: string, id: string) {
    const entry = await this.requireEntry(userId, id);
    this.em.remove(entry);
    await this.em.flush();
    return { ok: true as const };
  }

  private async requireEntry(userId: string, id: string) {
    const entry = await this.em.findOne(JournalEntry, { id, user: userId });
    if (!entry) {
      throw new NotFoundException('Journal entry not found');
    }
    return entry;
  }

  private cleanTags(tags: string[]) {
    return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))].slice(0, 12);
  }

  private toDto(entry: JournalEntry) {
    return {
      id: entry.id,
      title: entry.title,
      tags: entry.tags,
      ciphertext: entry.ciphertext,
      iv: entry.iv,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    };
  }
}
