import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class BugReportIdDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidBugReportId })
  bugReportId: string;
}
