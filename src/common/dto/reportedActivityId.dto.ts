import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class ReportedActivityIdDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidReportedActivityId })
  reportedActivityId: string;
}
