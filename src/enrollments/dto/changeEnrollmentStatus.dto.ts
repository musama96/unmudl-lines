import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

enum ChangeEnrollmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
}

export class ChangeEnrollmentStatusDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidEnrollmentId })
  enrollmentId: string;

  // @ApiProperty()
  // @IsOptional()
  // @IsMongoId({ message: responseMessages.common.invalidLearnerId })
  // learnerId?: string;

  // @ApiProperty()
  // @IsOptional()
  // @IsMongoId({ message: responseMessages.common.invalidCourseId })
  // courseId?: string;

  @ApiProperty()
  @IsEnum(ChangeEnrollmentStatus, { message: responseMessages.enrollments.invalidStatus })
  status: ChangeEnrollmentStatus;

  sisUserId?: string;
}
