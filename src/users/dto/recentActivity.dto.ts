import { IsDateString, IsOptional } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class RecentActivityDto {
  @ApiProperty()
  keyword?: string;

  @ApiProperty()
  @IsMongoId(true, { message: responseMessages.common.invalidInstructorId })
  userId?: string;

  @ApiProperty()
  @IsDateString({ message: responseMessages.common.invalidStartDate })
  start: string;

  @ApiProperty()
  @IsDateString({ message: responseMessages.common.invalidEndDate })
  end: string;

  @ApiProperty({ required: false, default: '1' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPage })
  page: number;

  @ApiProperty({ required: false, default: '10' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPerPage })
  perPage: number;

  @ApiProperty()
  @IsMongoId(true)
  collegeId?: string;

  @ApiHideProperty()
  courseId?: string;
}
