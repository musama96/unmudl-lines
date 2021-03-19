import { IsString } from 'class-validator';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class AddCommentDto {
  @ApiProperty({ description: 'Id of the post' })
  @IsMongoId(false, { message: responseMessages.post.postId })
  employerPost: string;

  @ApiHideProperty()
  user?: string;

  @ApiHideProperty()
  employerAdmin?: string;

  @IsString()
  content: string;
}
