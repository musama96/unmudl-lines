import { IsString, IsOptional, IsNumber, IsEnum, IsLatitude, IsLongitude } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import {IsMongoId} from '../../common/validators';

enum SearchType {
  KEYWORD = 'keyword',
  LOCATION = 'location',
}

export class LearnersListDto {
  @ApiProperty({ required: false, default: '' })
  @IsOptional()
  @IsString({ message: responseMessages.common.invalidKeyword })
  keyword: string;

  @ApiProperty({ required: true })
  @IsEnum(SearchType, { message: responseMessages.common.invalidLearnerSearchBy })
  searchBy: SearchType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsLatitude({ message: responseMessages.common.invalidLat })
  lat?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsLongitude({ message: responseMessages.common.invalidLng })
  lng?: number;

  @ApiProperty({ required: false, default: 'createdAt' })
  @IsOptional()
  sortBy?: string;

  @ApiProperty({ required: false, default: 'desc' })
  @IsOptional()
  sortOrder?: string;

  @ApiProperty({ required: false, default: '1' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPage })
  page: number;

  @ApiProperty({ required: false, default: '10' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPerPage })
  perPage: number;

  @ApiProperty({ required: false, default: '' })
  @IsMongoId(true, { message: responseMessages.common.invalidCollegeId })
  collegeId?: string;

  @ApiProperty({ required: false, default: '' })
  @IsMongoId(true, { message: responseMessages.common.invalidCourseId })
  courseId?: string;
}
