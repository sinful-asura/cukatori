import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { PHOTO_TYPES } from './photo.entity.js';

export class CreatePhotoDto {
  @IsIn(PHOTO_TYPES)
  type!: (typeof PHOTO_TYPES)[number];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(500)
  bodyweight?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  takenAt?: string;
}

export class UpdatePhotoDto {
  @IsOptional()
  @IsIn(PHOTO_TYPES)
  type?: (typeof PHOTO_TYPES)[number];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(500)
  bodyweight?: number | null;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsDateString()
  takenAt?: string;
}

export type PhotoDto = {
  id: string;
  type: string;
  takenAt: string;
  bodyweight: number | null;
  notes: string | null;
  mimeType: string;
  fileUrl: string;
  createdAt: string;
};
