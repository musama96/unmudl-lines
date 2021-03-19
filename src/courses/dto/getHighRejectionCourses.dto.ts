import {IsEnum, IsNumber, IsOptional, Max, Min} from 'class-validator';
import responseMessages from '../../config/responseMessages';
import {ApiHideProperty, ApiProperty} from '@nestjs/swagger';

export class GetHighRejectionCoursesDto {
  @ApiProperty({ required: false, default: '20' })
  // @IsNumber({}, {message: responseMessages.common.invalidRejectionRate})
  // @Min(1, {message: responseMessages.common.invalidRejectionRate})
  // @Max(100, {message: responseMessages.common.invalidRejectionRate})
  rejectionRate: number;

  @ApiProperty({ required: false, default: '1' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPage })
  page: number;

  @ApiProperty({ required: false, default: '10' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPerPage })
  perPage: number;

  @ApiHideProperty()
  collegeId?: string;
}
