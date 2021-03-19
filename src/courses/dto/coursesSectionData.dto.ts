import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsRating, IsMongoId } from '../../common/validators';

export class CoursesSectionDataDto {
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
  // @IsNumber({}, { message: 'Open applied can either be 0 or 1.' })
  open?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean({ message: 'Open must be a boolean.' })
  openApplied?: boolean;

  @ApiProperty({ required: false, default: '[1,2,3,4,5]' })
  @IsOptional()
  @IsRating()
  rating?: string; // [];

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
  status?: string;

  @ApiHideProperty()
  courseIds?: string[];
}
