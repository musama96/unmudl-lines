import { IsString } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class CopyDraftDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidCourseId })
  courseId: string;

  @IsString()
  title: string;
}
