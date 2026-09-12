import { FilterQuery } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { NoteDto, NoteWriteInput } from '../../contracts/notes.js';
import { User } from '../users/user.entity.js';
import { Note } from './note.entity.js';

export type NoteQuery = {
  entityType?: string;
  entityId?: string;
  tag?: string;
  q?: string;
};

@Injectable()
export class NotesService {
  constructor(private readonly em: EntityManager) {}

  toDto(row: Note): NoteDto {
    return {
      id: row.id,
      entityType: row.entityType,
      entityId: row.entityId,
      body: row.body,
      tags: row.tags,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async list(userId: string, query: NoteQuery): Promise<NoteDto[]> {
    const em = this.em.fork();
    const where: FilterQuery<Note> = { user: userId };
    if (query.entityType) {
      where.entityType = query.entityType;
    }
    if (query.entityId) {
      where.entityId = query.entityId;
    }
    if (query.tag) {
      where.tags = { $contains: [query.tag] };
    }
    if (query.q) {
      const escaped = query.q.replace(/[%_]/g, '\\$&');
      where.body = { $ilike: `%${escaped}%` };
    }
    const rows = await em.find(Note, where, { orderBy: { createdAt: 'DESC' }, limit: 200 });
    return rows.map((row) => this.toDto(row));
  }

  async create(user: User, input: NoteWriteInput): Promise<NoteDto> {
    const em = this.em.fork();
    const row = em.create(Note, {
      user: em.getReference(User, user.id),
      entityType: input.entityType,
      entityId: input.entityId,
      body: input.body,
      tags: input.tags ?? [],
    });
    await em.flush();
    return this.toDto(row);
  }

  async update(userId: string, id: string, input: Partial<NoteWriteInput>): Promise<NoteDto> {
    const em = this.em.fork();
    const row = await em.findOne(Note, { id, user: userId });
    if (!row) {
      throw new NotFoundException('Note not found');
    }
    if (input.body !== undefined) {
      row.body = input.body;
    }
    if (input.tags !== undefined) {
      row.tags = input.tags;
    }
    if (input.entityType !== undefined) {
      row.entityType = input.entityType;
    }
    if (input.entityId !== undefined) {
      row.entityId = input.entityId;
    }
    await em.flush();
    return this.toDto(row);
  }

  async remove(userId: string, id: string): Promise<{ ok: true }> {
    const em = this.em.fork();
    const row = await em.findOne(Note, { id, user: userId });
    if (!row) {
      throw new NotFoundException('Note not found');
    }
    em.remove(row);
    await em.flush();
    return { ok: true };
  }
}
