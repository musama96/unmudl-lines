import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import {IsMongoId} from '../../common/validators';

export class ReportLearnerDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidLearnerId })
  learnerId: string;

  @ApiHideProperty()
  status?: string;
  @ApiHideProperty()
  userId?: string;
  @ApiHideProperty()
  collegeId?: string;
}
