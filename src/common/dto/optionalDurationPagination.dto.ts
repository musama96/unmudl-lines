import { IsDateString, IsIn, IsNumber, IsOptional } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

export class OptionalDurationPaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidStartDate })
  start?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidEndDate })
  end?: string;

  @ApiProperty({ required: false, default: '1' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPage })
  page?: number;

  @ApiProperty({ required: false, default: '10' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPerPage })
  perPage?: number;

  @ApiProperty({ required: false, default: '' })
  sortColumn?: number;

  @ApiProperty({ required: false, default: '1' })
  @IsOptional()
  @IsIn([1, -1], { message: responseMessages.common.invalidSort })
  sortOrder?: number;

  @ApiHideProperty()
  collegeId: string;
}
