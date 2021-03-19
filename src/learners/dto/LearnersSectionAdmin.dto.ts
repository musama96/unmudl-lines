import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import responseMessages from '../../config/responseMessages';

enum LearnersSearchType {
  KEYWORD = 'keyword',
  LOCATION = 'location',
}

export class LearnersSectionAdminDto {
  @ApiProperty({ default: new Date() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidStartDate })
  userGrowthStart?: string;

  @ApiProperty({ default: new Date() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidEndDate })
  userGrowthEnd?: string;

  @ApiProperty({ default: new Date() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidStartDate })
  graphStart?: string;

  @ApiProperty({ default: new Date() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidEndDate })
  graphEnd?: string;

  @ApiProperty({ default: new Date() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidStartDate })
  learnersStart?: string;

  @ApiProperty({ default: new Date() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidEndDate })
  learnersEnd?: string;

  @IsEnum(LearnersSearchType, { message: responseMessages.common.invalidLearnerSearchBy })
  searchBy: LearnersSearchType;

  // @IsNumber({}, { message: responseMessages.common.invalidPage })
  interval?: number;

  // @IsNumber({}, { message: responseMessages.common.invalidPage })
  page?: number;

  // @IsNumber({}, { message: responseMessages.common.invalidPerPage })
  perPage?: number;

  @ApiProperty({ required: false, default: 'createdAt' })
  @IsOptional()
  sortBy?: string;

  @ApiProperty({ required: false, default: 'desc' })
  @IsOptional()
  sortOrder?: string;

  lat?: number;
  lng?: number;
  keyword?: string;

  @ApiHideProperty()
  collegeId?: string;
  @ApiHideProperty()
  start?: string;
  @ApiHideProperty()
  end?: string;
}
