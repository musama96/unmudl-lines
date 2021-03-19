import { IsBoolean, IsDateString, IsEnum, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';

enum UserType {
  COLLEGE = 'college',
  UNMUDL = 'unmudl',
}

export class LearnerAnalyticsCountDto {
  @ApiProperty({ default: new Date() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidStartDate })
  start?: string;

  @ApiProperty({ default: new Date() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidEndDate })
  end?: string;

  @ApiProperty({ description: 'true for enrolled and false for sign ups' })
  @IsOptional()
  @IsBoolean({ message: responseMessages.common.invalidEnrolledStatus })
  enrolled?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsEnum(UserType, { message: responseMessages.createPromo.type })
  type: UserType;

  collegeId?: string;
}
