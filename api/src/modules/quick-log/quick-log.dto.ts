import { Transform } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

export class QuickLogRequest {
  @IsString()
  @MinLength(1)
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  text!: string;
}
