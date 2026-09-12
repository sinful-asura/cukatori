import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterRequest {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  displayName?: string;
}

export class LoginRequest {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
