import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';
import responseMessages from '../../config/responseMessages';

export class SearchCoursesDto {
  @ApiProperty({ required: false, default: '' })
  @IsOptional()
  @IsString({ message: 'You must enter a string to search.' })
  keyword?: string;

  @ApiProperty({ required: false, default: '5' })
  @IsOptional()
  // @IsNumber({}, { message: 'You must enter a number.' })
  perPage?: number;

  @IsMongoId(true, { message: responseMessages.common.invalidCollegeId })
  collegeId?: string;
}
