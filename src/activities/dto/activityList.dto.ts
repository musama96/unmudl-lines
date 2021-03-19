import { IsNumber, IsOptional, IsEnum, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

enum ActivityType {
  USER = 'user',
  TRANSACTION = 'transaction',
}

enum Duration {
  TODAY = 1,
  WEEK = 7,
  MONTH = 30,
}

export class ActivityListDto {
  @IsEnum(ActivityType, { message: responseMessages.activities.type })
  @IsNotEmpty()
  type: ActivityType;

  // @IsEnum(Duration, { message: responseMessages.activities.type })
  // @IsNotEmpty()
  // duration?: Duration;
  @IsOptional()
  @IsDateString()
  start?: string;

  @IsOptional()
  @IsDateString()
  end?: string;

  @ApiProperty({ required: false, default: '' })
  @IsMongoId(true, { message: responseMessages.common.invalidUserId })
  userId?: string;

  @ApiProperty({ required: false, default: '' })
  @IsMongoId(true, { message: responseMessages.common.invalidLearnerId })
  learnerId?: string;

  @ApiProperty({ required: false, default: '' })
  @IsMongoId(true, { message: responseMessages.common.invalidLearnerId })
  courseId?: string;

  @ApiProperty({ required: false, default: '1' })
  @IsOptional()
  // @IsNumber({}, { message: 'You must enter page number to fetch.' })
  page?: number;

  @ApiProperty({ required: false, default: '10' })
  @IsOptional()
  // @IsNumber({}, { message: 'You must enter a number.' })
  perPage?: number;
}
