import { IsDateString, IsOptional } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';
import { IsGreaterThanStart } from '../validators/dateRange.validator';
import { IsMongoId } from '../../common/validators';

export class DurationDto {
  @ApiProperty({ example: '2020-06-06T07:00:22.177+00:00' })
  @IsDateString({ message: responseMessages.common.invalidStartDate })
  start: string;

  @ApiProperty({ example: '2020-09-06T07:00:22.177+00:00' })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidEndDate })
  @IsGreaterThanStart('start', { message: responseMessages.common.endDate })
  end?: string;

  @IsMongoId(true, { message: responseMessages.common.invalidCollegeId })
  collegeId?: string;
}
