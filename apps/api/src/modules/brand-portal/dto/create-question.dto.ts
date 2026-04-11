import { IsString, IsNumber, IsOptional, MinLength, MaxLength, IsIn } from 'class-validator';

export class CreateQuestionDto {
  @IsNumber()
  brand_id: number;

  @IsNumber()
  @IsOptional()
  product_id?: number;

  @IsString()
  @IsOptional()
  anonymous_id?: string;

  @IsString()
  @IsIn(['ingredient', 'usage', 'side_effect', 'price', 'production', 'vegan', 'general'])
  category: string;

  @IsString()
  @MinLength(20)
  @MaxLength(500)
  question: string;
}
