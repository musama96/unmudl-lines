import { IsEnum, IsOptional } from 'class-validator';
import { IsTimeString } from '../../common/validators';
import { IsGreaterThanStart } from '../validators/timeRange.validator';
import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';

enum HoursOffered {
  DAYTIME = 'daytime',
  EVENING = 'evening',
}

export class TimeRangeDto {
  @IsEnum(HoursOffered)
  hoursOffered: HoursOffered;

  @ApiProperty({ example: '5:17 PM' })
  @IsTimeString({ message: responseMessages.common.time })
  @IsOptional()
  start?: string;

  @ApiProperty({ example: '9:17 PM' })
  @IsTimeString({ message: responseMessages.common.time })
  @IsGreaterThanStart('start', { message: responseMessages.common.endTime })
  @IsOptional()
  end?: string;
}
