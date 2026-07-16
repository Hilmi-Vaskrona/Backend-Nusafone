import { IsString, IsEmail, MinLength, IsEnum, Matches } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d).+$/, {
    message: 'Password must contain at least one letter and one number',
  })
  password: string;

  @IsString()
  confirmPassword: string;

  @IsEnum(UserRole)
  role?: UserRole;
}
