import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class CommentIdDto {
  @ApiProperty({ description: 'Id of the post' })
  @IsMongoId(false, { message: responseMessages.post.postId })
  commentId: string;
}
