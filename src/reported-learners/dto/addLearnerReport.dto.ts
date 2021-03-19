import { IsString } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiHideProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class AddLearnerReportDto {
  @IsMongoId(false, { message: responseMessages.common.invalidLearnerId })
  learnerId: string;

  @IsString()
  reason: string;

  @ApiHideProperty()
  userId?: string;

  @ApiHideProperty()
  collegeId?: string;
}
