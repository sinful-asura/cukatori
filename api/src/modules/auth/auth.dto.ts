import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

const localEmail = { require_tld: false };

export class RegisterRequest {
  @IsEmail(localEmail)
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  displayName?: string;
}

export class LoginRequest {
  @IsEmail(localEmail)
  email!: string;

  @IsString()
  password!: string;
}

export class GoogleAuthRequest {
  @IsString()
  @MinLength(20)
  credential!: string;
}
