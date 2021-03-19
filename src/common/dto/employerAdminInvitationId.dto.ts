import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class EmployerAdminInvitationIdDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidEmployerAdminInvitationId })
  invitationId?: string;
}
