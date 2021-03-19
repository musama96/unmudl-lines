import { IsString, IsUrl, IsOptional, IsNotEmpty } from 'class-validator';

export class CertificationsDto {
  @IsString()
  Id: string;

  @IsString()
  Name: string;

  @IsString()
  @IsOptional()
  Description?: string;

  @IsString()
  @IsOptional()
  Organization?: string;
}
