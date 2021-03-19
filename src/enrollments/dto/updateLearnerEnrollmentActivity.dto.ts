import { IsIn, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';

export class UpdateLearnerEnrollmentActivityDto {
  @ApiProperty()
  @IsIn(['not-started', 'in-progress', 'completed'], { message: responseMessages.updateLearnerEnrollmentActivity.status })
  status?: string;

  @ApiProperty()
  @IsNotEmpty({ message: responseMessages.updateLearnerEnrollmentActivity.userId })
  userId?: string;

  @ApiProperty()
  @IsNotEmpty({ message: responseMessages.updateLearnerEnrollmentActivity.courseId })
  courseId?: string;

  @ApiProperty()
  averageScore?: string;

  @ApiProperty()
  totalTimeSpentInMinutes?: string;

  @ApiProperty()
  startedDate?: string;

  @ApiProperty()
  completedDate?: string;

  @ApiProperty()
  certificateNumber?: string;

  @ApiProperty()
  certificateURL?: string;

  @ApiProperty()
  total?: number;

  @ApiProperty()
  started?: number;

  @ApiProperty()
  completed?: number;
}
