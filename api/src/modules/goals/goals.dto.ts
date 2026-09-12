import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

export const GOAL_KINDS = ['count', 'currency', 'frequency'] as const;
export const GOAL_STATUSES = ['active', 'completed', 'paused'] as const;

export class CreateGoalRequest {
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsIn(GOAL_KINDS)
  kind?: (typeof GOAL_KINDS)[number];

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  target!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  current?: number;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  unit?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsDateString()
  deadline?: string | null;
}

export class UpdateGoalRequest {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsIn(GOAL_KINDS)
  kind?: (typeof GOAL_KINDS)[number];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  target?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  current?: number;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  unit?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsDateString()
  deadline?: string | null;

  @IsOptional()
  @IsIn(GOAL_STATUSES)
  status?: (typeof GOAL_STATUSES)[number];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sortOrder?: number;
}

export class ProgressGoalRequest {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  delta?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  current?: number;
}
