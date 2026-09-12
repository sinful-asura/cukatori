import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateWorkoutSetDto {
  @IsString()
  exerciseId!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  setIndex?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  reps!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1000)
  weightKg!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  rpe?: number;
}

export class CreateWorkoutDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  startedAt?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(80)
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutSetDto)
  sets?: CreateWorkoutSetDto[];
}

export class PatchWorkoutDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CompleteWorkoutDto {
  @IsOptional()
  @IsString()
  completedAt?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(600)
  durationMin?: number;
}

export class WorkoutListQueryDto {
  @IsOptional()
  @IsIn(['draft', 'completed'])
  status?: 'draft' | 'completed';
}
