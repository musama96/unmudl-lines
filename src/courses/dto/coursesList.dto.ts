import { IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';
import { IsMongoId, IsArray } from '../../common/validators';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';

export enum CourseListStatus {
  ALL = 'all',
  PUBLISHED = 'published',
  COMING_SOON = 'coming_soon',
  UNPUBLISH = 'unpublished',
}

export class CoursesListDto {
  @ApiProperty({ required: false, default: '' })
  @IsOptional()
  @IsString({ message: 'You must enter a string to search.' })
  keyword?: string;

  @ApiProperty({ required: false, default: '0' })
  @IsOptional()
  // @IsNumber({}, { message: 'Minimum price must be a number.' })
  minPrice?: number;

  @ApiProperty({ required: false, default: '' })
  @IsOptional()
  // @IsNumber({}, { message: 'Maximum price must be a number.' })
  maxPrice?: number;

  @ApiProperty({ required: false, default: '1' })
  @IsOptional()
  // @IsNumber({}, { message: 'Days left must be a number.' })
  daysLeft?: number;

  @ApiProperty({ required: false, default: '1' })
  @IsOptional()
  // @IsNumber({}, { message: 'Open can either be 0 or 1.' })
  open?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean({ message: 'Open applied must be a boolean.' })
  openApplied?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  // @IsNumber()
  rating?: number; // [];

  @ApiProperty({ required: false, default: '1' })
  @IsOptional()
  // @IsNumber({}, { message: 'You must enter page number to fetch.' })
  page?: number;

  @ApiProperty({ required: false, default: '10' })
  @IsOptional()
  // @IsNumber({}, { message: 'You must enter a number.' })
  perPage?: number;

  sortOrder?: string;
  sortBy?: string;

  @ApiProperty({ required: false, default: '' })
  @IsMongoId(true, { message: 'You must enter a valid mongodb id.' })
  collegeId?: string;

  @ApiHideProperty()
  instructorId?: string;

  @IsOptional()
  status?: CourseListStatus;

  @ApiProperty({ type: String, description: 'enter in form of array like ["5e21bd86529642445c61bc8d", "5e21bd86529642445c61bc8g"]' })
  @IsArray(true)
  @IsMongoId(true, { message: responseMessages.common.invalidCourseId, each: true })
  courseIds?: string[];
}
