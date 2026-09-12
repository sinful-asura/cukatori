import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { User } from '../users/user.entity.js';
import { CreatePhotoDto, UpdatePhotoDto } from './photo.dto.js';
import { PhotosService } from './photos.service.js';

@Controller('photos')
@UseGuards(AuthGuard)
export class PhotosController {
  constructor(private readonly photos: PhotosService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.photos.list(user);
  }

  @Get(':id/file')
  @Header('Cache-Control', 'private, no-store')
  file(@CurrentUser() user: User, @Param('id') id: string) {
    return this.photos.file(user, id);
  }

  @Get(':id')
  get(@CurrentUser() user: User, @Param('id') id: string) {
    return this.photos.get(user, id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 8 * 1024 * 1024 } }))
  create(
    @CurrentUser() user: User,
    @UploadedFile() file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
    @Body() dto: CreatePhotoDto,
  ) {
    return this.photos.create(user, file, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdatePhotoDto) {
    return this.photos.update(user, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.photos.remove(user, id);
  }
}
