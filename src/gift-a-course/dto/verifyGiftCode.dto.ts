import { IsMongoId } from '../../common/validators';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import responseMessages from '../../config/responseMessages';

export class VerifyGiftCodeDto {
  @ApiProperty({ required: false })
  @IsNotEmpty({ message: responseMessages.giftCourse.giftCode })
  giftCode?: string;

  @IsMongoId({ message: responseMessages.common.invalidCourseId })
  courseId?: string;
}
