import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreateJournalEntryRequest {
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  tags!: string[];

  @IsString()
  @MinLength(8)
  ciphertext!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  iv!: string;

  @IsOptional()
  @IsDateString()
  createdAt?: string;
}

export class UpdateJournalEntryRequest {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  @MinLength(8)
  ciphertext?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  iv?: string;
}

export class CreateJournalVaultRequest {
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  salt!: string;

  @IsString()
  @MinLength(8)
  verifier!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  verifierIv!: string;
}
