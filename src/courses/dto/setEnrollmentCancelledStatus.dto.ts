import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsBoolean } from 'class-validator';
import { IsMongoId } from '../../common/validators';

export class SetEnrollmentCancelledStatusDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.setEnrollment.courseId })
  courseId: string;

  @ApiProperty()
  @IsBoolean({ message: responseMessages.setEnrollment.status })
  status: boolean;
}
