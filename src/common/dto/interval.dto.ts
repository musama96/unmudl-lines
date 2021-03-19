import { IsDateString, IsIn, IsNumber } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsGreaterThanStart } from '../validators/dateRange.validator';

export class IntervalDto {
  @ApiProperty({ example: '2020-06-06T07:00:22.177+00:00' })
  @IsDateString({ message: responseMessages.common.invalidStartDate })
  start: string;

  @ApiProperty({ example: '2020-09-06T07:00:22.177+00:00' })
  @IsDateString({ message: responseMessages.common.invalidEndDate })
  @IsGreaterThanStart('start', { message: responseMessages.common.endDate })
  end: string;

  @ApiProperty({ example: 1 })
  // @IsNumber({}, { message: responseMessages.common.invalidInterval })
  @IsIn([1, 7, 30, 365], { message: responseMessages.common.invalidInterval })
  interval: number;

  @ApiHideProperty()
  collegeId?: string;
}
