import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { IsMongoId } from '../../common/validators';
import responseMessages from '../../config/responseMessages';

export class InstructorSectionDataDto {
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

  sortOrder?: string;
  sortBy?: string;

  @ApiProperty({ required: false, default: '' })
  @IsMongoId(true, { message: responseMessages.common.invalidCollegeId })
  collegeId?: string;
}
