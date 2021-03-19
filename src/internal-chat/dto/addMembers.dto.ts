import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId } from '../../common/validators';

export class AddMembersDto {
  @IsMongoId(false)
  chatId: string;

  @ApiProperty({ type: String })
  @IsArray(false)
  @IsMongoId(false, { message: responseMessages.common.invalidUserId, each: true })
  members: string[];
}
