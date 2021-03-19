import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../validators/index';

export class ListDto {
  @ApiProperty({ required: false, default: '' })
  @IsOptional()
  @IsString({ message: responseMessages.common.invalidKeyword })
  keyword: string;

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
  @IsMongoId(true, { message: responseMessages.common.invalidEmployerId })
  employerId?: string;

  sortOrder?: string;
  sortBy?: string;

  @ApiProperty({ required: false, default: '' })
  @IsMongoId(true, { message: responseMessages.common.invalidCourseId })
  courseId?: string;

  @ApiProperty({ required: false, default: '' })
  @IsMongoId(true, { message: responseMessages.common.invalidLearnerId })
  learnerId?: string;

  status?: string[];
}
