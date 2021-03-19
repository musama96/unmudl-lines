import { IsEmail, IsString, IsPhoneNumber, IsOptional, Matches, IsDateString, IsNumber } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { PHONE_NUMBER_REGEX } from '../../config/config';
import { ApiProperty } from '@nestjs/swagger';

export default class AdminHomeDto {
  @ApiProperty()
  @IsDateString()
  graphStart: string;

  @ApiProperty()
  @IsDateString()
  graphEnd: string;

  @ApiProperty()
  // @IsNumber()
  interval: number;

  @ApiProperty()
  @IsDateString()
  statsStart: string;

  @ApiProperty()
  @IsDateString()
  statsEnd: string;

  // @IsNumber()
  @IsOptional()
  perPage?: number;
}
