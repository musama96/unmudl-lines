import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class ReviewIdDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidReviewId })
  reviewId: string;
}
