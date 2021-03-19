import { IsEmail, IsString, IsPhoneNumber, IsOptional, Matches, IsDateString, IsNumber } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { PHONE_NUMBER_REGEX } from '../../config/config';
import { ApiProperty } from '@nestjs/swagger';

export default class StatsDto {
  @ApiProperty()
  @IsDateString()
  start: string;

  @ApiProperty()
  @IsDateString()
  end: string;
}
