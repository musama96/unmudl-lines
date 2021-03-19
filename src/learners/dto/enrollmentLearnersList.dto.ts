import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

enum SearchBy {
  KEYWORD = 'keyword',
  COORDINATES = 'coordinates',
}

export class EnrollmentLearnersListDto {
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

  @IsEnum(SearchBy)
  searchBy: SearchBy;

  @ApiProperty({ required: false, default: '' })
  @IsMongoId(true, { message: responseMessages.common.invalidCollegeId })
  collegeId?: string;

  @ApiProperty({ required: false, default: '' })
  @IsMongoId(true, { message: responseMessages.common.invalidCourseId })
  courseId?: string;
}
