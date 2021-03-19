import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class EnrollmentIdDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidEnrollmentId })
  enrollmentId: string;
}
