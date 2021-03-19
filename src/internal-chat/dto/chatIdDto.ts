import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class ChatIdDto {
  @ApiProperty()
  @IsMongoId(false)
  chatId: string;

  @ApiHideProperty()
  userId?: string;

  @ApiHideProperty()
  user?: any;

  @ApiHideProperty()
  learnerId?: string;
}
