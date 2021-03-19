import { IsString, IsOptional, IsNumber, IsMongoId, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import errorMessages from '../../config/responseMessages';
import responseMessages from '../../config/responseMessages';

export class DashboardDto {
  @ApiProperty({ required: false, default: '4' })
  @IsOptional()
  // @IsNumber({}, { message: errorMessages.common.invalidPerPage })
  repliesPerPage?: number;

  @ApiProperty({ required: false, default: '4' })
  @IsOptional()
  // @IsNumber({}, { message: errorMessages.common.invalidPerPage })
  postsPerPage?: number;

  @ApiProperty({ default: new Date() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidStartDate })
  start?: string;

  @ApiProperty({ default: new Date() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidEndDate })
  end?: string;
}
