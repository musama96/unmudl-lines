import { IsMongoId, IsNumber } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';

export class CourseNumIdDto {
  @ApiProperty({ description: 'Courses numeric Id (numId)' })
  // @IsNumber()
  courseId: string;
}
