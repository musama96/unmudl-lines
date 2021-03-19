import { IsNotEmpty } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiHideProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class AddLearnerEnquiryDto {
  @IsMongoId(false, { message: responseMessages.common.invalidCourseId })
  course: string;

  @IsNotEmpty({ message: 'Message cannot be empty' })
  message: string;

  @ApiHideProperty()
  learner?: string;
}
