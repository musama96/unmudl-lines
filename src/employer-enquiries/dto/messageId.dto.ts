import { ApiHideProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class MessageIdDto {
  @IsMongoId(false)
  messageId: string;

  @ApiHideProperty()
  userId?: string;

  @ApiHideProperty()
  employerAdminId?: string;
}
