import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class CourseIdDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidCourseId })
  courseId: string;
}
