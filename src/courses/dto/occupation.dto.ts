import { IsString, IsUrl, IsOptional, IsNotEmpty } from 'class-validator';

export class OccupationDto {
  @IsString()
  code: string;

  @IsString()
  title: string;
}
