import { IsString, IsUrl, IsOptional, IsNotEmpty } from 'class-validator';

export class LicenseDto {
  @IsString()
  ID: string;

  @IsString()
  Title: string;

  @IsString()
  @IsOptional()
  Description?: string;
}
