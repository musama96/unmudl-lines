import { IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';

enum UserType {
  COLLEGE = 'college',
  UNMUDL = 'unmudl',
}

export class AnalyticsCountDto {
  @ApiProperty({ default: new Date() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidStartDate })
  start?: string;

  @ApiProperty({ default: new Date() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidEndDate })
  end?: string;

  @ApiProperty({ description: '1, 30 or 365' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidInterval })
  interval?: number;

  @ApiProperty()
  @IsOptional()
  @IsEnum(UserType, { message: responseMessages.common.invalidUserType })
  type: UserType;

  collegeId?: string;
}
