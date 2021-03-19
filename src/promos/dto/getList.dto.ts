import { IsIn, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { Type } from 'class-transformer';
import { DurationDto } from '../../common/dto/duration.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class GetListDto {
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

  @IsOptional()
  @IsIn(['unmudl', 'college'], { message: responseMessages.createPromo.type })
  type?: string;

  @IsOptional()
  @IsIn(['active', 'suspended'], { message: responseMessages.createPromo.status })
  status?: string;

  @ApiProperty({ required: false, default: '' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DurationDto)
  date: DurationDto;

  @ApiProperty({ required: false, default: '' })
  @IsMongoId(true, { message: responseMessages.common.invalidCollegeId })
  collegeId?: string;

  @ApiProperty({ required: false, default: '' })
  @IsMongoId(true, { message: responseMessages.common.invalidCourseId })
  courseId?: string;
}
