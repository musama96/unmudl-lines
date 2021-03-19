import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../validators/index';

export class UserIdDto {
  @ApiProperty()
  @IsMongoId(true, { message: responseMessages.common.invalidUserId })
  userId: string;
}
