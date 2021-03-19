import { IsEnum } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ReportLearnerStatus } from '../reported-learner.model';
import { IsMongoId } from '../../common/validators';

export class UpdateLearnerReportDto {
  @IsMongoId(false, { message: responseMessages.common.invalidReportedActivityId })
  reportId: string;

  @IsEnum(ReportLearnerStatus)
  status: ReportLearnerStatus;
}
