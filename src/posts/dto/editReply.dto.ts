import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class EditReplyDto {
  @ApiProperty({ description: 'Id of the reply' })
  @IsMongoId(false, { message: responseMessages.post.replyId })
  replyId: string;

  @IsString()
  content: string;
}
