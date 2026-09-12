import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { DISCOMFORT_SIDES } from './discomfort.entity.js';

export class CreateDiscomfortDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  region!: string;

  @IsOptional()
  @IsIn(DISCOMFORT_SIDES)
  side?: (typeof DISCOMFORT_SIDES)[number];

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  description!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  severity?: number;

  @IsOptional()
  @IsString()
  exerciseId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateDiscomfortDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  region?: string;

  @IsOptional()
  @IsIn(DISCOMFORT_SIDES)
  side?: (typeof DISCOMFORT_SIDES)[number];

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  severity?: number | null;

  @IsOptional()
  @IsString()
  exerciseId?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
