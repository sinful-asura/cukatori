import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export const MEDIA_TYPES = ['anime', 'manga', 'book', 'movie', 'novel', 'youtube'] as const;
export const MEDIA_STATUSES = [
  'planned',
  'watching',
  'reading',
  'completed',
  'paused',
  'dropped',
] as const;

export class CreateMediaItemDto {
  @IsIn(MEDIA_TYPES)
  type!: (typeof MEDIA_TYPES)[number];

  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  posterUrl?: string | null;

  @IsOptional()
  @IsIn(MEDIA_STATUSES)
  status?: (typeof MEDIA_STATUSES)[number];

  @IsOptional()
  @IsString()
  subtitle?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalUnits?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  currentEpisode?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  currentPages?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  hours?: number;
}

export class UpdateMediaItemDto {
  @IsOptional()
  @IsIn(MEDIA_TYPES)
  type?: (typeof MEDIA_TYPES)[number];

  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  posterUrl?: string | null;

  @IsOptional()
  @IsIn(MEDIA_STATUSES)
  status?: (typeof MEDIA_STATUSES)[number];

  @IsOptional()
  @IsString()
  subtitle?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalUnits?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  currentEpisode?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  currentPages?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  hours?: number;
}

export class LogMediaProgressDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  episode?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  pages?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  hours?: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
