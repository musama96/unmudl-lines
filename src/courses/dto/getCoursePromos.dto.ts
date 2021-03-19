import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class GetCoursePromosDto {
  // @IsNumber({}, { message: responseMessages.common.invalidPage })
  // @Min(1, { message: responseMessages.common.invalidPage })
  @IsOptional()
  page?: number;

  // @IsNumber({}, { message: responseMessages.common.invalidPerPage })
  // @Min(1, { message: responseMessages.common.invalidPage })
  @IsOptional()
  perPage?: number;

  keyword?: string;

  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidCourseId })
  courseId: string;

  @ApiHideProperty()
  @IsOptional()
  collegeId?: string;
}
