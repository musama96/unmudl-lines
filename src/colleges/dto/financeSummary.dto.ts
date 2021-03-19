import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import {IsMongoId} from '../../common/validators';

export class FinanceSummaryDto {
  @ApiProperty({ default: new Date() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidStartDate })
  graphStart?: string;

  @ApiProperty({ default: new Date() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidEndDate })
  graphEnd?: string;
  @ApiProperty({ default: new Date() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidStartDate })
  activitiesStart?: string;

  @ApiProperty({ default: new Date() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidEndDate })
  activitiesEnd?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  stripeAuthCode?: string;

  @IsMongoId(true, { message: responseMessages.common.invalidCollegeId })
  collegeId?: string;
}
