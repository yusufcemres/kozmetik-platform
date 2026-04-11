import { IsEmail, IsString, MinLength, IsOptional, IsNumber } from 'class-validator';

export class RegisterBrandDto {
  @IsNumber()
  brand_id: number;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  representative_name: string;

  @IsString()
  @IsOptional()
  representative_title?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
