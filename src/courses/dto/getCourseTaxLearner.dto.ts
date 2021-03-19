import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class GetCourseTaxLearnerDto {
  @IsMongoId(false, { message: responseMessages.common.invalidEnrollmentId })
  courseId?: string;
}
