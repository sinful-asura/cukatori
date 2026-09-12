import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export const HABIT_SCHEDULES = ['daily', 'weekdays', 'weekly'] as const;

export class CreateHabitRequest {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsIn(HABIT_SCHEDULES)
  schedule?: (typeof HABIT_SCHEDULES)[number];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  xpHint?: number;
}

export class UpdateHabitRequest {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsIn(HABIT_SCHEDULES)
  schedule?: (typeof HABIT_SCHEDULES)[number];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  xpHint?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}
