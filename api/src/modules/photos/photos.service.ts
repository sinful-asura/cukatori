import {
  BadRequestException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { createReadStream } from 'node:fs';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import type { ActivityType } from '../../contracts/activity.js';
import { ActivityBus } from '../activity/activity.bus.js';
import type { User } from '../users/user.entity.js';
import { Photo, PHOTO_TYPES } from './photo.entity.js';
import type { CreatePhotoDto, PhotoDto, UpdatePhotoDto } from './photo.dto.js';

const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

type UploadedFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@Injectable()
export class PhotosService {
  constructor(
    private readonly em: EntityManager,
    private readonly bus: ActivityBus,
  ) {}

  async list(user: User): Promise<PhotoDto[]> {
    const photos = await this.em.find(
      Photo,
      { user },
      { orderBy: { takenAt: 'DESC' } },
    );
    return photos.map((photo) => this.toDto(photo));
  }

  async get(user: User, id: string): Promise<PhotoDto> {
    return this.toDto(await this.requireOwned(user, id));
  }

  async create(user: User, file: UploadedFile | undefined, dto: CreatePhotoDto): Promise<PhotoDto> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Attach an image file.');
    }
    const ext = ALLOWED_MIME[file.mimetype];
    if (!ext) {
      throw new BadRequestException('Use a JPEG, PNG, or WebP image.');
    }
    if (!PHOTO_TYPES.includes(dto.type)) {
      throw new BadRequestException('Photo type must be front, back, side, or other.');
    }

    const photo = this.em.create(Photo, {
      user,
      type: dto.type,
      takenAt: dto.takenAt ? new Date(dto.takenAt) : new Date(),
      bodyweight: dto.bodyweight ?? null,
      notes: dto.notes?.trim() || null,
      mimeType: file.mimetype,
      storageKey: '',
      originalName: file.originalname || `photo${ext}`,
    });
    photo.storageKey = `${user.id}/${photo.id}${ext}`;

    const abs = this.absPath(photo.storageKey);
    await mkdir(join(abs, '..'), { recursive: true });
    await writeFile(abs, file.buffer);
    await this.em.persist(photo).flush();

    await this.bus.emit(user.id, {
      category: 'exercise',
      type: 'PHOTO_UPLOADED' as ActivityType,
      title: 'Progress photo',
      summary: `You added a ${dto.type} photo.`,
      xp: 0,
      payload: { photoId: photo.id, photoType: dto.type },
      tags: ['photo', dto.type],
    });

    return this.toDto(photo);
  }

  async update(user: User, id: string, dto: UpdatePhotoDto): Promise<PhotoDto> {
    const photo = await this.requireOwned(user, id);
    if (dto.type) {
      photo.type = dto.type;
    }
    if (dto.takenAt) {
      photo.takenAt = new Date(dto.takenAt);
    }
    if (dto.bodyweight !== undefined) {
      photo.bodyweight = dto.bodyweight;
    }
    if (dto.notes !== undefined) {
      photo.notes = dto.notes?.trim() || null;
    }
    await this.em.flush();
    await this.bus.emit(user.id, {
      category: 'exercise',
      type: 'PHOTO_UPLOADED' as ActivityType,
      title: 'Progress photo updated',
      summary: `You updated a ${photo.type} photo.`,
      xp: 0,
      payload: { photoId: photo.id, photoType: photo.type },
      tags: ['photo', photo.type],
    });
    return this.toDto(photo);
  }

  async remove(user: User, id: string): Promise<{ ok: true }> {
    const photo = await this.requireOwned(user, id);
    const key = photo.storageKey;
    await this.em.remove(photo).flush();
    await unlink(this.absPath(key)).catch(() => undefined);
    await this.bus.emit(user.id, {
      category: 'exercise',
      type: 'PHOTO_UPLOADED' as ActivityType,
      title: 'Progress photo removed',
      summary: 'You removed a private progress photo.',
      xp: 0,
      payload: { photoId: id },
      tags: ['photo'],
    });
    return { ok: true };
  }

  async file(user: User, id: string): Promise<StreamableFile> {
    const photo = await this.requireOwned(user, id);
    const stream = createReadStream(this.absPath(photo.storageKey));
    stream.on('error', () => undefined);
    return new StreamableFile(stream, {
      type: photo.mimeType,
      disposition: `inline; filename="${photo.id}${extname(photo.storageKey)}"`,
    });
  }

  private async requireOwned(user: User, id: string): Promise<Photo> {
    const photo = await this.em.findOne(Photo, { id, user });
    if (!photo) {
      throw new NotFoundException('Photo not found.');
    }
    return photo;
  }

  private storageRoot(): string {
    return process.env.PHOTO_STORAGE ?? join(process.cwd(), 'uploads', 'photos');
  }

  private absPath(storageKey: string): string {
    return join(this.storageRoot(), storageKey);
  }

  private toDto(photo: Photo): PhotoDto {
    return {
      id: photo.id,
      type: photo.type,
      takenAt: photo.takenAt.toISOString(),
      bodyweight: photo.bodyweight,
      notes: photo.notes,
      mimeType: photo.mimeType,
      fileUrl: `/api/photos/${photo.id}/file`,
      createdAt: photo.createdAt.toISOString(),
    };
  }
}
