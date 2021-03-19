import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export enum ResolveReportedActivityStatusEnum {
  IGNORE = 'ignore',
  WARNED = 'warned',
  SUSPENDED = 'suspended',
}

export class ResolveReportedActivityDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidReportedActivityId })
  reportedActivityId: string;

  @ApiProperty()
  @IsEnum(ResolveReportedActivityStatusEnum, { message: responseMessages.resolveReportedActivity.status })
  status: ResolveReportedActivityStatusEnum;
}
