import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class ReportPostDto {
  @ApiProperty({ description: 'Id of the post' })
  @IsMongoId(true, { message: responseMessages.post.postId })
  postId?: string;

  @ApiProperty({ description: 'Id of the reply' })
  @IsMongoId(true, { message: responseMessages.post.replyId })
  replyId?: string;

  @ApiHideProperty()
  userId?: string;

  @ApiHideProperty()
  learnerId?: string;
}
