import {ApiProperty} from '@nestjs/swagger';
import {IsEnum, IsNumber, IsOptional} from 'class-validator';
import responseMessages from '../../config/responseMessages';
import {SortOrderEnum} from '../../common/enums/sort.enum';

enum ReportedActivitiesColumn {
  reportedLearner = 'reportedLearner',
  reportingLearner = 'reportingLearner',
  reportingCollege = 'reportingCollege',
  reportingUser = 'reportingUser',
  reviewDate = 'reviewDate',
  resolutionDate = 'resolutionDate',
  status = 'status',
  noOfReports = 'noOfReports',
}

export class ReportedActivitiesListDto {
  @ApiProperty({ required: false, default: '1' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPage })
  page: number;

  @ApiProperty({ required: false, default: '10' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPerPage })
  perPage: number;

  sortBy?: string;
  sortOrder?: string;
}
