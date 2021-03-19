import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId, IsArray } from '../../common/validators';

export class CourseIdsDto {
  @ApiProperty({ type: String, description: 'enter in form of array like ["5e21bd86529642445c61bc8d", "5e21bd86529642445c61bc8g"]' })
  @IsArray(false)
  @IsMongoId(false, { message: responseMessages.common.invalidCourseId, each: true })
  courses: string[];
}
