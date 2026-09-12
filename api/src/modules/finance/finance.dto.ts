import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTransactionDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  @MaxLength(160)
  merchant!: string;

  @IsDateString()
  occurredAt!: string;

  @IsUUID()
  categoryId!: string;

  @IsOptional()
  @IsIn(['expense', 'income'])
  kind?: 'expense' | 'income';

  @IsOptional()
  @IsIn(['manual', 'xml'])
  source?: 'manual' | 'xml';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class UpdateTransactionDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  merchant?: string;

  @IsOptional()
  @IsDateString()
  occurredAt?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsIn(['expense', 'income'])
  kind?: 'expense' | 'income';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string | null;
}

export class CreateBudgetDto {
  @IsUUID()
  categoryId!: string;

  @Matches(/^\d{4}-\d{2}$/)
  month!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  limit!: number;
}

export class UpdateBudgetDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/)
  month?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  limit?: number;
}

export class ImportXmlBodyDto {
  @IsOptional()
  @IsString()
  xml?: string;
}
