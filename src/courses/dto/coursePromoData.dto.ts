import { IsNumber, IsOptional, IsDateString } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class CoursePromoDataDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidCourseId })
  courseId: string;

  @IsOptional()
  // @IsNumber()
  page?: number;

  @IsOptional()
  // @IsNumber()
  perPage?: number;

  @IsOptional()
  @IsDateString()
  start?: string;

  @IsOptional()
  @IsDateString()
  end?: string;

  sortBy?: string;
  sortOrder?: string;

  @ApiHideProperty()
  collegeId?: string;
}
