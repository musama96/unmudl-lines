import { IsNumber, IsOptional } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class CoursePaginationDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidCourseId })
  courseId: string;

  @IsOptional()
  // @IsNumber()
  page?: number;

  @IsOptional()
  // @IsNumber()
  perPage?: number;

  sortBy?: string;
  sortOrder?: string;
}
