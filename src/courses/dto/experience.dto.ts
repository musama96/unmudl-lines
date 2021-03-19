import { IsString, IsUrl, IsOptional, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class ExperienceDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  // @IsNumber()
  // @Max(100)
  // @Min(0)
  hours: number;
}
