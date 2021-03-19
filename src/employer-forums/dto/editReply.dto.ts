import { IsString } from 'class-validator';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class EditReplyDto {
  // @ApiProperty({ description: 'Id of the reply' })
  // @IsMongoId(false, { message: responseMessages.post.replyId })
  // replyId: string;
  @ApiHideProperty()
  replyId?: any;

  @ApiHideProperty()
  user?: any;

  @ApiHideProperty()
  employerAdmin?: any;

  @IsString()
  content: string;
}
