import { IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';

export class CipCertificatesDto {
  @IsString()
  CIPTitle: string;

  @IsString()
  CIPCode: string;

  @IsOptional()
  @IsString()
  CIPDefinition?: string;
}
