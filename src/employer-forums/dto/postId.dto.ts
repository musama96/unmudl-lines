import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class PostIdDto {
  @ApiProperty({ description: 'Id of the post' })
  @IsMongoId(false, { message: responseMessages.post.postId })
  postId: string;
}
