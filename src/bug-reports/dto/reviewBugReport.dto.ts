import { ApiHideProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class ReviewBugReportDto {
  @IsMongoId(false, { message: responseMessages.common.invalidBugReportId })
  bugReportId: string;

  comment?: string;

  @ApiHideProperty()
  resolvedBy?: string;

  @ApiHideProperty()
  resolvedAt?: any;
}
