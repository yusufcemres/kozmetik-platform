import { IsEmail, IsString } from 'class-validator';

export class LoginBrandDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
