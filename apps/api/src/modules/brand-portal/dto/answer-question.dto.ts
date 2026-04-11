import { IsString, MinLength, MaxLength } from 'class-validator';

export class AnswerQuestionDto {
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  answer: string;
}
