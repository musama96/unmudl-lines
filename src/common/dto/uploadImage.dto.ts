import { Type } from 'class-transformer';
import {
  IsString,
  ValidateNested,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsEnum,
  IsUrl,
  Min,
  IsBoolean,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const JsonParse = str => {
  return JSON.parse(str);
};

export class UploadImageDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
