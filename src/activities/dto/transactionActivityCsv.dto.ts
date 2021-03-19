import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';
import responseMessages from '../../config/responseMessages';

export class TransactionActivityCsvDto {
  @ApiProperty()
  @IsDateString({ message: responseMessages.common.invalidStartDate })
  start: string;

  @ApiProperty()
  @IsDateString({ message: responseMessages.common.invalidEndDate })
  end: string;

  @ApiHideProperty()
  collegeId?: string;
}
