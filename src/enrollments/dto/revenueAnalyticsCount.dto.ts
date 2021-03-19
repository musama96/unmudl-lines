import { IsBoolean, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';

export enum UserType {
  COLLEGE = 'college',
  UNMUDL = 'unmudl',
}

export class RevenueAnalyticsCountDto {
  @ApiProperty({ default: new Date() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidStartDate })
  start?: string;

  @ApiProperty({ default: new Date() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidEndDate })
  end?: string;

  @ApiProperty({ default: new Date() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidStartDate })
  graphStart?: string;

  @ApiProperty({ default: new Date() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidEndDate })
  graphEnd?: string;

  @ApiProperty({ description: 'true for highest, false for lowest grossing date' })
  @IsOptional()
  @IsBoolean({ message: responseMessages.common.invalidRevenueSort })
  sort?: boolean;

  @ApiProperty({ description: 'College can view unmudl analytics if selected.' })
  @IsOptional()
  @IsEnum(UserType, { message: responseMessages.createPromo.type })
  type?: UserType;

  @ApiHideProperty()
  collegeId?: string;
}
