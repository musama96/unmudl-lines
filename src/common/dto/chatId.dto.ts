import { IsMongoId } from '../../common/validators';
import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';

export class ChatIdDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidChatId })
  id?: string;
}
