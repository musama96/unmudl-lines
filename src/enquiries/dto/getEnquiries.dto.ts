import { IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class GetEnquiriesDto {
  @IsNotEmpty()
  @IsMongoId(false, { message: responseMessages.common.invalidLearnerId })
  learner?: string;

  @IsNotEmpty()
  @IsMongoId(false, { message: responseMessages.common.invalidCourseId })
  course?: string;

  @IsOptional()
  // @IsNumber({}, { message: 'offset must be a number.' })
  offset?: number;
}
