import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import {IsMongoId} from '../../common/validators';

export class PaginationDto {
  @ApiProperty({ required: false, default: '' })
  @IsOptional()
  @IsString({ message: responseMessages.common.invalidKeyword })
  keyword?: string;

  @ApiProperty({ required: false, default: '1' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPage })
  page: number;

  @ApiProperty({ required: false, default: '10' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPerPage })
  perPage: number;

  @IsMongoId(true, { message: responseMessages.common.invalidCollegeId })
  collegeId?: string;

  sortBy?: string;
  sortOrder?: string;
}
