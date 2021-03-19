import { IsArray, IsMongoId } from '../../common/validators';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import responseMessages from '../../config/responseMessages';

export class AddMembersDto {
  @IsMongoId(false)
  chatId: string;

  @ApiProperty()
  @IsArray(false, { message: responseMessages.common.invalidUserIds })
  @IsMongoId(false, { message: responseMessages.common.invalidUserId, each: true })
  users: string[];

  @ApiProperty()
  @IsArray(false, { message: responseMessages.common.invalidEmployerAdminIds })
  @IsMongoId(false, { message: responseMessages.common.invalidEmployerAdminId, each: true })
  employerAdmins: string[];

  @ApiProperty()
  @IsMongoId(true, { message: responseMessages.common.invalidUserId })
  learner: string;

  replaceExistingUsers?: boolean;
  replaceExistingEmployerAdmins?: boolean;
}
