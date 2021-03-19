import { IsString, IsUrl, IsOptional, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class SkillOutcomeDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  // @IsNumber()
  // @Max(7)
  // @Min(1)
  level: number;
}
