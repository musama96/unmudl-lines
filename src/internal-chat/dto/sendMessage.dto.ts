import { IsString } from 'class-validator';
import { ApiHideProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class SendMessageDto {
  @IsMongoId(true)
  chatId: string;

  @IsString()
  message: string;

  @ApiHideProperty()
  from?: string;
}
