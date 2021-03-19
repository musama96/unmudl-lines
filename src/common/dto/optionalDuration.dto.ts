import { IsDateString, IsOptional } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

export class OptionalDurationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidStartDate })
  start: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidEndDate })
  end: string;

  @ApiHideProperty()
  collegeId?: string;
}
