import {IsEnum, IsNumber, IsOptional} from 'class-validator';
import responseMessages from '../../config/responseMessages';
import {ApiHideProperty, ApiProperty} from '@nestjs/swagger';

enum StatsFilter {
  UNDERENROLLED = 'underenrolled', OVERENROLLED  = 'overenrolled',
}

export class GetEnrollmentStatisticsDto {
  @IsEnum(StatsFilter, {message: responseMessages.common.invalidStatsFilter})
  filter: StatsFilter;

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
